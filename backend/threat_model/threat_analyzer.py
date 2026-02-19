from dataclasses import dataclass
from typing import Dict, Any, List
from backend.threat_model.threat_taxonomy import EnforcementThreat, ThreatSeverity
from backend.threat_model.blast_radius import BlastRadius, BlastRadiusCalculator

@dataclass
class ThreatAssessment:
    severity: str # ThreatSeverity
    likelihood: float # 0.0 - 1.0
    threats: List[str] # List[EnforcementThreat]
    blast_radius: 'BlastRadius'
    required_approval_level: str # "ANALYST", "ADMIN", "DUAL"
    rollback_required: bool = True
    
    def to_dict(self) -> Dict[str, Any]:
        return {
            "severity": self.severity,
            "likelihood": self.likelihood,
            "threats": self.threats,
            "blast_radius": self.blast_radius.to_dict(),
            "required_approval_level": self.required_approval_level,
            "rollback_required": self.rollback_required
        }

class ThreatAnalyzer:
    """
    Analyzes proposed enforcement actions for operational risks.
    ADVISORY ONLY. Does NOT modify ML outputs.
    """
    
    @staticmethod
    def assess(action: str, target: str, context: Any) -> ThreatAssessment:
        # 1. Calculate Blast Radius
        context_dict = context.to_dict() if hasattr(context, "to_dict") else {}
        radius = BlastRadiusCalculator.calculate(action, target, context_dict)
        
        threats = []
        severity = ThreatSeverity.LOW
        approval = "ANALYST"
        
        # 2. Identify Threats
        
        # B. Cascade Block Risk
        if radius.shared_asset or radius.affected_users > 1 or radius.tenant_scope:
            threats.append(EnforcementThreat.CASCADE_BLOCK)
            severity = ThreatSeverity.CRITICAL
            approval = "ADMIN"
            if radius.tenant_scope:
                approval = "DUAL" # Critical impact
        
        # A. False Positive Risk (High anomaly but low confidence or ambiguous signals)
        # Use context to determine ambiguity
        ml_confidence = context_dict.get("breakdown", {}).get("confidence", 0.8) # Mock default
        if ml_confidence < 0.7:
             threats.append(EnforcementThreat.FALSE_POSITIVE)
             if severity != ThreatSeverity.HIGH:
                 severity = ThreatSeverity.MEDIUM
        
        # F. Human Error Risk (Irreversible actions)
        if radius.reversibility_score < 0.6:
             threats.append(EnforcementThreat.HUMAN_ERROR)
             approval = "ADMIN"
             
        # 3. Final Severity Adjustment
        if EnforcementThreat.CASCADE_BLOCK in threats:
             severity = ThreatSeverity.CRITICAL
             
        return ThreatAssessment(
            severity=severity,
            likelihood=0.5, # heuristic placeholder
            threats=threats,
            blast_radius=radius,
            required_approval_level=approval
        )
