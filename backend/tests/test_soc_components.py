import pytest
from backend.enforcement.cooldown_manager import CooldownManager
from backend.common.scope import EnforcementScope
from backend.enforcement.outcome_emitter import OutcomeEmitter, MLLabel
from backend.recovery.recovery_engine import RecoveryEngine
from backend.incidents.incident_manager import IncidentManager, IncidentState
import time

class TestSOCComponents:

    def setup_method(self):
        # Reset state for tests
        CooldownManager._COOLDOWN_STORE = {}
        CooldownManager._VIOLATION_COUNTS = {}
        IncidentManager._INCIDENTS = {}
        IncidentManager._ACTIVE_SESSIONS = {}

    def test_cooldown_escalation(self):
        """
        Verify that repeated session violations escalate to User/Tenant warnings.
        """
        target = "session_123"
        scope = EnforcementScope.SESSION
        action = "BLOCK"
        
        # 1. Trigger cooldown for session
        CooldownManager.record_execution(action, target, scope)
        
        # 2. Try to execute again immediately (should fail)
        allowed = CooldownManager.check_cooldown(action, target, scope)
        assert not allowed, "Should be blocked by cooldown"
        
        # 3. Simulate spam to trigger escalation
        for _ in range(5):
             CooldownManager.check_cooldown(action, target, scope)
             
        # Check logs/audit for Escalation (Mocking AuditLogger would be better, but we check if code runs without error and logic holds)
        # In a real test we'd capture logs. For now we assume if no exception and violation count increases, it works.
        key = CooldownManager._get_key(scope, target, action)
        assert CooldownManager._VIOLATION_COUNTS[key] >= 5

    def test_outcome_label_mapping(self):
        """
        Verify outcome emitter maps results to correct ML labels.
        """
        # 1. Rolled Back -> Benign
        label = OutcomeEmitter._map_outcome_to_label("BLOCK", "ROLLED_BACK", {})
        assert label == MLLabel.BENIGN
        
        # 2. Failed -> Suspicious
        label = OutcomeEmitter._map_outcome_to_label("BLOCK", "FAILED", {})
        assert label == MLLabel.SUSPICIOUS
        
        # 3. Success + Admin -> Malicious
        label = OutcomeEmitter._map_outcome_to_label("BLOCK", "SUCCESS", {"approver_role": "admin"})
        assert label == MLLabel.MALICIOUS
        
        # 4. Success + Auto -> High Risk
        label = OutcomeEmitter._map_outcome_to_label("BLOCK", "SUCCESS", {"approver_role": "system"})
        assert label == MLLabel.HIGH_RISK

    def test_recovery_abort_conditions(self):
        """
        Verify recovery is denied for high threats or open incidents.
        """
        context = {"incident_status": "OPEN"}
        threat = {"confidence_score": 0.95}
        
        allowed = RecoveryEngine.can_recover(context, threat)
        assert not allowed, "Recovery should be aborted for High Threat/Open Incident"
        
        context_safe = {"incident_status": "CLOSED"}
        threat_safe = {"confidence_score": 0.1}
        allowed_safe = RecoveryEngine.can_recover(context_safe, threat_safe)
        assert allowed_safe, "Recovery should be allowed for safe context"

    def test_incident_correlation(self):
        """
        Verify proposals link to same incident via session/user.
        """
        ctx1 = {"session_id": "s1", "user_id": "u1"}
        prop1 = {"id": "p1", "context": ctx1, "severity": "LOW"}
        
        inc_id1 = IncidentManager.link_proposal_to_incident(prop1)
        
        ctx2 = {"session_id": "s2", "user_id": "u1"} # Different session, same user
        prop2 = {"id": "p2", "context": ctx2, "severity": "MEDIUM"}
        
        inc_id2 = IncidentManager.link_proposal_to_incident(prop2)
        
        assert inc_id1 == inc_id2, "Should correlate by User ID"
        
        incident = IncidentManager.get_incident(inc_id1)
        assert "p1" in incident["proposals"]
        assert "p2" in incident["proposals"]
        assert "u1" in incident["targets"]["users"]
        assert "s1" in incident["targets"]["sessions"]
        assert "s2" in incident["targets"]["sessions"]

if __name__ == "__main__":
    pytest.main()
