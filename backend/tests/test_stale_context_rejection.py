import sys
import os
import unittest
import time

# Add root to sys.path
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '../..')))

from backend.enforcement.state.proposal_registry import ProposalRegistry, ProposalState, EnforcementStateMachine, EnforcementState
from backend.orchestration.execution_context import ExecutionContext

class TestStaleContextRejection(unittest.TestCase):
    def test_proposal_expiry(self):
        print("=== Test: Stale Context Rejection ===")
        
        # 1. Register Proposal with short TTL
        # We need to monkeypath TTL or wait. Let's monkeypatch for speed.
        ProposalRegistry.PROPOSAL_TTL = 1 # 1 second TTL
        
        ctx = ExecutionContext(session_id="stale_sess", risk_score=50)
        pid = ProposalRegistry.register_proposal(ctx, "CAPTCHA")
        
        print(f"Registered Proposal {pid}")
        
        # 2. Wait for expiry
        time.sleep(1.1)
        
        # 3. Try to update status (should fail or cleanup should happen)
        # Note: cleanup happens on next register call usually, or we can check status logic.
        # But EnforcementStateMachine doesn't auto-check time, Registry does.
        
        # Let's clean explicitly or check retrieval
        ProposalRegistry._cleanup()
        prop_after = ProposalRegistry.get_proposal(pid)
        
        self.assertIsNone(prop_after)
        print(">>> PASS: Stale proposal removed from registry.")
        
        # 4. If we tried to execute it using a held reference?
        # Simulate race: we have the ID, try to update it.
        # Since it's gone, update_status does nothing or raises (our impl does nothing key check)
        
        ProposalRegistry.update_status(pid, EnforcementState.APPROVED)
        # Verify it wasn't re-added or phantom approved
        self.assertIsNone(ProposalRegistry.get_proposal(pid))
        print(">>> PASS: Cannot update status of expired proposal.")

    def tearDown(self):
        ProposalRegistry.PROPOSAL_TTL = 3600 # Reset

if __name__ == '__main__':
    unittest.main()
