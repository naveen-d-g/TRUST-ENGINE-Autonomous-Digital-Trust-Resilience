import pytest
from unittest.mock import MagicMock, patch
from backend.orchestration.execution_context import ExecutionContext
from backend.enforcement.enforcement_engine import EnforcementEngine
from backend.enforcement.state.proposal_registry import ProposalRegistry
from backend.enforcement.cooldown_manager import CooldownManager
from backend.incidents.incident_manager import IncidentManager
from backend.recovery.recovery_engine import RecoveryEngine
from backend.common.scope import EnforcementScope
from backend.audit.audit_log import AuditLogger

class TestSOCEndToEnd:
    
    def setup_method(self):
        # Reset Singletons/Global State
        CooldownManager._COOLDOWN_STORE = {}
        CooldownManager._VIOLATION_COUNTS = {}
        IncidentManager._INCIDENTS = {}
        IncidentManager._ACTIVE_SESSIONS = {}
        ProposalRegistry._PROPOSALS = {}
        ProposalRegistry._dedup_index = {}
        
        # Mock Dependencies that hit external systems
        self.audit_mock = MagicMock()
        AuditLogger.log_enforcement = self.audit_mock
        AuditLogger.log_system_event = self.audit_mock
        
        # Mock Policy Engine to return deterministic results
        self.policy_mock = MagicMock()
        
    @patch('backend.threat_model.threat_analyzer.ThreatAnalyzer.assess')
    @patch('backend.governance.enforcement_policy_engine.EnforcementPolicyEngine.evaluate')
    @patch('backend.enforcement.enforcement_actions.EnforcementActions.execute_action')
    def test_full_flow_auto_enforcement(self, mock_execute, mock_policy, mock_assess):
        """
        Scenario:
        1. Context created for high risk session.
        2. Policy evaluates to BLOCK (Auto).
        3. EnforcementEngine registers proposal.
        4. Cooldown checked (Pass).
        5. Action Executed (Success).
        6. Incident Created.
        7. Outcome Emitted.
        """
        # Setup
        context = ExecutionContext(
            session_id="session_e2e_1",
            user_id="user_e2e_1",
            ip_address="1.2.3.4",
            risk_score=90,
            tenant_id="tenant_1"
        )
        # Policy says BLOCK, Auto=True
        mock_policy.return_value = ("BLOCK", True)
        # Execution succeeds
        mock_execute.return_value = True
        
        # Threat Assessment Safe
        mock_assessment = MagicMock()
        mock_assessment.severity = "LOW"
        mock_assessment.to_dict.return_value = {
            "severity": "LOW",
            "blast_radius": {"affected_users": 1, "tenant_scope": False},
            "threats": []
        }
        mock_assess.return_value = mock_assessment
        
        # Execute
        EnforcementEngine.handle_enforcement_request(context)
        
        # Verify
        # 1. Incident Created
        incidents = IncidentManager.get_all_incidents()
        assert len(incidents) == 1
        incident = incidents[0]
        assert "session_e2e_1" in incident["targets"]["sessions"]
        
        # 2. Action Executed
        mock_execute.assert_called_once()
        
        # 3. Cooldown Recorded
        key = CooldownManager._get_key(EnforcementScope.SESSION, "session_e2e_1", "BLOCK")
        assert key in CooldownManager._COOLDOWN_STORE

    @patch('backend.threat_model.threat_analyzer.ThreatAnalyzer.assess')
    @patch('backend.governance.enforcement_policy_engine.EnforcementPolicyEngine.evaluate')
    @patch('backend.enforcement.enforcement_actions.EnforcementActions.execute_action')
    def test_cooldown_rejection(self, mock_execute, mock_policy, mock_assess):
        """
        Scenario:
        1. Context created.
        2. Policy evaluates to BLOCK.
        3. First execution succeeds.
        4. Second execution rejected by Cooldown.
        """
        # Setup
        context = ExecutionContext(
            session_id="session_cool",
            user_id="user_cool",
            risk_score=90,
            tenant_id="tenant_1"
        )
        mock_policy.return_value = ("BLOCK", True)
        mock_execute.return_value = True

        mock_assessment = MagicMock()
        mock_assessment.severity = "LOW"
        mock_assessment.to_dict.return_value = {
            "severity": "LOW",
            "blast_radius": {"affected_users": 1, "tenant_scope": False},
             "threats": []
        }
        mock_assess.return_value = mock_assessment
        
        # Run 1
        EnforcementEngine.handle_enforcement_request(context)
        assert mock_execute.call_count == 1
        
        # Run 2 (Should be blocked by Cooldown)
        # We must use a context that generates a DIFFERENT Proposal ID (dedup hash)
        # but targets the SAME session/action for Cooldown.
        # Changing risk_score slightly bypasses ProposalRegistry dedup but hits CooldownManager.
        context2 = ExecutionContext(
            session_id="session_cool",
            user_id="user_cool",
            risk_score=91, # Different risk score -> New Proposal
            tenant_id="tenant_1"
        )
        EnforcementEngine.handle_enforcement_request(context2)
        assert mock_execute.call_count == 1 # Still 1, did not increment
        
    @patch('backend.threat_model.threat_analyzer.ThreatAnalyzer.assess')
    @patch('backend.governance.enforcement_policy_engine.EnforcementPolicyEngine.evaluate')
    @patch('backend.enforcement.enforcement_actions.EnforcementActions.execute_action')
    @patch('backend.governance.approval_matrix.ApprovalMatrix.can_approve')
    def test_recovery_trigger_on_failure(self, mock_approve, mock_execute, mock_policy, mock_assess):
        """
        Scenario:
        1. Auto Enforcement tries to BLOCK.
        2. Action fails (Exception or False).
        3. Recovery Plan generated.
        """
        context = ExecutionContext(
            session_id="session_fail",
            user_id="user_fail", 
            risk_score=90,
            tenant_id="tenant_1"
        )
        mock_policy.return_value = ("BLOCK", True)
        mock_approve.return_value = True # Allow System to Block
        
        # Execution fails hard
        mock_execute.side_effect = Exception("Firewall Down")

        mock_assessment = MagicMock()
        mock_assessment.severity = "LOW"
        mock_assessment.to_dict.return_value = {
            "severity": "LOW",
            "blast_radius": {"affected_users": 1, "tenant_scope": False},
             "threats": []
        }
        mock_assess.return_value = mock_assessment
        
        # Execute
        EnforcementEngine.handle_enforcement_request(context)
        
        # Verify Recovery Triggered via Audit Log Side Effect
        system_calls = [args[0] for args, _ in self.audit_mock.log_system_event.call_args_list]
        assert "ENFORCEMENT_CRASH" in system_calls
        assert "RECOVERY_PLAN_GENERATED" in system_calls

if __name__ == "__main__":
    pytest.main()
