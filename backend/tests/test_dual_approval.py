import sys
import os
import unittest
from unittest.mock import MagicMock

# Add root to sys.path
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '../..')))

from backend.enforcement.approval_workflow import ApprovalWorkflow

class TestDualApproval(unittest.TestCase):
    
    def test_role_validation(self):
        print("=== Test: Dual Approval Role Validation ===")
        
        # 1. Analyst attempting Critical Action -> FAIL
        proposal_crit = {"suggested_action": "REVOKE_TOKEN"}
        can_approve = ApprovalWorkflow.validate_approval(proposal_crit, "analyst")
        self.assertFalse(can_approve, "Analyst should NOT approve Critical Action")
        
        # 2. Admin attempting Critical Action -> PASS
        can_approve_admin = ApprovalWorkflow.validate_approval(proposal_crit, "admin")
        self.assertTrue(can_approve_admin, "Admin SHOULD approve Critical Action")
        
        # 3. Analyst attempting Low Risk -> PASS
        proposal_low = {"suggested_action": "CAPTCHA"}
        can_approve_low = ApprovalWorkflow.validate_approval(proposal_low, "analyst")
        self.assertTrue(can_approve_low, "Analyst CAN approve Low Risk Action")
        
        print(">>> PASS: Roles enforced correctly.")

    def test_justification_requirement(self):
        print("=== Test: Justification Requirement ===")
        
        proposal = {"suggested_action": "BLOCK_IP"}
        
        # 1. Empty Justification -> FAIL
        with self.assertRaises(ValueError):
            ApprovalWorkflow.sign_approval(proposal, "user1", "admin", "")
            
        # 2. Short Justification -> FAIL
        with self.assertRaises(ValueError):
            ApprovalWorkflow.sign_approval(proposal, "user1", "admin", "ok")
            
        # 3. Valid Justification -> PASS
        res = ApprovalWorkflow.sign_approval(proposal, "user1", "admin", "Malicious activity confirmed via logs")
        self.assertEqual(res["approval_justification"], "Malicious activity confirmed via logs")
        
        print(">>> PASS: Justification enforced.")

if __name__ == '__main__':
    unittest.main()
