import sys
import os
import unittest

# Add root to sys.path
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '../..')))

from backend.enforcement.state_machine.enforcement_state_machine import EnforcementState, EnforcementStateMachine

class TestStateMachineStrictness(unittest.TestCase):
    
    def test_strict_flow(self):
        print("=== Test: State Machine Strictness ===")
        
        # 1. Valid Flow
        current = EnforcementState.CREATED
        next_s = EnforcementState.PENDING
        EnforcementStateMachine.validate_transition(current, next_s)
        
        current = EnforcementState.PENDING
        next_s = EnforcementState.APPROVED
        EnforcementStateMachine.validate_transition(current, next_s)
        
        current = EnforcementState.APPROVED
        next_s = EnforcementState.EXECUTING
        EnforcementStateMachine.validate_transition(current, next_s)
        
        current = EnforcementState.EXECUTING
        next_s = EnforcementState.COMPLETED
        EnforcementStateMachine.validate_transition(current, next_s)
        
        print(">>> PASS: Valid SOC Lifecycle accepted.")
        
    def test_invalid_jumps(self):
        # 1. Created -> Executing (Skip Pending/Approved) -> FAIL
        with self.assertRaises(ValueError):
             EnforcementStateMachine.validate_transition(EnforcementState.CREATED, EnforcementState.EXECUTING)
             
        # 2. Completed -> Pending (Reversal) -> FAIL
        with self.assertRaises(ValueError):
             EnforcementStateMachine.validate_transition(EnforcementState.COMPLETED, EnforcementState.PENDING)
             
        print(">>> PASS: Invalid jumps rejected.")

if __name__ == '__main__':
    unittest.main()
