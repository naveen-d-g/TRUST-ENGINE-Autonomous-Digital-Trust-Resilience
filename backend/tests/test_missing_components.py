import sys
import os
import unittest
import time
from unittest.mock import MagicMock

# Add root to sys.path
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '../..')))

from backend.common.scope import EnforcementScope, EnforcementScopeResolver
from backend.enforcement.cooldown_manager import CooldownManager
from backend.incidents.incident_manager import IncidentManager
from backend.recovery.recovery_engine import RecoveryEngine

class TestMissingComponents(unittest.TestCase):
    
    def test_scope_resolution(self):
        print("=== Test: Scope Resolution ===")
        ctx_user = {"user_id": "u123", "session_id": "s1"}
        self.assertEqual(EnforcementScopeResolver.resolve_scope(ctx_user), EnforcementScope.USER)
        
        ctx_session = {"session_id": "s1"}
        self.assertEqual(EnforcementScopeResolver.resolve_scope(ctx_session), EnforcementScope.SESSION)
        print(">>> PASS: Scopes resolved correctly.")

    def test_cooldown_logic(self):
        print("=== Test: Cooldown Logic ===")
        CooldownManager._COOLDOWN_STORE.clear()
        
        target = "u123"
        action = "BLOCK"
        scope = EnforcementScope.USER
        
        # 1. First run -> Allowed
        self.assertTrue(CooldownManager.check_cooldown(action, target, scope))
        
        # 2. Record it
        CooldownManager.record_execution(action, target, scope)
        
        # 3. Second run -> Blocked
        self.assertFalse(CooldownManager.check_cooldown(action, target, scope))
        print(">>> PASS: Cooldown enforced.")

    def test_incident_grouping(self):
        print("=== Test: Incident Manager ===")
        
        # 1. Create Proposal 1
        p1 = {"id": "p1", "user_id": "u99", "severity": "LOW"}
        inc_id1 = IncidentManager.link_proposal_to_incident(p1)
        
        # 2. Create Proposal 2 (Same User)
        p2 = {"id": "p2", "user_id": "u99", "severity": "CRITICAL"}
        inc_id2 = IncidentManager.link_proposal_to_incident(p2)
        
        self.assertEqual(inc_id1, inc_id2, "Should group into same incident")
        
        inc = IncidentManager._INCIDENTS[inc_id1]
        self.assertEqual(len(inc["proposals"]), 2)
        self.assertEqual(inc["severity"], "CRITICAL", "Should escalate severity")
        print(">>> PASS: Incidents grouped and escalated.")

    def test_recovery_guidance(self):
        print("=== Test: Recovery Engine ===")
        plan = RecoveryEngine.generate_recovery_plan("i1", "FALSE_POSITIVE")
        self.assertIn("Apologize", plan[2])
        print(">>> PASS: Recovery plan generated.")

if __name__ == '__main__':
    unittest.main()
