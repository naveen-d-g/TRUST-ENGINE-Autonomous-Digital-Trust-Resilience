class FeatureBuilder:
    @staticmethod
    def build(event, session):
        """
        Builds a feature vector for ML scoring based on the domain.
        """
        domain = event.get("domain")
        features = {
            "domain": domain,
            "event_count": 1, # Placeholder, in real sys would come from session
            "risk_score": 0.0 # Will be populated by ML
        }

        # Commmon
        features["failed_attempts"] = 1 if event.get("status_code") == 401 else 0

        # Domain Specific
        if domain == "WEB":
            features["unique_routes"] = 1 # Placeholder
            features["sqli_count"] = 1 if "SELECT" in str(event.get("payload")) else 0
            features["xss_count"] = 1 if "<script>" in str(event.get("payload")) else 0
            features["brute_force_attempts"] = 1 if event.get("route") == "/login" and event.get("status_code") == 401 else 0
            
        elif domain == "API":
            features["5xx_rate"] = 1.0 if str(event.get("status_code")).startswith("5") else 0.0
            features["auth_failures"] = 1 if event.get("status_code") == 403 else 0
            features["slow_endpoints"] = 1 if event.get("metrics", {}).get("latency", 0) > 1000 else 0

        elif domain == "NETWORK":
            features["packet_spike"] = 0.8 if event.get("payload", {}).get("packet_count", 0) > 1000 else 0.0
            features["port_scan"] = 1 if event.get("payload", {}).get("ports_scanned", 0) > 10 else 0

        elif domain == "SYSTEM":
            features["cpu_spike"] = 1 if event.get("payload", {}).get("cpu", 0) > 90 else 0
            features["memory_spike"] = 1 if event.get("payload", {}).get("memory", 0) > 90 else 0
            features["suspicious_process"] = 1 if "crypto_miner" in str(event.get("payload", {}).get("processes", [])) else 0

        return features
