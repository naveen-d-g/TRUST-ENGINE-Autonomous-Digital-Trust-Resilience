import sys
import os
import unittest

# Add root to sys.path
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '../..')))

from backend.ml.recovery_learning.recovery_effectiveness_tracker import RecoveryEffectivenessTracker

class TestRecoveryEffectiveness(unittest.TestCase):
    
    def setUp(self):
        RecoveryEffectivenessTracker._stats = {}

    def test_tracker_scoring(self):
        print("=== Test: Recovery Effectiveness ===")
        
        type_a = "CAPTCHA"
        
        # 1. Neutral start
        self.assertEqual(RecoveryEffectivenessTracker.get_effectiveness_score(type_a), 0.5)
        
        # 2. Add SOLVED fast (Good)
        RecoveryEffectivenessTracker.track_outcome(type_a, "SOLVED", 5.0) # 5 seconds
        
        score_1 = RecoveryEffectivenessTracker.get_effectiveness_score(type_a)
        print(f"Score after Fast Solve: {score_1}")
        self.assertGreater(score_1, 0.5)
        
        # 3. Add Failed/Abandoned
        RecoveryEffectivenessTracker.track_outcome(type_a, "FAILED", 60.0)
        RecoveryEffectivenessTracker.track_outcome(type_a, "ABANDONED", 60.0)
        
        score_2 = RecoveryEffectivenessTracker.get_effectiveness_score(type_a)
        print(f"Score after Failures: {score_2}")
        self.assertLess(score_2, score_1)
        
        print(">>> PASS: Recovery scores track outcomes.")

if __name__ == '__main__':
    unittest.main()
