
import sys
from pathlib import Path

# Add project root to sys.path
PROJECT_ROOT = Path(__file__).resolve().parent.parent.parent
if str(PROJECT_ROOT) not in sys.path:
    sys.path.insert(0, str(PROJECT_ROOT))

from models.decision_engine.recommendation import recommend_action

class RecommendationService:
    @staticmethod
    def get_recommendation(row_context: dict):
        """
        Returns the recommended action for a session.
        """
        return recommend_action(row_context)
