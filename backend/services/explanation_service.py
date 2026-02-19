
import sys
from pathlib import Path

# Add project root to sys.path
PROJECT_ROOT = Path(__file__).resolve().parent.parent.parent
if str(PROJECT_ROOT) not in sys.path:
    sys.path.insert(0, str(PROJECT_ROOT))

from models.risk_engine.explanation import explain_row, select_primary_cause

class ExplanationService:
    @staticmethod
    def get_explanation(row_context: dict):
        """
        Returns risk reasons and primary cause for a session context.
        """
        reasons = explain_row(row_context)
        primary_cause = select_primary_cause(reasons)
        return {
            "risk_reasons": reasons,
            "primary_cause": primary_cause
        }
