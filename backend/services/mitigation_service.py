from datetime import datetime
import logging

class MitigationService:
    """
    Handles automated and recommended mitigation actions.
    Supports RECOMMEND_ONLY (Safe Mode) and AUTO_ENFORCE.
    """
    
    MODE = "RECOMMEND_ONLY" # or "AUTO_ENFORCE"
    
    # Audit Log (In-memory for now, DB in prod)
    _audit_log = []
    
    @classmethod
    def set_mode(cls, mode):
        if mode in ["RECOMMEND_ONLY", "AUTO_ENFORCE"]:
            cls.MODE = mode
            print(f"[MitigationService] Switched to {mode}")
            
    @classmethod
    def execute_mitigation(cls, risk_type, target, details=None):
        """
        Main entry point.
        risk_type: 'web_abuse', 'api_abuse', 'bot', 'network_anomaly', 'infra_stress'
        target: IP address, User ID, Token ID, etc.
        """
        action = cls._map_risk_to_action(risk_type)
        
        entry = {
            "timestamp": datetime.utcnow().isoformat(),
            "risk_type": risk_type,
            "target": target,
            "action": action,
            "mode": cls.MODE,
            "details": details or {},
            "status": "PENDING"
        }
        
        if cls.MODE == "AUTO_ENFORCE":
            success = cls._enforce_action(action, target)
            entry["status"] = "ENFORCED" if success else "FAILED"
        else:
            entry["status"] = "RECOMMENDED"
            
        cls._audit_log.append(entry)
        return entry

    @staticmethod
    def _map_risk_to_action(risk_type):
        mapping = {
            "web_abuse": "APPLY_WAF_RULE",
            "api_abuse": "RATE_LIMIT_ENDPOINT",
            "bot": "BLOCK_IP",
            "network_anomaly": "QUARANTINE_HOST",
            "infra_stress": "SCALE_RESOURCES"
        }
        return mapping.get(risk_type, "MANUAL_REVIEW")

    @classmethod
    def _enforce_action(cls, action, target):
        """
        Simulates the actual enforcement (e.g. calling AWS WAF, Cloudflare API).
        """
        print(f"[MitigationService] AUTO-ENFORCING: {action} on {target}")
        
        # Real implementation would call external APIs here.
        # For now, we simulate success.
        
        if params := cls._get_dry_run_params():
             if params.get("fail_mode"): return False
             
        return True

    @staticmethod
    def _get_dry_run_params():
        return {} # Hook for testing
        
    @classmethod
    def get_audit_log(cls):
        return cls._audit_log
