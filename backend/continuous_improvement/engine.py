
from typing import List
from backend.governance_intelligence.models import GovernanceInsight
from backend.continuous_improvement.models import Recommendation

class RecommenderEngine:
    """
    Converts Insights into Actionable Recommendations.
    """
    
    @staticmethod
    def generate_recommendations(insights: List[GovernanceInsight]) -> List[Recommendation]:
        recs = []
        for insight in insights:
            if "Auth threshold" in insight.insight and insight.confidence > 0.8:
                recs.append(Recommendation(
                    action="ADJUST_THRESHOLD",
                    target="ESCALATE_THRESHOLD",
                    reason=insight.evidence,
                    priority="HIGH",
                    expected_gain="-10% False Positives"
                ))
            elif "Drift" in insight.insight:
                recs.append(Recommendation(
                    action="RETRAIN_MODEL",
                    target="RiskModel",
                    reason=insight.evidence,
                    priority="MEDIUM",
                    expected_gain="Model Freshness"
                ))
        return recs
