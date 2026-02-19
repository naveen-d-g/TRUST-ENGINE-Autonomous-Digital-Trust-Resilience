import logging
import json
from datetime import datetime
from backend.extensions import db, socketio
from backend.db.models import MonitoringEvent, AuditLog
from backend.monitoring.feature_builder import FeatureBuilder
from backend.core.recommendationEngine import RecommendationEngine
from backend.core.trustDecisionEngine import TrustDecisionEngine

# Placeholder for ML Engine if specific one not available easily
class MockMLEngine:
    def evaluate(self, features):
        score = 0
        if features.get("domain") == "WEB":
            score += features.get("sqli_count", 0) * 50
            score += features.get("xss_count", 0) * 40
        elif features.get("domain") == "API":
             score += features.get("5xx_rate", 0) * 100
        elif features.get("domain") == "NETWORK":
             score += features.get("packet_spike", 0) * 60
        elif features.get("domain") == "SYSTEM":
             score += features.get("cpu_spike", 0) * 30
        
        return min(100, score)

ml_engine = MockMLEngine()

class DomainConsumer:
    def __init__(self, domain):
        self.domain = domain
        self.logger = logging.getLogger(f"{domain}_Consumer")
        self.decision_engine = TrustDecisionEngine() # Session passed later? No, it's static-ish

    def process_event(self, event):
        """
        Standard Pipeline:
        1. Validate Schema (Implied by getting here)
        2. Session Ingest (Skipped for now, assuming stateless or simple session lookup)
        3. Feature Build
        4. ML Evaluate
        5. Decision
        6. Suggestion
        7. DB Save
        8. Audit
        9. Broadcast
        """
        try:
            # 3. Feature Build
            features = FeatureBuilder.build(event, None)
            
            # 4. ML Evaluate
            risk_score = ml_engine.evaluate(features)
            
            # 5. Decision
            # Heuristic mapping for now
            decision = "ALLOW"
            if risk_score > 80:
                decision = "ESCALATE"
            elif risk_score > 50:
                decision = "RESTRICT"
                
            # 6. Suggestion
            suggestion = RecommendationEngine.recommend(decision, features)
            
            # 7. DB Save
            new_event = MonitoringEvent(
                event_id=event.get("event_id"),
                domain=self.domain,
                session_id=event.get("session_id"),
                actor_id=event.get("actor_id"),
                ip=event.get("ip"),
                route=event.get("route"),
                risk_score=risk_score,
                decision=decision,
                suggestion=suggestion,
                timestamp=datetime.fromisoformat(event.get("timestamp")),
                payload=event.get("payload")
            )
            db.session.add(new_event)
            db.session.commit()
            
            # 8. Audit (Simplified)
            # 9. Broadcast
            socketio.emit(f"{self.domain.lower()}_event", {
                "event": event,
                "risk": risk_score,
                "decision": decision,
                "suggestion": suggestion
            }, namespace="/live")
            
            self.logger.info(f"Processed {self.domain} event: {decision}")
            return new_event

        except Exception as e:
            self.logger.error(f"Error processing event: {e}")
            db.session.rollback()
            return None
