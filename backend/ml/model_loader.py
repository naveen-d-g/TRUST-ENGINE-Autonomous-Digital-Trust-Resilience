
import joblib
import sys
import os
from pathlib import Path
from backend.config import MODELS_DIR
from models.new_models import WebAbuseModel, APIAbuseModel, NetworkAnomalyModel, InfraStressModel
import warnings

# Suppress warnings about version mismatch (e.g. 1.8.0 vs 1.4.2)
try:
    from sklearn.exceptions import InconsistentVersionWarning
    warnings.simplefilter("ignore", InconsistentVersionWarning)
except ImportError:
    pass

def load_models():
    print(f"Loading models from {MODELS_DIR}...")
    try:
        # Load existing pickled models
        bot_model = joblib.load(MODELS_DIR / "bot_model/bot_model.pkl")
        attack_model = joblib.load(MODELS_DIR / "attack_model/attack_model.pkl")
        anomaly_model = joblib.load(MODELS_DIR / "anomaly_model/anomaly_model.pkl")
        
        # Instantiate new heuristic models
        # These are classes, so we need to call them
        web_model = WebAbuseModel()
        api_model = APIAbuseModel()
        network_model = NetworkAnomalyModel()
        infra_model = InfraStressModel()
        
        return {
            "bot_model": bot_model,
            "attack_model": attack_model,
            "anomaly_model": anomaly_model,
            "web_model": web_model,
            "api_model": api_model,
            "network_model": network_model,
            "infra_model": infra_model
        }
    except Exception as e:
        print(f"Error loading models: {e}")
        raise e
