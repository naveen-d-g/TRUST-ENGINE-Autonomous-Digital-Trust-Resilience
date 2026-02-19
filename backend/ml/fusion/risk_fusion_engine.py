from typing import Dict, Any

class RiskFusionEngine:
    VERSION = "rf_v3"
    DOMAIN_WEIGHTS = {
        "web": 0.18,
        "api": 0.18,
        "auth": 0.14,
        "network": 0.20,
        "system": 0.20,
        "anomaly": 0.10
    }

    @staticmethod
    def compute_risk(probs: Dict[str, float], features: Dict[str, Any]) -> Dict[str, Any]:
        """
        Computes weighted risk score and applies context amplification.
        """
        weights = RiskFusionEngine.DOMAIN_WEIGHTS
        
        # 1. Base Weighted Formula
        base_score = (
            weights["web"] * probs.get("web", 0.0) +
            weights["api"] * probs.get("api", 0.0) +
            weights["auth"] * probs.get("auth", 0.0) +
            weights["network"] * probs.get("network", 0.0) +
            weights["system"] * probs.get("system", 0.0) +
            weights["anomaly"] * probs.get("anomaly", 0.0)
        )
        
        # Scale to 0-100
        risk_score = base_score * 100
        
        # 2. Signal Dominance (Anti-Dilution)
        # If any single model is very confident (> 0.7), it pulls the whole score up.
        max_prob = max(probs.values())
        if max_prob > 0.7:
             # Map 0.7-1.0 to 70-100 linear
             dominance_score = max_prob * 100
             risk_score = max(risk_score, dominance_score)

        # 3. Context Amplification
        # If anomaly > 0.6 AND (high rate OR lateral mov OR system anomaly) -> 1.5x
        amplified = False
        anomaly_prob = probs.get("anomaly", 0.0)
        
        if anomaly_prob > 0.6:
            # Check context triggers
            rpm = features.get("request_rate_per_min", 0.0)
            lat_mov = features.get("lateral_movement_score", 0.0)
            sys_anom = features.get("syscall_anomaly_score", 0.0)
            
            if (rpm > 60 or lat_mov > 0 or sys_anom > 0):
                risk_score *= 1.5
                amplified = True

        # 4. Generic Anomaly Safety Net
        # Logic: final_risk = max(fused_risk, anomaly_probability * 100 * ANOMALY_WEIGHT_FLOOR)
        # Increased floor to 0.5 to make anomaly model more impactful
        ANOMALY_WEIGHT_FLOOR = 0.5
        anomaly_risk = anomaly_prob * 100 * ANOMALY_WEIGHT_FLOOR
        risk_score = max(risk_score, anomaly_risk)
        
        # 5. HARD SECURITY OVERRIDES (Zero-Trust)
        # These rules override everything else.
        debug_reasons = []
        
        # A. Brute Force / Credential Stuffing
        if features.get("failed_login_attempts", 0) > 5:
            risk_score = 100.0
            debug_reasons.append("Excessive Failed Logins")
            
        # B. Bot / Headless Browser
        if features.get("headless_browser_flag") is True:
             risk_score = max(risk_score, 95.0)
             debug_reasons.append("Headless Browser Detected")
             
        # C. High Confidence Bot
        if probs.get("auth", 0) > 0.8:
             risk_score = max(risk_score, 90.0)
             debug_reasons.append("High Confidence Bot")
        
        # Cap at 100
        risk_score = min(100.0, risk_score)
        
        return {
            "risk_score": risk_score,
            "amplified": amplified,
            "version": RiskFusionEngine.VERSION,
            "breakdown": probs
        }
