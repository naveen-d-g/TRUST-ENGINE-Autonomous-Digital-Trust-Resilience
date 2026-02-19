
import concurrent.futures
from typing import Dict, Any
from backend.institutional_memory.storage import MemoryRecorder
from backend.governance_intelligence.analyzer import OverrideAnalyzer
from backend.continuous_improvement.engine import RecommenderEngine

# ThreadPool for non-blocking execution
executor = concurrent.futures.ThreadPoolExecutor(max_workers=2)

def run_phase4_learning_async(session_id: str, decision: str, risk_score: float, features: Dict[str, Any]):
    """
    Fire-and-forget Phase 4 Learning Loop.
    """
    executor.submit(_execute_phase4, session_id, decision, risk_score, features)

def _execute_phase4(session_id: str, decision: str, risk_score: float, features: Dict[str, Any]):
    try:
        # 1. Institutional Memory Record
        # Summarize features for context
        context = {
            "user_id": features.get("user_id"),
            "ip": features.get("ip_address"),
            "risk": risk_score
        }
        MemoryRecorder.record_decision(session_id, decision, risk_score, context)
        
        # 2. Continuous Improvement Check (Periodic or probabilistic?)
        # For demo/verification, we can run a lightweight check
        # In prod, this would be a separate cron job.
        
        # insights = OverrideAnalyzer.analyze_overrides()
        # recs = RecommenderEngine.generate_recommendations(insights)
        # if recs:
        #     print(f"[PHASE 4] Generated {len(recs)} recommendations.")
            
    except Exception as e:
        print(f"Phase 4 Async Error: {e}")
