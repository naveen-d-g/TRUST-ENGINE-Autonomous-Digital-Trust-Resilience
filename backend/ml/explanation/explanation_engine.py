from typing import Dict, Any

class ExplanationEngine:
    """
    Generates human-readable explanations.
    Deterministic, no LLM hallucinations.
    """
    @staticmethod
    def explain(probs: Dict[str, float], features: Dict[str, Any], decision: str) -> Dict[str, Any]:
        reasons = []
        
        # Priority 1: System Intrusions (Critical)
        if probs.get("system", 0) > 0.5:
             # Deep dive into system kill chain
             details = []
             if features.get("unusual_parent_process"): details.append("Initial Access (Unusual Parent)")
             if features.get("lateral_movement_score", 0) > 0.5: details.append("Lateral Execution Detected")
             if features.get("sudo_usage") or features.get("token_manipulation"): details.append("Privilege Escalation Detected")
             if features.get("registry_mod") or features.get("cron_edit") or features.get("persistence_indicator_score", 0) > 0: details.append("Persistence Mechanism Installed")
             if features.get("log_deletion") or features.get("defense_evasion_score", 0) > 0: details.append("Defense Evasion (Critical)")
             
             if details:
                 reasons.append(f"System Attack Indicators: {', '.join(details)}")
             else:
                 reasons.append("System Intrusion indicators present")

        # Priority 2: Network Anomalies
        if probs.get("network", 0) > 0.5:
            reasons.append("Network Anomalies / Lateral Movement suspected")

        # Priority 3: Auth Attacks
        if probs.get("auth", 0) > 0.5:
            reasons.append("Suspicious Authentication Behavior")

        # Priority 4: Web/API Abuse (Volume based, lower severity relative to compromise)
        if probs.get("web", 0) > 0.5:
            reasons.append(f"High Web Abuse Probability ({int(probs['web']*100)}%)")
            
        if probs.get("api", 0) > 0.5:
            reasons.append(f"Abusive API Pattern Detected ({int(probs['api']*100)}%)")
            
        if features.get("risk_velocity", 0) > 0.1: 
            reasons.append("Rapidly Escalating Risk Score")
            
        primary = reasons[0] if reasons else "Routine Activity"
        
        return {
            "primary_cause": primary,
            "contributing_factors": reasons,
            "decision": decision
        }
