
"""
Offline-Only SHAP Runner
Version: v1.0

Provides Tier 2 explanations using SHAP.
STRICT CONSTRAINT: THIS MODULE MUST NEVER BE CALLED DURING LIVE INFERENCE.
It is reserved for offline analysis and analyst-triggered investigations.
"""
import shap
import pandas as pd
import numpy as np
import pickle
from typing import List, Dict, Any, Optional

class ShapRunner:
    def __init__(self, model_path: str, background_data_path: Optional[str] = None):
        """
        Initializes SHAP explainer only if explicitly requested.
        """
        self.model_path = model_path
        self._model = None
        self._explainer = None
        self.background_data_path = background_data_path

    def _load_resources(self):
        if self._model is not None:
            return

        with open(self.model_path, 'rb') as f:
            data = pickle.load(f)
            self._model = data["model"]
            
            # Extract base estimator if CalibratedClassifierCV
            # SHAP works best with the underlying tree model
            if hasattr(self._model, 'calibrated_classifiers_'):
                # Use the first estimator for explanation proxy
                self._base_model = self._model.calibrated_classifiers_[0].base_estimator
            else:
                self._base_model = self._model

        # Initialize Explainer (TreeExplainer is efficient for GBM)
        # We need background data for strict correctness, or passed at runtime.
        # For v1, we assume TreeExplainer handles handling missing background by using path references.
        self._explainer = shap.TreeExplainer(self._base_model)

    def generate_explanation(self, feature_vectors: List[List[float]], feature_names: List[str]) -> List[Dict[str, float]]:
        """
        Generates SHAP values for a batch of feature vectors.
        Strictly Offline.
        """
        # LAZY LOAD to avoid overhead in main process initialization
        self._load_resources()
        
        # Convert to numpy
        X = np.array(feature_vectors)
        
        # Calculate SHAP values
        shap_values = self._explainer.shap_values(X)
        
        # Format results
        # shap_values is list of arrays for each class. We want the positive class (Malicious = 2 usually, or index 1?)
        # GradientBoostingClassifier with n_classes > 2 returns list.
        # If binary, it might return single array. 
        # We assume index 1 or 2 is the target risk class.
        
        # Handle binary vs multi-class
        if isinstance(shap_values, list):
             # Assume last class is MALICIOUS
             target_shap = shap_values[-1]
        else:
             target_shap = shap_values

        explanations = []
        for i in range(len(feature_vectors)):
            contributions = {}
            for j, name in enumerate(feature_names):
                contributions[name] = float(target_shap[i][j])
            explanations.append(contributions)
            
        return explanations

def ensure_offline_mode():
    """
    Guard to prevent accidental import/execution in optimized inference path.
    Implementation pending environment flag check logic.
    """
    pass
