from typing import Dict, Any
from backend.ml.models.base_model import BaseModel
from backend.ml.schema.feature_schema import FeatureSet

class SystemAttackModel(BaseModel):
    MODEL_NAME = "system_attack_v1"
    MODEL_VERSION = "2.0.0" # Master Prompt Version
    REQUIRED_FEATURES = [
        "cpu_spike_score", "syscall_anomaly_score", 
        "unusual_parent_process", "sudo_usage", "registry_mod", 
        "defense_evasion_score", "lateral_movement_score"
    ]

    def predict(self, features: Dict[str, Any] | FeatureSet) -> float:
        self.validate_features(features)
        score = 0.0
        
        # --- Standard Resource Anomalies ---
        if self._get_val(features, "cpu_spike_score") > 0: score += 0.2
        if self._get_val(features, "memory_spike_score") > 0: score += 0.1
        if self._get_val(features, "syscall_anomaly_score") > 0: score += 0.4
        
        # --- KILL-CHAIN LOGIC (5 STAGES) ---
        
        # 1. Initial Access
        if self._get_val(features, "unusual_parent_process"):
            score = max(score, 0.4)
            
        # 2. Lateral Execution (NEW)
        # Using lateral_movement_score from network or looking for specific processes like psexec/ssh
        if self._get_val(features, "lateral_movement_score") > 0.5:
            score = max(score, 0.5)
            
        # 3. Privilege Escalation
        if self._get_val(features, "sudo_usage") or self._get_val(features, "token_manipulation"):
            score = max(score, 0.7)
            
        # 4. Persistence
        if self._get_val(features, "registry_mod") or self._get_val(features, "cron_edit") or (self._get_val(features, "persistence_indicator_score") > 0):
            score = max(score, 0.8)
            
        # 5. Defense Evasion (Highest Criticality)
        if self._get_val(features, "log_deletion") or self._get_val(features, "process_injection") or (self._get_val(features, "defense_evasion_score") > 0):
            score = 1.0 # Immediate max risk
            
        return min(1.0, score)
