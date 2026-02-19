import sys
import os
import unittest
from unittest.mock import patch, MagicMock

# Add root to sys.path
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '../..')))

from backend.enforcement.enforcement_engine import EnforcementEngine
from backend.orchestration.execution_context import ExecutionContext
from backend.enforcement.state.proposal_registry import ProposalRegistry
from backend.governance.threat_override_policy import ThreatOverridePolicy

class TestThreatApproval(unittest.TestCase):
    
    @patch('backend.enforcement.policy.enforcement_rules.EnforcementRules.get_allowed_action') # Mock underlying rules or Policy Engine
    # Actually mocking Policy Engine is better
    @patch('backend.governance.enforcement_policy_engine.EnforcementPolicyEngine.evaluate')
    @patch('backend.threat_model.threat_analyzer.ThreatAnalyzer.assess')
    def test_threat_override(self, mock_assess, mock_policy, mock_rules):
        print("=== Test: Threat Override Policy ===")
        
        # Setup: Policy says "Rate Limit is Auto" (usually)
        # But Threat says "Critical Severity"
        
        mock_policy.return_value = ("RATE_LIMIT", True) # Policy allows auto
        
        # Mock Threat Assessment High Risk
        mock_threat = MagicMock()
        mock_threat.severity = "CRITICAL"
        mock_threat.to_dict.return_value = {
            "severity": "CRITICAL", 
            "blast_radius": {"affected_users": 100}
        }
        mock_assess.return_value = mock_threat
        
        ctx = ExecutionContext(session_id="risk_sess", risk_score=90)
        
        # Act
        EnforcementEngine.handle_enforcement_request(ctx)
        
        # Verify: Proposal ID exists but status is PENDING_APPROVAL (not EXECUTING)
        # We need to find the proposal.
        props = ProposalRegistry.list_proposals()
        prop = next((p for p in props.values() if p['session_id'] == "risk_sess"), None)
        
        self.assertIsNotNone(prop)
        print(f"Proposal Status: {prop['status']}")
        
        # Should be PENDING_APPROVAL because Threat Override forced manual
        self.assertEqual(prop['status'], "PENDING_APPROVAL")
        print(">>> PASS: Critical Threat blocked Auto-Execution.")

if __name__ == '__main__':
    unittest.main()
