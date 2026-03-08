from flask import current_app
from backend.ml.inference_pipeline import evaluate_single_session
from backend.extensions import db
from backend.db.models import Session
from backend.models.session_metric import SessionMetric
from datetime import datetime

from backend.services.observation_service import SessionStateEngine
from backend.audit.audit_log import AuditLogger
from backend.incidents.incident_manager import IncidentManager
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
        features["is_simulation"] = True
        
        # 1. Run Pipeline
        result = evaluate_single_session(features)
        
        # 🧪 SIMULATION: Apply forced risk score if present
        force_risk = request_data.get("force_risk_score")
        force_primary = request_data.get("force_primary_cause")
        
        if force_risk is not None:
             result.risk_score = float(force_risk)
             # Infer decision from forced score
             if result.risk_score >= 90: 
                 result.decision = "TERMINATED"
             elif result.risk_score >= 50: 
                 result.decision = "ESCALATE"
             else: 
                 result.decision = "ALLOW"
             
             # Override Primary Cause
             if force_primary:
                 result.explanation["primary_cause"] = force_primary
             else:
                 result.explanation["primary_cause"] = "Simulated Attack (Forced Risk)"
             
             # 🧪 Distribute forced risk to domains for better dashboard visuals
             if "metrics" in result.metadata:
                 m = result.metadata["metrics"]
                 m["risk_score"] = float(force_risk)
                 prob = float(force_risk) / 100.0
                 if session_id.startswith("WEB_SIM_"): m["web_abuse_probability"] = prob
                 elif session_id.startswith("API_SIM_"): m["api_abuse_probability"] = prob
                 elif session_id.startswith("NETWORK_SIM_"): m["network_anomaly_score"] = prob
                 elif session_id.startswith("SYSTEM_SIM_"): m["infra_stress_score"] = prob
                 elif session_id.startswith("BOT_SIM_"): m["bot_probability"] = prob
             
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

        bot_detected = features.get("bot_detected", False)
        bot_reason = features.get("bot_reason", "")
        
        # Force Recommendation if provided (Independent of risk override)
        force_rec = request_data.get("force_recommendation")
        if force_rec:
             # Ensure it overrides any default "No specific recovery action"
             result.explanation["recovery_advice"] = [{"action": force_rec, "priority": "CRITICAL"}]
             
        if bot_detected:
             result.decision = "TERMINATE"
             result.explanation["primary_cause"] = "BOT ACTIVITY DETECTED"
             result.explanation["recovery_advice"] = [{"action": "Force Logout + Manual Password Reset Required", "priority": "CRITICAL"}]
        
        # 2. Update In-Memory Risk History (CRITICAL for Velocity)
        SessionStateEngine.update_risk_history(session_id, result.risk_score)
        
        # Drop future telemetry if this session is now dead
        if result.decision in ["TERMINATE", "TERMINATED", "BLOCK"]:
             SessionStateEngine.mark_terminated(session_id)
        
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
                existing_session.last_seen = datetime.utcnow()
                
                # Monotonic Risk: Don't allow trust to 'recover' from heartbeats if it hit a critical low
                new_trust = 100.0 - result.risk_score
                if existing_session.trust_score is not None:
                    existing_session.trust_score = min(existing_session.trust_score, new_trust)
                else:
                    existing_session.trust_score = new_trust
                    
                # Monotonic Decision: Once terminated/escalated, don't downgrade to allow/monitor
                severity_map = {"TERMINATED": 4, "TERMINATE": 4, "BLOCK": 4, "ESCALATE": 3, "RESTRICT": 2, "MONITOR": 1, "ALLOW": 0}
                current_severity = severity_map.get(existing_session.final_decision, 0)
                new_severity = severity_map.get(result.decision, 0)
                
                with open("inference_debug.log", "a") as f:
                    f.write(f"[{datetime.utcnow()}] Session {session_id}: Current {existing_session.final_decision}({current_severity}), New {result.decision}({new_severity})\n")
                
                if new_severity >= current_severity:
                    existing_session.final_decision = result.decision
                    # Also update primary cause if the new event is more severe or provides better detail
                    # IGNORE generic or simulation baseline labels if we already have a specific attack label
                    new_cause = result.explanation.get("primary_cause")
                    generic_causes = [
                        "Routine Activity", "Unknown", "baseline traffic", "Idle System", 
                        "Baseline Traffic", "Normal Page Visit", "Login Page Load", 
                        "Successful Login", "Authenticated Dashboard Activity", 
                        "Standard API Calls", "Unusual Outbound Packet"
                    ]
                    if new_cause and new_cause not in generic_causes:
                        existing_session.primary_cause = new_cause
                else:
                    with open("inference_debug.log", "a") as f:
                        f.write(f"[{datetime.utcnow()}] Monotonic Guard: Keeping {existing_session.final_decision} over {result.decision}\n")
                
                # Check for recovery advice override from simulation
                # Refine Monotonic Recommendation: Don't let generic "No specific recovery..." overwrite specific steps
                rec_action = existing_session.recommended_action or "monitor"
                if request_data.get("force_recommendation"):
                    rec_action = request_data.get("force_recommendation")
                elif result.explanation.get("recovery_advice"):
                    rec_candidate = result.explanation.get("recovery_advice", [{}])[0].get("action", "monitor")
                    # Only upgrade if candidate is not the generic ML default
                    generic_defaults = [
                        "monitor", 
                        "Continue monitoring for pattern evolution.",
                        "No specific recovery action needed. Monitor situation."
                    ]
                    if rec_candidate not in generic_defaults:
                        rec_action = rec_candidate
                
                existing_session.recommended_action = rec_action
                existing_session.session_duration_sec = int(features.get("session_duration_sec", 0))
                existing_session.risk_reasons = risk_reasons_json
                if bot_detected:
                    existing_session.bot_detected = True
                    existing_session.bot_reason = bot_reason
                # Don't overwrite created_at or user_id with anonymous/none if we already have a real identity
                if user_id and user_id != "anonymous": 
                    existing_session.user_id = user_id
            else:
                # Create New
                rec_action = "monitor"
                if request_data.get("force_recommendation"):
                    rec_action = request_data.get("force_recommendation")
                elif result.explanation.get("recovery_advice"):
                    rec_action = result.explanation.get("recovery_advice", [{}])[0].get("action", "monitor")

                new_session = Session(
                    session_id=session_id,
                    user_id=user_id,
                    trust_score=100.0 - result.risk_score,
                    final_decision=result.decision,
                    primary_cause=result.explanation.get("primary_cause", "Unknown"),
                    recommended_action=rec_action,
                    ip_address=features.get("ip_address", "0.0.0.0"),
                    session_duration_sec=int(features.get("session_duration_sec", 0)),
                    risk_reasons=risk_reasons_json,
                    bot_detected=bot_detected,
                    bot_reason=bot_reason
                )
                db.session.add(new_session)

            # Terminate and force password reset if bot detected or risk is critical
            if (bot_detected or result.decision in ["TERMINATE", "TERMINATED", "BLOCK"]) and user_id:
                from backend.db.models import User
                user_record = User.query.filter_by(username=user_id).first()
                if not user_record:
                    # User table might not be seeded with simulated users, so lazily create/update
                    user_record = User.query.filter_by(user_id=user_id).first()
                if user_record:
                    user_record.password_reset_required = True
                
                # Also notify the target app immediately
                try:
                    import requests
                    requests.post("http://localhost:3001/api/terminate", json={"session_id": session_id}, timeout=2.0)
                except Exception as ex:
                    print(f"Failed to call target app terminate webhook: {ex}")

            
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
            from backend.audit.audit_logger import AuditLogger
            AuditLogger.log_action(
                actor_id=user_id or "SYSTEM",
                action="SESSION_EVALUATION",
                target_id=session_id,
                payload={
                    "role": "ANALYST", # Default for evaluation logs
                    "decision": result.decision,
                    "primary_cause": result.explanation.get("primary_cause"),
                    "risk_score": result.risk_score,
                    "trust_score": 100.0 - result.risk_score
                }
            )

            db.session.commit()

            # 🧪 AUTO-TRIGGER INCIDENTS: If risk is critical, create/attach to incident
            # This ensures the SOC dashboard popup triggers correctly
            if result.risk_score >= 90:
                try:
                    import threading
                    # Get the underlying app object to pass into the thread safely
                    app = current_app._get_current_object()
                    
                    def trigger_inc(app_context_obj):
                        with app_context_obj.app_context():
                            try:
                                IncidentManager.correlate({
                                    "tenant_id": features.get("tenant_id", "default"),
                                    "risk_score": result.risk_score,
                                    "session_id": session_id,
                                    "actor_id": user_id
                                })
                            except Exception as e:
                                print(f"[Thread Error] Incident correlation failed: {e}")
                    
                    threading.Thread(target=trigger_inc, args=(app,), daemon=True).start()
                except Exception as inc_err:
                    print(f"Failed to offload incident trigger: {inc_err}")
        except Exception as e:
            db.session.rollback()
            # We log the error but return the result to the user so the service isn't blocked by DB issues
            print(f"Database Persistence Error: {str(e)}")
        
        # Format the response mapping to exactly what the frontend and routes expect
        formatted_result = result.to_dict()
        formatted_result["trust_score"] = 100.0 - result.risk_score
        formatted_result["final_decision"] = result.decision
        formatted_result["primary_cause"] = result.explanation.get("primary_cause", "Unknown")
        
        rec_action = "monitor"
        if request_data.get("force_recommendation"):
            rec_action = request_data.get("force_recommendation")
        elif result.explanation.get("recovery_advice"):
            rec_action = result.explanation.get("recovery_advice", [{}])[0].get("action", "monitor")
        
        formatted_result["recommended_action"] = rec_action
        
        if bot_detected:
            formatted_result["bot_detected"] = True
            formatted_result["bot_reason"] = bot_reason
        
        return formatted_result
