
"""
Risk Model Wrapper (GradientBoosting + Calibration)
Version: v1.0

This module implements the risk model using GradientBoostingClassifier.
It enforces strict schema validation and probability calibration.
"""
import numpy as np
import pickle
import os
from sklearn.ensemble import GradientBoostingClassifier
from sklearn.calibration import CalibratedClassifierCV
from typing import List, Dict, Any, Tuple
from backend.ml.core.feature_schema import FEATURE_SCHEMA_VERSION, FEATURE_ORDER

class RiskModel:
    def __init__(self, model_path: str = None):
        self.model = None
        self.schema_version = FEATURE_SCHEMA_VERSION
        
        if model_path and os.path.exists(model_path):
            self.load(model_path)
        else:
            # Initialize new calibrated model
            base_model = GradientBoostingClassifier(
                n_estimators=100,
                learning_rate=0.1,
                max_depth=3,
                random_state=42
            )
            # CalibratedClassifierCV for reliable probabilities
            self.model = CalibratedClassifierCV(base_model, method='isotonic', cv=3)

    def train(self, X: List[List[float]], y: List[int]):
        """
        Trains the calibrated model.
        X: List of feature vectors (must match FEATURE_ORDER length)
        y: List of labels (0, 1, 2)
        """
        # Validate input dimensions
        if len(X) > 0 and len(X[0]) != len(FEATURE_ORDER):
             raise ValueError(f"Feature vector length mismatch. Expected {len(FEATURE_ORDER)}, got {len(X[0])}")
             
        self.model.fit(X, y)

    def predict(self, feature_vector: List[float]) -> Tuple[int, float, Dict[str, Any]]:
        """
        Predicts risk score and label for a single feature vector.
        Returns: (label, risk_score, explanation_data)
        """
        if len(feature_vector) != len(FEATURE_ORDER):
            raise ValueError(f"Feature vector length mismatch. Expected {len(FEATURE_ORDER)}, got {len(feature_vector)}")
            
        if self.model is None:
            raise RuntimeError("Model is not trained.")

        # Get probabilities [P(0), P(1), P(2)]
        probs = self.model.predict_proba([feature_vector])[0]
        
        # Risk Score = P(MALICIOUS) + 0.5 * P(SUSPICIOUS) -> Scaled 0-1
        # Or just P(MALICIOUS) if we want strict probability?
        # Master prompt says "P(Session is malicious)".
        # Let's assume Risk Score is P(MALICIOUS) for now, maybe weighted.
        # Simple approach for v1: P(Malicious) + P(Suspicious)
        risk_score = probs[2] + (probs[1] * 0.5) 
        risk_score = min(1.0, risk_score)
        
        # Label logic: Max probability class
        label_idx = np.argmax(probs)
        
        # Explanation Data (Feature Contributions)
        # Note: CalibratedClassifierCV doesn't expose feature_importances_ directly easily
        # We need to access the base estimators.
        # For v1, we'll return a placeholder or extract from base model if possible.
        explanation = {}
        
        return int(label_idx), float(risk_score), explanation

    def save(self, path: str):
        with open(path, 'wb') as f:
            pickle.dump({
                "model": self.model,
                "schema_version": self.schema_version,
                "feature_order": FEATURE_ORDER
            }, f)

    def load(self, path: str):
        with open(path, 'rb') as f:
            data = pickle.load(f)
            
        if data["schema_version"] != FEATURE_SCHEMA_VERSION:
            raise ValueError(f"Model schema version {data['schema_version']} mismatch with code {FEATURE_SCHEMA_VERSION}")
            
        if data["feature_order"] != FEATURE_ORDER:
            raise ValueError("Model feature order mismatch with code definition.")
            
        self.model = data["model"]
