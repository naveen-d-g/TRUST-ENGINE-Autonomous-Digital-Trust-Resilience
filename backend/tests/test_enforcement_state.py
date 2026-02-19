import sys
import os
import time

# Add root to sys.path
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '../..')))

from backend.enforcement.state.proposal_registry import ProposalRegistry
from backend.orchestration.execution_context import ExecutionContext

def test_idempotency():
    print("=== Testing Enforcement Idempotency ===")
    
    context = ExecutionContext(
        session_id="session_dup_check",
        decision="RESTRICT",
        risk_score=80.0
    )
    
    print("1. Registering Proposal A...")
    pid1 = ProposalRegistry.register_proposal(context, "CAPTCHA")
    print(f"   PID1: {pid1}")
    
    print("2. Registering Proposal B (Same Context)...")
    pid2 = ProposalRegistry.register_proposal(context, "CAPTCHA")
    print(f"   PID2: {pid2}")
    
    assert pid1 == pid2
    print(">>> PASS: Duplicate proposal resulted in same ID.")
    
    print("3. Changing Risk Score (New Context)...")
    context_new = ExecutionContext(
        session_id="session_dup_check",
        decision="RESTRICT",
        risk_score=90.0 # Different bucket
    )
    pid3 = ProposalRegistry.register_proposal(context_new, "CAPTCHA")
    print(f"   PID3: {pid3}")
    
    # Note: If bucket logic allows small diffs, check implementation. 
    # Current impl uses int(risk_score) so 80 vs 90 is diff.
    assert pid1 != pid3
    print(">>> PASS: Different context created new ID.")
    
    print("=== Idempotency Test Complete ===")

if __name__ == "__main__":
    test_idempotency()
