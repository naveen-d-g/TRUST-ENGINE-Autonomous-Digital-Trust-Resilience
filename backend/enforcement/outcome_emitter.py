from typing import Dict, Any, Optional
import time
import json
from enum import Enum

class MLLabel(Enum):
    BENIGN = "BENIGN"
    SUSPICIOUS = "SUSPICIOUS"
    HIGH_RISK = "HIGH_RISK"
    MALICIOUS = "MALICIOUS"
    UNKNOWN = "UNKNOWN"

class OutcomeEmitter:
    """
    Emits structured outcomes from Enforcement/Orchestration back to ML loop.
    This closes the feedback loop WITHOUT triggering direct training.
    
    Implements Strict Label Mapping Policy:
    - SUCCESS + APPROVED -> MALICIOUS / HIGH_RISK
    - ROLLED_BACK -> BENIGN
    - FAILED -> SUSPICIOUS
    """
    
    @staticmethod
    def _map_outcome_to_label(action: str, result: str, context: Dict[str, Any]) -> MLLabel:
        """
        Maps operational outcomes to ML labels.
        """
        if result == "ROLLED_BACK":
            return MLLabel.BENIGN
            
        if result == "FAILED":
            # Execution failed, we don't know if it was truly malicious, but it warranted action.
            return MLLabel.SUSPICIOUS
            
        if result == "SUCCESS":
            # Action succeeded. Was it manual or auto?
            # If Manual Approval -> High Confidence Malicious
            if context.get("approver_role") in ["admin", "analyst"]:
                return MLLabel.MALICIOUS
            
            # If Auto -> High Risk (but not confirmed malicious until human review, effectively High Risk)
            return MLLabel.HIGH_RISK
            
        return MLLabel.UNKNOWN

    @staticmethod
    def emit_outcome(context: Dict[str, Any], action: str, result: str, details: str = ""):
        """
        Emits:
        - session_id
        - features_snapshot_id (from context)
        - decision (action)
        - outcome (status)
        - label (derived)
        - justification (details)
        """
        
        label = OutcomeEmitter._map_outcome_to_label(action, result, context)
        
        payload = {
            "session_id": context.get("session_id"),
            "trace_id": context.get("trace_id"),
            "timestamp": time.time(),
            "features_snapshot_id": context.get("features_snapshot_id"), # Crucial for time-travel learning
            "action": action,
            "outcome": result, # SUCCESS, FAILED, ROLLED_BACK
            "derived_label": label.value,
            "details": details,
            "ml_model_version": context.get("model_version", "unknown"),
            "tenant_id": context.get("tenant_id")
        }
        
        # In prod, this goes to Kafka/EventBus -> ML Data Lake
        # We simulate the log here.
        try:
            log_entry = json.dumps(payload, default=str)
            print(f"[ML_FEEDBACK_LOOP] {log_entry}")
        except Exception as e:
            print(f"[ML_FEEDBACK_LOOP_ERROR] Failed to serialize outcome: {e}")
        
        # Placeholder for storing to TrainingSample DB
        # TrainingDataStore.save_sample(payload)
        # Note: WE DO NOT CALL Model.train() here.
