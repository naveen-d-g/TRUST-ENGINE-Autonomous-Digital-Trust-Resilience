
import json
import uuid
from datetime import datetime
from backend.database.db import db
from backend.database.models import DemoSession, DemoEvent, User
from backend.ml.inference_pipeline import evaluate_single_session
from backend.services.ingestion_service import IngestionService

class DemoService:
    @staticmethod
    def start_demo(user_id):
        """
        Starts a new isolated demo session.
        If user_id is provided, links to that user.
        If None (anonymous), links to a default 'demo_user'.
        """
        if not user_id:
            # Anonymous Demo: Use or create a default demo user
            user = User.query.filter_by(email="demo@example.com").first()
            if not user:
                # Create default demo user
                user = User(
                    user_id="demo_user",
                    email="demo@example.com",
                    role="viewer",
                    created_at=datetime.utcnow()
                )
                user.set_password("demo123")
                db.session.add(user)
                db.session.commit()
            user_id = user.user_id
        else:
            user = User.query.get(user_id)
            if not user:
                raise ValueError("User not found")
        
        sim_id = f"demo_{uuid.uuid4().hex[:8]}"
        
        session = DemoSession(
            demo_session_id=sim_id,
            user_id=user_id,
            start_time=datetime.utcnow(),
            final_trust_score=100.0,
            final_decision="ALLOW", # Default start
            status="ACTIVE"
        )
        
        db.session.add(session)
        db.session.commit()
        
        return session.to_dict()

    @staticmethod
    def record_event(demo_id, event_type, metadata=None):
        """
        Records interaction, runs ML, returns simplified decision for Viewer.
        """
        if metadata is None:
            metadata = {}
            
        session = DemoSession.query.get(demo_id)
        if not session:
            raise ValueError("Demo session not found")
            
        if session.status != "ACTIVE":
            raise ValueError("Demo session is closed")

        # 0. Intercept Credential Validation (Special for Demo)
        credential_check_failed = False
        if "LOGIN" in event_type and "password" in metadata and "email" in metadata:
             email = metadata.pop("email") # Remove from log
             password = metadata.pop("password") # Remove from log 
             
             # Verify against DB
             user = User.query.filter_by(email=email).first()
             if not user or not user.check_password(password):
                 credential_check_failed = True
                 event_type = "FAILED_LOGIN" # Force fail type
                 metadata["failure_reason"] = "Invalid Credentials"
             else:
                 # Valid credentials
                 event_type = "LOGIN_ATTEMPT"
                 metadata["auth_status"] = "Valid"

        # 1. Log Event (Password stripped above)
        event = DemoEvent(
            demo_session_id=demo_id,
            event_type=event_type,
            timestamp=datetime.utcnow(),
            details=json.dumps(metadata)
        )
        db.session.add(event)
        db.session.commit()
        
        # 1.5 Send to Live Monitor (Analyst visibility)
        try:
            live_payload = {
                "session_id": f"LIVE_{demo_id}",
                "user_id": metadata.get("email" if "email" in metadata else "demo_user"),
                "status": "success" if not credential_check_failed else "failed",
                "risk_score": 0.0, # Will be calculated by ingestion pipeline
                "source": "login_demo",
                "timestamp": datetime.utcnow().isoformat()
            }
            IngestionService.ingest_auth_event(live_payload)
        except Exception as e:
            # Don't fail the demo if live monitor ingestion fails
            print(f"Failed to ingest demo event to live monitor: {e}")
        
        # 2. Replay for ML Analysis
        all_events = DemoEvent.query.filter_by(demo_session_id=demo_id).order_by(DemoEvent.timestamp).all()
        features = DemoService._aggregate_features(all_events)
        
        # 3. Run Inference
        model_result = evaluate_single_session(features)
        
        # 4. Immediate Credential Failure Override
        if credential_check_failed:
             model_result["final_decision"] = "RESTRICT"
             model_result["risk_reasons"] = ["Invalid Credentials"]
        
        # 5. Update core session
        session.final_trust_score = model_result["trust_score"]
        session.final_decision = model_result["final_decision"]
        db.session.commit()
        
        # 6. Return SIMPLIFIED result to Viewer
        requires_captcha = False
        # Only require captcha if login was otherwise successful but risky? 
        # User requirement: "if correct -> next. if incorrect -> restrict, no captcha"
        # User also said: "captcha should be triggered for all the demo login everytime" (previous req)
        # New req: "when email or password is incorrect then restrict, no need for captcha next."
        
        if not credential_check_failed and "LOGIN" in event_type: 
             # Force CAPTCHA for the demo to show behavioral flow
             requires_captcha = True
             
        return {
            "decision": model_result["final_decision"],
            "requires_captcha": requires_captcha 
        }

    @staticmethod
    def end_demo(demo_id):
        session = DemoSession.query.get(demo_id)
        if not session:
            raise ValueError("Session not found")
            
        session.end_time = datetime.utcnow()
        session.status = "COMPLETED"
        db.session.commit()
        
        return {
            "final_decision": session.final_decision,
            "message": f"Session finished. Decision: {session.final_decision}"
        }

    @staticmethod
    def get_all_demo_sessions(limit=50, offset=0):
        """
        For Admin/Analyst to view demo sessions.
        """
        sessions = DemoSession.query.order_by(DemoSession.start_time.desc()).offset(offset).limit(limit).all()
        return [s.to_dict() for s in sessions]

    @staticmethod
    def get_demo_details(demo_id):
        """
        Full details for Admin.
        """
        session = DemoSession.query.get(demo_id)
        if not session:
            return None
            
        events = DemoEvent.query.filter_by(demo_session_id=demo_id).order_by(DemoEvent.timestamp).all()
        
        # Run final analysis to get the full "Explainabilty" object
        features = DemoService._aggregate_features(events)
        analysis = evaluate_single_session(features)
        
        return {
            "session": session.to_dict(),
            "timeline": [e.to_dict() for e in events],
            "analysis": analysis # Contains risk reasons, primary cause, etc.
        }

    @staticmethod
    def _aggregate_features(events):
        """
        Similar to simulation logic, maps raw events to ML features.
        """
        features = {
            "failed_login_attempts": 0,
            "captcha_passed": True, 
            "headless_browser_flag": False,
            "session_duration_sec": 0,
            "request_rate_per_min": 0,
            "navigation_entropy": 3.0, 
            "bot_probability": 0.0,
            "base_trust_score": 100.0
        }
        
        if not events:
            return features
            
        start_time = events[0].timestamp
        
        for event in events:
             # Duration
            features["session_duration_sec"] = (event.timestamp - start_time).total_seconds()
            
            typ = event.event_type
            details = {}
            if event.details:
                try: 
                    details = json.loads(event.details)
                except: 
                    pass
            
            # Map Events to Features
            if typ == "FAILED_LOGIN":
                features["failed_login_attempts"] += 1
            if typ == "CAPTCHA_FAIL":
                features["captcha_passed"] = False
            if typ == "CAPTCHA_SUCCESS":
                features["captcha_passed"] = True
            if typ == "BOT_BEHAVIOR":
                features["headless_browser_flag"] = True
                features["navigation_entropy"] = 0.5
            
            # Allow force override from frontend for demo purposes if needed
            # (Though strictly this should be inferred, for a demo sometimes we cheat slightly to ensure effect)
            if "force_features" in details:
                for k,v in details["force_features"].items():
                    features[k] = v
                    
        return features
