import sys
import os
import unittest

# Add root to sys.path
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '../..')))

from backend.enforcement.failure.failure_classifier import EnforcementFailureClassifier, EnforcementFailureType

class TestEnforcementFailure(unittest.TestCase):
    
    def test_exception_classification(self):
        print("=== Test: Failure Classification ===")
        
        # 1. Timeout
        e1 = TimeoutError("Request timed out")
        res1 = EnforcementFailureClassifier.classify_exception(e1)
        self.assertEqual(res1, EnforcementFailureType.TIMEOUT)
        
        # 2. Dependency
        e2 = ConnectionError("Failed to connect to Firewall API")
        res2 = EnforcementFailureClassifier.classify_exception(e2)
        self.assertEqual(res2, EnforcementFailureType.DEPENDENCY_FAILURE)
        
        # 3. Generic Action
        e3 = ValueError("Invalid action params")
        res3 = EnforcementFailureClassifier.classify_exception(e3)
        self.assertEqual(res3, EnforcementFailureType.ACTION_FAILED)
        
        print(">>> PASS: Exceptions classified correctly.")

if __name__ == '__main__':
    unittest.main()
