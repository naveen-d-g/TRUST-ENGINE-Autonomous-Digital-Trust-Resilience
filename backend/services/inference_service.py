from backend.ml.inference_pipeline import evaluate_single_session
from backend.extensions import db
from backend.db.models import Session
from backend.models.session_metric import SessionMetric
from datetime import datetime

from backend.services.observation_service import SessionStateEngine
from backend.audit.audit_log import AuditLogger
import json

class InferenceService:
    @staticmethod
    def evaluate_session(request_data: dict):
        """
        Orchestrate the evaluation of a session and persist to DB.
        request_data: dict containing 'features', 'session_id', 'user_id'
        """
        features = request_data.get("features", {})
        session_id = request_data.get("session_id")
        user_id = request_data.get("user_id")

        # Inject context if needed by pipeline
        features["session_id"] = session_id
        features["user_id"] = user_id
        
        # 1. Run Pipeline
        result = evaluate_single_session(features)
        
        # 🧪 SIMULATION: Apply forced risk score if present
        force_risk = request_data.get("force_risk_score")
        if force_risk is not None:
             result.risk_score = float(force_risk)
             # Infer decision from forced score
             if result.risk_score >= 80: result.decision = "ESCALATE"
             elif result.risk_score >= 50: result.decision = "RESTRICT"
             else: result.decision = "ALLOW"
             
             # Add to explanation
             result.explanation["primary_cause"] = "Simulated Attack (Forced Risk)"
             
             try:
                 # 🧠 LLM REASONING LOOKUP
                 import json
                 import os
                 # Path: backend/data/incident_playbooks.json relative to backend/services/inference_service.py
                 playbook_path = os.path.join(os.path.dirname(os.path.dirname(__file__)), 'data', 'incident_playbooks.json')
                 
                 if os.path.exists(playbook_path):
                     with open(playbook_path, 'r') as f:
                         playbooks = json.load(f)
                     
                     # Try to match recommendation text to playbook key
                     force_rec = request_data.get("force_recommendation")
                     matched_entry = None
                     
                     if force_rec:
                         for key, entry in playbooks.items():
                             # Match if key is in rec text (e.g. "Ransomware" in "EMERGENCY: Ransomware...")
                             if key in force_rec:
                                 matched_entry = entry
                                 break
                     
                     if matched_entry:
                         result.explanation["reasoning"] = matched_entry.get("reasoning")
                         result.explanation["ai_suggestion"] = matched_entry.get("suggestion")
                         result.explanation["context"] = matched_entry.get("usage_context")

             except Exception as e:
                 print(f"Playbook lookup failed: {e}")
             


        # Force Recommendation if provided (Independent of risk override)
        force_rec = request_data.get("force_recommendation")
        if force_rec:
             # Ensure it overrides any default "No specific recovery action"
             result.explanation["recovery_advice"] = [{"action": force_rec, "priority": "CRITICAL"}]
        
        # 2. Update In-Memory Risk History (CRITICAL for Velocity)
        SessionStateEngine.update_risk_history(session_id, result.risk_score)
        
        metrics_data = result.metadata.get("metrics", {})

        # 3. Persist to Database
        try:
            import json
            
            # Check if session exists
            existing_session = Session.query.filter_by(session_id=session_id).first()
            
            # Include LLM reasoning in risk_reasons
            risk_reasons_data = result.explanation.get("contributing_factors", [])
            
            # Append playbook context if available
            if result.explanation.get("reasoning"):
                risk_reasons_data.append(f"Reasoning: {result.explanation['reasoning']}")
            if result.explanation.get("context"):
                 risk_reasons_data.append(f"Context: {result.explanation['context']}")

            risk_reasons_json = json.dumps(risk_reasons_data)
            
            if existing_session:
                # Update Existing
                existing_session.trust_score = 100.0 - result.risk_score # approximate trust
                existing_session.final_decision = result.decision
                existing_session.primary_cause = result.explanation.get("primary_cause", "Unknown")
                existing_session.recommended_action = result.explanation.get("recovery_advice", [{}])[0].get("action", "monitor") if result.explanation.get("recovery_advice") else "monitor"
                existing_session.session_duration_sec = int(features.get("session_duration_sec", 0))
                existing_session.risk_reasons = risk_reasons_json
                # Don't overwrite created_at or user_id (unless we want to update user binding)
                if user_id: existing_session.user_id = user_id
            else:
                # Create New
                new_session = Session(
                    session_id=session_id,
                    user_id=user_id,
                    trust_score=100.0 - result.risk_score,
                    final_decision=result.decision,
                    primary_cause=result.explanation.get("primary_cause", "Unknown"),
                    recommended_action=result.explanation.get("recovery_advice", [{}])[0].get("action", "monitor") if result.explanation.get("recovery_advice") else "monitor",
                    ip_address=features.get("ip_address", "0.0.0.0"),
                    session_duration_sec=int(features.get("session_duration_sec", 0)),
                    risk_reasons=risk_reasons_json
                )
                db.session.add(new_session)

            
            # Create Metrics (Always append new metrics for history)
            # metrics_data already extracted above from result.metadata
            
            new_metrics = SessionMetric(
                session_id=session_id,
                bot_probability=metrics_data.get("bot_probability", 0),
                attack_probability=metrics_data.get("attack_probability", 0),
                anomaly_score=metrics_data.get("anomaly_score", 0),
                risk_score=metrics_data.get("risk_score", 0),
                anomaly_amplified=metrics_data.get("anomaly_amplified", False),
                web_abuse_probability=metrics_data.get("web_abuse_probability", 0),
                api_abuse_probability=metrics_data.get("api_abuse_probability", 0),
                network_anomaly_score=metrics_data.get("network_anomaly_score", 0),
                infra_stress_score=metrics_data.get("infra_stress_score", 0)
            )
            db.session.add(new_metrics)

            # Create Audit Log
            # 5. Persistent Audit (Unified Audit Logger)
            audit_logger = AuditLogger()
            audit_logger.append({
                "action": "SESSION_EVALUATION",
                "incident_id": session_id,
                "actor": user_id or "SYSTEM",
                "role": "ANALYST", # Default for evaluation logs
                "details": {
                    "decision": result.decision,
                    "primary_cause": result.explanation.get("primary_cause"),
                    "risk_score": result.risk_score,
                    "trust_score": 100.0 - result.risk_score
                }
            })

            db.session.commit()
        except Exception as e:
            db.session.rollback()
            # We log the error but return the result to the user so the service isn't blocked by DB issues
            print(f"Database Persistence Error: {str(e)}")
        
        return result.to_dict()
