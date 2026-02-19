
"""
Inference Pipeline (Detection-Only)
Version: v1.0

Main entry point for ML detection.
Orchestrates: Event -> SessionState -> FeatureBuilder -> RiskModel -> Prediction.

Strictly enforces:
- Detection-Only (No side effects)
- Time-Travel Safety (Decision Timestamp)
- Determinism
"""
import time
from typing import Dict, Any, List, Optional
from backend.ml.core.session_state import SessionState
from backend.ml.core.feature_builder import FeatureBuilder
from backend.ml.models.risk_model import RiskModel
from backend.ml.core.feature_schema import FEATURE_ORDER

from backend.ml.pipeline.output_contract import PredictionOutput
from backend.ml.core.feature_schema import FEATURE_SCHEMA_VERSION

class InferencePipeline:
    def __init__(self, model_path: str = None):
        self.feature_builder = FeatureBuilder()
        self.risk_model = RiskModel(model_path)
        # TODO: Load model version from registry or file
        self.model_version = "v1.0.0" 
        
    def predict_session_risk(self, 
                             session_state: SessionState, 
                             decision_timestamp: Optional[float] = None) -> PredictionOutput:
        """
        Predicts risk for a given session state at a specific point in time.
        Returns a frozen PredictionOutput object.
        """
        if decision_timestamp is None:
            decision_timestamp = time.time()
            
        # 1. Build Features (Time-Gated)
        features = self.feature_builder.build_features(session_state, decision_timestamp)
        
        # 2. Predict Risk
        label_idx, score, _ = self.risk_model.predict(features)
        
        # 3. Generate Explanation (Tier 1)
        contributors = []
        for idx, val in enumerate(features):
            if val > 0: # Simple non-zero contribution logic for Tier 1
                name = FEATURE_ORDER[idx]
                contributors.append({"feature": name, "value": val})
                
        explanation_data = {
            "top_features": contributors[:5], # Top 5
            "domain_scores": {} # TODO: Calculate per-domain sub-scores if needed
        }
        
        labels = ["BENIGN", "SUSPICIOUS", "HIGH_RISK", "MALICIOUS"]
        risk_label = labels[label_idx] if label_idx < len(labels) else "UNKNOWN"

        # 4. Create Frozen Output
        # Feature Snapshot ID: Hash of the feature vector
        import hashlib
        import json
        feature_hash = hashlib.sha256(json.dumps(features).encode()).hexdigest()

        return PredictionOutput.create(
            session_id=session_state.session_id,
            model_version=self.model_version,
            feature_schema_version=FEATURE_SCHEMA_VERSION,
            decision_timestamp=decision_timestamp,
            risk_score=score,
            risk_label=risk_label,
            explanation_data=explanation_data,
            feature_snapshot_id=feature_hash
        )
