from typing import Dict, Any, Tuple
from backend.threat_model.threat_taxonomy import ThreatSeverity

class ThreatOverridePolicy:
    """
    Determines if a Threat Assessment forces a change in workflow
    (e.g., Disabling Auto-Execution, Requiring Higher Approval).
    """
    
    @staticmethod
    def evaluate_override(threat_assessment: Dict[str, Any]) -> Tuple[bool, str]:
        """
        Returns (is_overridden, reason)
        """
        severity = threat_assessment.get("severity", "LOW")
        blast = threat_assessment.get("blast_radius", {})
        
        # 1. Critical Severity -> Force Admin / Manual
        if severity == ThreatSeverity.CRITICAL:
            return True, "CRITICAL_SEVERITY_OVERRIDE"
            
        # 2. High Blast Radius -> Force Admin / Manual
        if blast.get("affected_users", 0) > 10 or blast.get("tenant_scope"):
             return True, "HIGH_BLAST_RADIUS_OVERRIDE"
             
        # 3. False Positive Risk High -> Force Manual
        threats = threat_assessment.get("threats", [])
        if "FALSE_POSITIVE" in threats and severity in ["HIGH", "MEDIUM"]:
             return True, "FP_RISK_OVERRIDE"
             
        return False, "NONE"
