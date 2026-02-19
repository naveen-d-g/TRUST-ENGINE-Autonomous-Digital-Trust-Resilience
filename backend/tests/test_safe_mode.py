import sys
import os
import unittest
from unittest.mock import MagicMock, patch

# Add root to sys.path
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '../..')))

from backend.governance.safe_mode import SafeMode
from backend.enforcement.enforcement_engine import EnforcementEngine
from backend.orchestration.execution_context import ExecutionContext

class TestSafeMode(unittest.TestCase):
    
    def setUp(self):
        SafeMode.disable_global_safe_mode()
        SafeMode._DISABLED_TENANTS.clear()

    def test_global_kill_switch(self):
        print("=== Test: Safe Mode Global Kill-Switch ===")
        
        ctx = ExecutionContext(session_id="unsafe_sess", risk_score=90)
        
        # 1. Enable Global Safe Mode
        SafeMode.enable_global_safe_mode()
        
        # 2. Mock Audit Logger to verify "SKIPPED" log
        with patch('backend.audit.audit_log.AuditLogger.log_system_event') as mock_log:
             EnforcementEngine.handle_enforcement_request(ctx)
             mock_log.assert_called_with("ENFORCEMENT_SKIPPED", "Safe Mode Enabled", "WARN")
             
        print(">>> PASS: Enforcement skipped when Global Safe Mode is ON.")

    def test_tenant_kill_switch(self):
        print("=== Test: Safe Mode Tenant Kill-Switch ===")
        
        ctx_t1 = ExecutionContext(session_id="sess_1", tenant_id="tenant_1")
        ctx_t2 = ExecutionContext(session_id="sess_2", tenant_id="tenant_2")
        
        # 1. Disable Tenant 1
        SafeMode.disable_tenant("tenant_1")
        
        # 2. Verify Tenant 1 Skipped
        with patch('backend.audit.audit_log.AuditLogger.log_system_event') as mock_log:
             EnforcementEngine.handle_enforcement_request(ctx_t1)
             mock_log.assert_called_with("ENFORCEMENT_SKIPPED", "Safe Mode Enabled", "WARN")

        # 3. Verify Tenant 2 Allowed (Mock Policy to avoid real execution logic)
        with patch('backend.governance.enforcement_policy_engine.EnforcementPolicyEngine.evaluate') as mock_policy:
            mock_policy.return_value = ("NONE", False) # Just passthrough
            
            with patch('backend.audit.audit_log.AuditLogger.log_system_event') as mock_log:
                EnforcementEngine.handle_enforcement_request(ctx_t2)
                mock_log.assert_not_called()
                
        print(">>> PASS: Enforcement skipped only for disabled tenant.")

if __name__ == '__main__':
    unittest.main()
