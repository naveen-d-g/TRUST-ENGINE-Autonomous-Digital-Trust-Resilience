from typing import List, Dict, Any

class RecoveryPlan:
    def __init__(self, name: str, steps: List[str], risk_level: str = "LOW"):
        self.name = name
        self.steps = steps
        self.risk_level = risk_level
    
    def to_dict(self) -> Dict[str, Any]:
        return {
            "name": self.name,
            "steps": self.steps,
            "risk_level": self.risk_level
        }

class RecoveryPlans:
    
    @staticmethod
    def manual_verification(user_id: str) -> RecoveryPlan:
        return RecoveryPlan(
            "Manual Verification",
            [
                f"Contact user {user_id} via out-of-band channel (Email/SMS).",
                "Verify recent activity matches user intent.",
                "If legitimate, whitelist User ID in Policy Override.",
                "Apologize to user if blocked."
            ],
            "LOW"
        )
        
    @staticmethod
    def infrastructure_retry(service_name: str) -> RecoveryPlan:
        return RecoveryPlan(
            "Infrastructure Retry",
            [
                f"Check status of {service_name} API.",
                "Check internal connectivity/firewall logs.",
                "Retry enforcement manually when service is healthy."
            ],
            "MEDIUM"
        )

    @staticmethod
    def force_rollback(session_id: str) -> RecoveryPlan:
        return RecoveryPlan(
            "Force Rollback",
            [
                f"CRITICAL: Manual cleanup required for Session {session_id}.",
                "Check Firewall/Gateway logs directly to ensure block is removed.",
                "Invalidate current session token to force re-login."
            ],
            "HIGH"
        )
        
    @staticmethod
    def monitor_only() -> RecoveryPlan:
        return RecoveryPlan(
            "Monitor Only",
            [
                "Action failed but risk is low.",
                "Monitor session for further anomalies.",
                "Do not retry immediately to avoid noise."
            ],
            "LOW"
        )
