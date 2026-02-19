from typing import Dict, Any
from backend.threat_model.threat_taxonomy import ThreatSeverity
from backend.audit.audit_log import AuditLogger

class BlastRadiusGuard:
    """
    Prevents catastrophe BEFORE proposal registration.
    Hard-fails if blast_radius is too wide for the severity.
    """
    
    @staticmethod
    def validate_proposal(action: str, threat_assessment: Dict[str, Any]):
        """
        Validates scope vs severity.
        Raises ValueError if unsafe.
        """
        severity = threat_assessment.get("severity", ThreatSeverity.LOW)
        blast_radius = threat_assessment.get("blast_radius", "SESSION")
        
        # Rule: TENANT-wide actions require CRITICAL severity
        if blast_radius == "TENANT" and severity != ThreatSeverity.CRITICAL:
            AuditLogger.log_system_event(
                "BLAST_RADIUS_VIOLATION", 
                f"Action {action} attempted TENANT scope with {severity} severity.", 
                "CRITICAL"
            )
            raise ValueError(f"SAFETY GUARD: Tenant-wide action {action} requires CRITICAL severity.")

        # Rule: IP-wide actions require HIGH+ severity
        if blast_radius == "IP" and severity not in [ThreatSeverity.HIGH, ThreatSeverity.CRITICAL]:
             raise ValueError(f"SAFETY GUARD: IP-wide action {action} requires HIGH+ severity.")
             
        return True
