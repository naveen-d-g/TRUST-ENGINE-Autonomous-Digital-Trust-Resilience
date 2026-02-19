from typing import Dict, Any, Optional
from pydantic import BaseModel, Field

class FeatureSet(BaseModel):
    """
    Standardized Feature Set Data Contract.
    Ensures all models receive consistent feature types.
    """
    session_id: str
    timestamp: float = Field(default_factory=lambda: 0.0)
    
    # Web Features
    request_rate_per_min: float = 0.0
    unique_path_count: int = 0
    path_entropy: float = 0.0
    error_rate_4xx: float = 0.0
    error_rate_5xx: float = 0.0
    payload_size_mean: float = 0.0
    scanner_signature_score: float = 0.0
    
    # API Features
    api_burst_score: float = 0.0
    token_reuse_count: int = 0
    auth_failure_ratio: float = 0.0
    endpoint_variance: float = 0.0
    rate_limit_hits: int = 0
    
    # Auth Features
    failed_login_attempts: int = 0
    login_velocity: float = 0.0
    time_between_attempts: float = 0.0
    captcha_failures: int = 0
    credential_entropy: float = 0.0
    
    # Network Features
    port_scan_count: int = 0
    unique_ports: int = 0
    fan_out_ratio: float = 0.0
    lateral_movement_score: float = 0.0
    scan_signature_score: float = 0.0
    
    # System Features (Kill-Chain Support)
    cpu_spike_score: float = 0.0
    memory_spike_score: float = 0.0
    process_spawn_rate: float = 0.0
    privileged_process_count: int = 0
    syscall_anomaly_score: float = 0.0
    defense_evasion_score: float = 0.0
    binary_entropy_score: float = 0.0
    persistence_indicator_score: float = 0.0
    
    # Kill-Chain Specific Indicators
    unusual_parent_process: bool = False
    sudo_usage: bool = False
    token_manipulation: bool = False
    registry_mod: bool = False
    cron_edit: bool = False
    log_deletion: bool = False
    process_injection: bool = False
    
    # Meta Features
    session_age: float = 0.0
    risk_velocity: float = 0.0
    active_threat_count: int = 0
    previous_decision_weight: float = 0.0
    historical_risk_mean: float = 0.0
    current_risk_score: float = 0.0
    
    class Config:
        extra = "ignore" # Ignore unexpected fields for robustness
