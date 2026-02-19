from enum import Enum

class SignalType(str, Enum):
    """
    Standardized Signal Types for SOC Platform.
    Used for detection, alerting, and incident grouping.
    """
    # Critical Attacks
    ATTACK_DETECTED = "attack_detected"
    CREDENTIAL_STUFFING = "credential_stuffing"
    BRUTE_FORCE = "brute_force"
    API_ABUSE = "api_abuse"
    SQL_INJECTION = "sql_injection"
    XSS_ATTEMPT = "xss_attempt"
    
    # Infrastructure
    SYSTEM_FAILURE = "system_failure"
    SERVICE_DOWN = "service_down"
    HIGH_LATENCY = "high_latency"
    
    # Anomalies
    ANOMALY_DETECTED = "anomaly_detected"
    BEHAVIORAL_ANOMALY = "behavioral_anomaly"
    GEOLOCATION_MISMATCH = "geolocation_mismatch"
    
    # Trust & Recovery
    LOW_TRUST = "low_trust"
    RECOVERY_REQUIRED = "recovery_required"
    
    # Generic
    INFO = "info"
    WARNING = "warning"
