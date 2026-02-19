import sys
import os
import unittest
from unittest.mock import patch

# Add root to sys.path
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '../..')))

from backend.enforcement.enforcement_engine import EnforcementEngine
from backend.orchestration.execution_context import ExecutionContext

class TestMLImmutability(unittest.TestCase):
    def test_no_ml_recompute(self):
        print("=== Test: ML Immutability ===")
        
        ctx = ExecutionContext(session_id="immut_sess", risk_score=50)
        
        # We need to verify that calling Enforcement does NOT import or call InferencePipeline
        # We can inspect sys.modules or mock InferencePipeline and assert not called.
        
        with patch('backend.ml.inference_pipeline.evaluate_session') as mock_predict:
            
            # Run Enforcement (which does logic)
            # We mock policy to return NONE to be fast, or ACTION.
            with patch('backend.governance.enforcement_policy_engine.EnforcementPolicyEngine.evaluate') as mock_policy:
                mock_policy.return_value = ("CAPTCHA", False)
                
                EnforcementEngine.handle_enforcement_request(ctx)
                
            # Assert ML predict validation
            mock_predict.assert_not_called()
            print(">>> PASS: ML Prediction was NOT triggered by Enforcement.")
            
        # Also verify context risk score is same
        self.assertEqual(ctx.risk_score, 50)
        print(">>> PASS: Risk Score wasn't modified.")

if __name__ == '__main__':
    unittest.main()
