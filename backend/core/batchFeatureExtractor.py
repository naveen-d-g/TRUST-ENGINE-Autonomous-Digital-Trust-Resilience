import numpy as np
from datetime import datetime

class BatchFeatureExtractor:
    @staticmethod
    def extract_features(events):
        """
        Extracts ML features from a list of raw batch events.
        """
        if not events:
            return {
                "bot_probability": 0.0,
                "attack_signal": 0.0,
                "anomaly_score": 0.0,
                "web_abuse": 0.0,
                "api_abuse": 0.0,
                "network_anomaly": 0.0
            }

        total_events = len(events)
        
        # 1. Bot Indicators
        failed_logins = sum(1 for e in events if e.get("event_type") in ["AUTH_FAILED", "LOGIN_FAILURE"])
        rapid_fire = 0
        timestamps = sorted([e.get("timestamp") for e in events if e.get("timestamp")])
        if len(timestamps) > 1:
            intervals = [(timestamps[i+1] - timestamps[i]).total_seconds() for i in range(len(timestamps)-1)]
            rapid_fire = sum(1 for i in intervals if i < 1.0) # Sub-second intervals

        bot_prob = (failed_logins * 2 + rapid_fire) / (total_events * 2) if total_events > 0 else 0
        
        # 2. Attack Signals
        # Check event types and payloads for common attack vectors
        attack_keywords = ["CAPTCHA_FAIL", "WAF_BLOCK", "SQL", "XSS", "INJECTION", "EXPLOIT", "ATTACK", "BRUTE", "MALWARE"]
        
        attack_count = 0
        for e in events:
            e_type = str(e.get("event_type", "")).upper()
            e_payload = str(e.get("payload", "")).upper()
            e_user = str(e.get("user_id", "")).upper()
            
            # Direct keyword match in type or payload
            if any(k in e_type for k in attack_keywords) or any(k in e_payload for k in attack_keywords):
                attack_count += 1
            
            # Heuristic: If they are named 'attacker'
            if "ATTACKER" in e_user:
                attack_count += 5
                
        attack_signal = (attack_count * 5) / (total_events * 5) if total_events > 0 else 0
        
        # 3. Anomaly Scoring (Entropy / Unusual Pattern)
        distinct_ips = len(set(e.get("ip") for e in events if e.get("ip")))
        ip_entropy = distinct_ips / total_events if total_events > 0 else 0
        
        # 4. Domain Specifics
        web_abuse = sum(1 for e in events if e.get("event_type") in ["SCRAPE", "CRAWL"]) / total_events if total_events > 0 else 0
        api_abuse = sum(1 for e in events if e.get("event_type") == "API_RATE_LIMIT") / total_events if total_events > 0 else 0
        network_anomaly = sum(1 for e in events if e.get("event_type") == "PORT_SCAN") / total_events if total_events > 0 else 0

        return {
            "bot_probability": min(1.0, bot_prob),
            "attack_signal": min(1.0, attack_signal),
            "anomaly_score": min(1.0, ip_entropy),
            "web_abuse": min(1.0, web_abuse),
            "api_abuse": min(1.0, api_abuse),
            "network_anomaly": min(1.0, network_anomaly)
        }
