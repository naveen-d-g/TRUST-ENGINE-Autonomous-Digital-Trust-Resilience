from typing import Dict, Any, List

class RecoveryEngine:
    """
    Suggests recovery steps for analysts.
    """
    @staticmethod
    def recommend_recovery(features: Dict[str, Any]) -> List[Dict[str, str]]:
        steps = []
        
        if features.get("token_reuse_count", 0) > 0:
             steps.append({"action": "Rotate API Tokens immediately", "priority": "high"})
             
        if features.get("failed_login_attempts", 0) > 10:
             steps.append({"action": "Reset User Password", "priority": "medium"})
             
        if features.get("registry_mod") or features.get("cron_edit"):
             steps.append({"action": "Rollback System Configuration / Registry", "priority": "critical"})
             steps.append({"action": "Scan for Backdoors", "priority": "critical"})
             
        if features.get("lateral_movement_score", 0) > 0:
             steps.append({"action": "Audit Network Segmentation", "priority": "high"})
             
        if not steps:
            steps.append({"action": "No specific recovery action needed. Monitor situation.", "priority": "low"})
            
        return steps
