import sys
import os
import unittest
from unittest.mock import MagicMock

# Add root to sys.path
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '../..')))

from backend.ml.learning.enforcement_outcome_model import EnforcementOutcomeModel
from backend.ml.suggestion.suggestion_engine import SuggestionEngine

class TestEnforcementLearning(unittest.TestCase):
    
    def setUp(self):
        # Reset model state
        EnforcementOutcomeModel._model_state = {}

    def test_outcome_updates(self):
        print("=== Test: Enforcement Outcome Learning ===")
        
        action = "CAPTCHA"
        
        # 1. Initial State: Neutral score
        score_initial = EnforcementOutcomeModel.get_effectiveness_score(action, {})
        print(f"Initial Score: {score_initial}")
        self.assertEqual(score_initial, 0.0)
        
        # 2. Simulate Beneficial Outcome (Risk Drop)
        features = {
            "action_type": action,
            "risk_drop": 50.0,
            "false_positive_report": False
        }
        EnforcementOutcomeModel.update(features)
        
        # 3. Check Score Increase
        score_after = EnforcementOutcomeModel.get_effectiveness_score(action, {})
        print(f"After Beneficial: {score_after}")
        self.assertGreater(score_after, 0.0)
        
        # 4. Simulate False Positives (Heavy Penalty)
        fp_features = {
            "action_type": action,
            "risk_drop": 0.0,
            "false_positive_report": True
        }
        for _ in range(2): 
            EnforcementOutcomeModel.update(fp_features)
            
        score_fp = EnforcementOutcomeModel.get_effectiveness_score(action, {})
        print(f"After False Positives: {score_fp}")
        self.assertLess(score_fp, score_after)
        
        print(">>> PASS: Model learns weights dynamics.")

    def test_suggestion_ranking(self):
        print("=== Test: Suggestion Ranking ===")
        
        # Setup: Make captcha bad, rate_limit good
        # NOTE: ActionType values seem to be lowercase based on failure 'captcha'
        EnforcementOutcomeModel._model_state = {
            "captcha": {"b": 0, "n": 0, "h": 10}, # Many FP
            "rate_limit": {"b": 10, "n": 0, "h": 0} # Good
        }
        
        probs = {"web": 0.8}
        
        # Act
        suggestions = SuggestionEngine.suggest(probs, {})
        print(f"Suggestions: {suggestions}")
        
        # Rate Limit should be first
        self.assertEqual(suggestions[0], "rate_limit")
        self.assertTrue("captcha" in suggestions)
        # Check relative order
        self.assertLess(suggestions.index("rate_limit"), suggestions.index("captcha"))
        
        print(">>> PASS: Suggestions re-ranked based on learning.")

if __name__ == '__main__':
    unittest.main()
