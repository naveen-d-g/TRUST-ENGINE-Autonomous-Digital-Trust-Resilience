class RecommendationEngine:
    @staticmethod
    def recommend(decision, features):
        """
        Generates a recommended strategy based on the decision and risk profile.
        """
        if decision == "ALLOW":
            return "Standard Passive Monitoring"

        if decision == "ESCALATE":
            if features.get("domain") == "WEB":
                return "Enable WAF block and force MFA"
            if features.get("domain") == "API":
                return "Apply rate limit and token revalidation"
            if features.get("domain") == "NETWORK":
                return "Trigger firewall rule and isolate IP"
            if features.get("domain") == "SYSTEM":
                return "Kill suspicious process and notify SOC"
            
            # Fallback
            if features.get("bot_probability", 0) > 0.5:
                return "Implement CAPTCHA Challenge & Device Fingerprinting"
            return "Block IP & Terminate Session Immediately"

        if decision == "RESTRICT":
            if features.get("domain") == "WEB":
                return "Inject JS challenge and track session"
            if features.get("domain") == "API":
                return "Throttle request rate"
            if features.get("domain") == "NETWORK":
                return "Flag IP for deep packet inspection"
            if features.get("domain") == "SYSTEM":
                return "Increase logging verbosity"

            # Fallback
            if features.get("attack_signal", 0) > 0.7:
                return "Immediate IP Shun & Session Termination"
            return "Temporary Account/Access Restriction"

        return "Maintain Baseline Observation"
