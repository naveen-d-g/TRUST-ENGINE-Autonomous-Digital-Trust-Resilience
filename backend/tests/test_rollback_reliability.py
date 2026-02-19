import sys
import os
import unittest
import time

# Add root to sys.path
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '../..')))

from backend.enforcement.rollback_manager import RollbackManager
from backend.audit.audit_log import AuditLogger

class TestRollbackReliability(unittest.TestCase):
    def test_manual_rollback(self):
        print("=== Test: Rollback Reliability ===")
        
        proposal = {
            "id": "rollback_test_1",
            "suggested_action": "BLOCK_IP",
            "session_id": "1.2.3.4",
            "executed_at": time.time() - 100 # old time
        }
        
        # 1. Analyst Rollback
        # Act
        success = RollbackManager.execute_rollback(proposal, "Manual Mistake Correction")
        
        self.assertTrue(success)
        print(">>> PASS: Rollback executed successfully.")
        
if __name__ == '__main__':
    unittest.main()
