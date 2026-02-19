from datetime import datetime
import json
from backend.extensions import db
from backend.models.session import Session
from backend.models.event import Event
from backend.models.user import User
from backend.ml.inference_pipeline import evaluate_single_session
import uuid
import hashlib
import random

class SimulationService:
    @staticmethod
    def start_simulation(user_id):
        """
        Starts a new standardized simulation session using V2 models.
        """
        if not user_id:
            user = User.query.filter_by(email="sim@example.com").first()
            if not user:
                user = User(
                    email="sim@example.com",
                    role="VIEWER"
                )
                from backend.security.password import hash_password
                user.password_hash = hash_password("sim123")
                db.session.add(user)
                db.session.commit()
            user_id = user.id
        
        sim_id = f"sess-sim-{uuid.uuid4().hex[:8]}"
        
        sim_session = Session(
            session_id=sim_id,
            user_id=str(user_id),
            created_at=datetime.utcnow(),
            last_seen=datetime.utcnow(),
            trust_score=100.0,
            final_decision="ALLOW"
        )
        
        db.session.add(sim_session)
        db.session.commit()
        
        return sim_session.to_dict()

    @staticmethod
    def record_event(session_id, event_type, metadata=None, recommended_action=None):
        """
        Records an event to the V2 Event table and updates Session state.
        """
        try:
            if metadata is None:
                metadata = {}
                
            session = Session.query.filter_by(session_id=session_id).first()
            if not session:
                raise ValueError("Session not found")
    
            # 1. Create V2 Event
            # Import enums from the correct module
            from backend.contracts.enums import DomainEnum, ActorTypeEnum
            
            # Mocking a contract for standardized insertion
            # Use SYSTEM_ERROR as the event_type since custom attack types aren't in the enum
            # The actual attack type is stored in the payload
            new_event = Event(
                event_id=str(uuid.uuid4()),
                session_id=session_id,
                domain="WEB",
                actor_type="USER",
                actor_id=session.user_id,
                tenant_id="DEFAULT_TENANT",
                ingestion_source="SECURITY_PLATFORM",
                event_type="API_CALL",
                payload={**metadata, "simulation_event_type": event_type},
                timestamp=datetime.utcnow(),
                # Include uuid in hash to ensure uniqueness even for identical payloads
                canonical_hash=hashlib.sha256(json.dumps({**metadata, "simulation_event_type": event_type, "nonce": str(uuid.uuid4())}, sort_keys=True).encode()).hexdigest(),
                ingested_at=datetime.utcnow()
            )
            db.session.add(new_event)
            db.session.flush()
    
            # 2. Re-run inference (Simulation mode)
            all_events = Event.query.filter_by(session_id=session_id).all()
            features = SimulationService._aggregate_features(all_events)
            features["is_simulation"] = True
            
            analysis_result = evaluate_single_session(features)
            
            # 3. Update Session State (Stateful Step-Down Logic)
            
            # A. Get current score
            current_trust = session.trust_score
            
            # B. Calculate Base Drop (Updated ranges per user request)
            base_drop = 0.0
            evt = event_type.upper()
            
            # High Severity: Brute Force, Cred Stuffing, Impossible Travel (Geo Hopping)
            if "BRUTE" in evt or "CREDENTIAL" in evt or "STUFFING" in evt or "GEO" in evt or "IMPOSSIBLE" in evt:
                 base_drop = float(random.randint(6, 12))
                 
            # Medium Severity: Failed Login, Captcha Failure, Bot Activity
            elif "FAILED_LOGIN" in evt or "CAPTCHA" in evt or "BOT" in evt:
                 base_drop = float(random.randint(8, 10))
                 
            # Password Reset - Specific logic for repetition
            elif "PASSWORD" in evt or "RESET" in evt:
                # Check if repeated in recent history
                recent_resets = sum(1 for e in all_events[:-1] if e.payload and "PASSWORD" in (e.payload.get("simulation_event_type", "") or "").upper())
                if recent_resets > 0:
                    base_drop = float(random.randint(5, 10))
                else:
                    base_drop = 0.0
                    
            # Normal - Explicit 0
            elif "NORMAL" in evt:
                base_drop = 0.0
                
            # Fallback for others (keep previous logic or 0)
            elif "ATTACK" in evt:
                 base_drop = 5.0
                
            # C. Volume Penalty
            volume_penalty = 0.0
            attempts = features.get("failed_login_attempts", 0)
            if attempts > 40:
                volume_penalty = 10.0
            elif attempts > 10:
                volume_penalty = 5.0
                
            # D. Repetition Penalty (Look at last 5 events before this one)
            repetition_penalty = 0.0
            # all_events includes the current one at the end
            recent_events = all_events[:-1][-5:] if len(all_events) > 1 else []
            same_count = sum(1 for e in recent_events if e.payload and e.payload.get("simulation_event_type") == event_type)
            # Reduced repetition penalty slightly since base drops are specific
            repetition_penalty = same_count * 1.5
            
            total_drop = base_drop + volume_penalty + repetition_penalty
            
            # E. Apply Drop
            new_trust = max(0.0, current_trust - total_drop)
            
            # Update Session
            session.trust_score = new_trust
            session.risk_score = 100.0 - new_trust
            
            # Derive decision from new score
            if new_trust < 30: activity_decision = "BLOCK"
            elif new_trust < 60: activity_decision = "CHALLENGE"
            else: activity_decision = "ALLOW"
            
            session.final_decision = activity_decision
            session.last_seen = datetime.utcnow()
            session.event_count = len(all_events)
            
            # Store Recommended Action (Prefer explicit from simulation, else use ML advice)
            if recommended_action and recommended_action != "monitor":
                session.recommended_action = recommended_action
            else:
                # Fallback to ML advice if no explicit action provided
                recovery_advice = analysis_result.explanation.get("recovery_advice", [])
                if recovery_advice:
                     # Take the highest priority action
                     session.recommended_action = recovery_advice[0].get("action")

            
            # Sync Analysis Result (for consistent return)
            analysis_result.risk_score = session.risk_score
            analysis_result.decision = session.final_decision
            
            db.session.commit()
            
            return {
                "event": new_event.to_dict(),
                "analysis": analysis_result
            }
        except Exception as e:
            import traceback
            traceback.print_exc()
            raise e

    @staticmethod
    def get_simulation_history(session_id, requestor_id, requestor_role):
        session = Session.query.filter_by(session_id=session_id).first()
        if not session:
            return None
            
        events = Event.query.filter_by(session_id=session_id).order_by(Event.timestamp).all()
        return {
            "session": session.to_dict(),
            "timeline": [e.to_dict() for e in events]
        }

    @staticmethod
    def _aggregate_features(events):
        """
        Replays the event stream to calculate cumulative features for the ML model.
        Calibrated for simulation environments.
        """
        features = {
            "failed_login_attempts": 0,
            "captcha_passed": True,
            "headless_browser_flag": False,
            "session_duration_sec": 0,
            "request_rate_per_min": 0,
            "navigation_entropy": 3.0,
            "bot_probability": 0.0,
            "base_trust_score": 100.0,
            "api_calls_count": 0,
            "error_rate": 0.0,
            "path_variance": 0
        }
        
        if not events:
            return features

        start_time = events[0].timestamp
        
        # --- SIMULATION OVERRIDE ---
        # Detect attack type from the latest events to inject "fake" high-risk signals
        sim_type = None
        for e in reversed(events):
            payload = e.payload or {}
            if "simulation_event_type" in payload:
                sim_type = payload["simulation_event_type"]
                break
                
        if sim_type:
            if "BRUTEFORCE" in sim_type:
                features["failed_login_attempts"] = 50
                features["login_velocity"] = 120.0
                features["request_rate_per_min"] = 600.0
                features["bot_probability"] = 0.95
            elif "SQL" in sim_type or "SQLI" in sim_type:
                features["scanner_signature_score"] = 1.0
                features["path_entropy"] = 5.0
                features["payload_size_mean"] = 500.0
                features["error_rate_4xx"] = 0.8
            elif "CREDENTIAL" in sim_type or "STUFFING" in sim_type:
                features["failed_login_attempts"] = 20
                features["credential_entropy"] = 0.8
                features["bot_probability"] = 0.85
        # ---------------------------
        page_visits = 0
        errors = 0
        paths = set()
            
        for event in events:
            # Update Duration (ensure at least 1s for rate math stability)
            duration = (event.timestamp - start_time).total_seconds()
            features["session_duration_sec"] = max(1.0, duration)
            
            # Parse details safely
            details = {}
            if event.payload:
                details = event.payload
            
            typ = event.event_type
            
            # Action-specific features
            if typ == "FAILED_LOGIN":
                features["failed_login_attempts"] += 1
                features["api_calls_count"] += 1
                errors += 1
                paths.add("/api/v1/auth/login")
            
            elif typ == "CAPTCHA_FAIL":
                features["captcha_passed"] = False
                features["api_calls_count"] += 1
                errors += 1
                paths.add("/api/v1/auth/captcha")
                
            elif typ == "BOT_NAVIGATION":
                features["headless_browser_flag"] = True
                features["navigation_entropy"] = 0.1
                features["api_calls_count"] += 2
                
            elif typ == "PAGE_VISIT":
                page_visits += 1
                features["api_calls_count"] += 1
                path = details.get("path", f"/page_{page_visits}")
                paths.add(path)
                
            elif typ == "PASSWORD_RESET":
                features["api_calls_count"] += 5
                paths.add("/auth/reset-password")
                
            # Internal feature overrides
            if "force_features" in details:
                for k, v in details["force_features"].items():
                    features[k] = v
                    
        # Derived metrics with simulation capping
        total_actions = len(events)
        features["error_rate"] = errors / total_actions
        features["path_variance"] = min(100, len(paths) * 20)
        
        # Calculate rate but cap it to avoid extreme model spikes in simulation
        raw_rate = (total_actions / features["session_duration_sec"]) * 60
        features["request_rate_per_min"] = min(80.0, raw_rate)
            
        return features
