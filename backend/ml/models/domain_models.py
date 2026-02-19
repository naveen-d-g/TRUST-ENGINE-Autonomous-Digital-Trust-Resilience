from typing import Dict
from backend.ml.contract import BaseRiskModel

class WebAbuseModel(BaseRiskModel):
    MODEL_VERSION = "web_v1"
    FEATURE_SCHEMA_VERSION = "1.0"
    REQUIRED_FEATURES = [
        "request_rate_per_min", "path_entropy", "error_rate_4xx"
    ]

    def predict(self, features: Dict[str, float]) -> float:
        self.validate_features(features)
        score = 0.0
        
        # Heuristic 1: High RPM (Flood)
        rpm = features.get("request_rate_per_min", 0)
        if rpm > 600: score += 0.8  # > 10 req/sec
        elif rpm > 60: score += 0.4
        
        # Heuristic 2: Error Probing (4xx)
        err_4xx = features.get("error_rate_4xx", 0)
        if err_4xx > 0.5: score += 0.4
        elif err_4xx > 0.1: score += 0.2
        
        # Heuristic 3: Path Entropy (Random scanning)
        entropy = features.get("path_entropy", 0)
        if entropy > 4.0: score += 0.3
        
        return min(1.0, score)

class APIAbuseModel(BaseRiskModel):
    MODEL_VERSION = "api_v1"
    FEATURE_SCHEMA_VERSION = "1.0"
    REQUIRED_FEATURES = [
        "rate_limit_hits", "token_reuse_count", "api_burst_score"
    ]

    def predict(self, features: Dict[str, float]) -> float:
        self.validate_features(features)
        score = 0.0
        
        # 1. Rate Limits
        if features.get("rate_limit_hits", 0) > 0:
            score += 0.7
            
        # 2. Token Reuse (Critical)
        if features.get("token_reuse_count", 0) > 0:
            score += 0.9 # High certainty
            
        # 3. Burstiness
        if features.get("api_burst_score", 0) > 0.5:
            score += 0.3
            
        return min(1.0, score)

class AuthAbuseModel(BaseRiskModel):
    MODEL_VERSION = "auth_v1"
    FEATURE_SCHEMA_VERSION = "1.0"
    REQUIRED_FEATURES = [
        "failed_login_attempts", "captcha_failures", "login_velocity"
    ]

    def predict(self, features: Dict[str, float]) -> float:
        self.validate_features(features)
        score = 0.0
        
        # 1. Failed Attempts (Brute Force)
        fails = features.get("failed_login_attempts", 0)
        if fails > 10: score += 0.9
        elif fails > 3: score += 0.4
        
        # 2. Captcha Failure (Bot)
        if features.get("captcha_failures", 0) > 0:
            score += 0.6
            
        # 3. Login Velocity (Credential Stuffing)
        vel = features.get("login_velocity", 0)
        if vel > 10: score += 0.8
        
        return min(1.0, score)

class NetworkAttackModel(BaseRiskModel):
    MODEL_VERSION = "net_v1"
    FEATURE_SCHEMA_VERSION = "1.0"
    REQUIRED_FEATURES = [
        "lateral_movement_score", "port_scan_count", "unique_ports"
    ]

    def predict(self, features: Dict[str, float]) -> float:
        self.validate_features(features)
        score = 0.0
        
        # 1. Lateral Movement (IDS Signal)
        score += features.get("lateral_movement_score", 0.0)
        
        # 2. Port Scanning
        if features.get("port_scan_count", 0) > 0:
            score += 0.7
            
        # 3. Unique Ports (Fan out)
        if features.get("unique_ports", 0) > 5:
            score += 0.5
            
        return min(1.0, score)

class SystemIntrusionModel(BaseRiskModel):
    MODEL_VERSION = "sys_v1"
    FEATURE_SCHEMA_VERSION = "1.0"
    REQUIRED_FEATURES = [
        "cpu_spike_score", "memory_spike_score", 
        "syscall_anomaly_score", "process_spawn_rate"
    ]

    def predict(self, features: Dict[str, float]) -> float:
        self.validate_features(features)
        score = 0.0
        
        # 1. Resource Spikes (Crypto mining / DoS)
        if features.get("cpu_spike_score", 0) > 0: score += 0.5
        if features.get("memory_spike_score", 0) > 0: score += 0.4
        
        # 2. Syscall / Process Anomalies (Rootkit / shell)
        if features.get("syscall_anomaly_score", 0) > 0: score += 0.9
        if features.get("process_spawn_rate", 0) > 100: score += 0.6
        
        return min(1.0, score)

class GenericAnomalyModel(BaseRiskModel):
    """
    Safety Net: Unsupervised Anomaly Detection.
    """
    MODEL_VERSION = "anomaly_v1"
    FEATURE_SCHEMA_VERSION = "1.0"
    REQUIRED_FEATURES = [] # Accepts anything, robust

    def predict(self, features: Dict[str, float]) -> float:
        # Stub: Return low anomaly for now unless metrics are oddly high
        # In real system: loaded Model.predict(vector)
        
        # Heuristic: If multiple counters are non-zero, assume anomaly
        non_zero = sum(1 for k, v in features.items() if isinstance(v, (int, float)) and v > 0)
        if non_zero > 5:
            return 0.4
        return 0.1 # Baseline noise
