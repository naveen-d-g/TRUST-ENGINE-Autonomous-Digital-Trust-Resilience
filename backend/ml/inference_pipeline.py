from typing import Dict, Any, Optional
import time

# Schemas
from backend.ml.schema.feature_schema import FeatureSet
from backend.ml.inference_contract import InferenceResult

# Feature Engineering
from backend.ml.feature_engineering.web_features import extract_web_features
from backend.ml.feature_engineering.api_features import extract_api_features
from backend.ml.feature_engineering.auth_features import extract_auth_features
from backend.ml.feature_engineering.network_features import extract_network_features
from backend.ml.feature_engineering.system_features import extract_system_features
from backend.ml.feature_engineering.meta_features import extract_meta_features

# Models
from backend.ml.models.web_abuse_model import WebAbuseModel
from backend.ml.models.api_abuse_model import APIAbuseModel
from backend.ml.models.auth_abuse_model import AuthAbuseModel
from backend.ml.models.network_attack_model import NetworkAttackModel
from backend.ml.models.system_attack_model import SystemAttackModel
from backend.ml.models.generic_anomaly_model import GenericAnomalyModel

# Engines
from backend.ml.fusion.risk_fusion_engine import RiskFusionEngine
from backend.ml.decision.decision_engine import DecisionEngine
from backend.ml.explanation.explanation_engine import ExplanationEngine
from backend.ml.suggestion.suggestion_engine import SuggestionEngine
from backend.ml.recovery.recovery_engine import RecoveryEngine

# Registry
from backend.ml.registry.model_registry import ModelRegistry

# --- Initialization ---
def initialize_registry():
    """Bootstraps the model registry."""
    if not ModelRegistry.get_model("web"):
        ModelRegistry.register_model("web", WebAbuseModel(), WebAbuseModel.MODEL_VERSION)
        ModelRegistry.register_model("api", APIAbuseModel(), APIAbuseModel.MODEL_VERSION)
        ModelRegistry.register_model("auth", AuthAbuseModel(), AuthAbuseModel.MODEL_VERSION)
        ModelRegistry.register_model("network", NetworkAttackModel(), NetworkAttackModel.MODEL_VERSION)
        ModelRegistry.register_model("system", SystemAttackModel(), SystemAttackModel.MODEL_VERSION)
        ModelRegistry.register_model("anomaly", GenericAnomalyModel(), GenericAnomalyModel.MODEL_VERSION)

# Ensure initialized on import if possible, or lazy load
initialize_registry()

def evaluate_session(session_state: Dict[str, Any], context: Dict[str, Any] = None) -> InferenceResult:
    """
    Main Entry Point.
    Takes raw session state (from SessionStateEngine), runs full pipeline.
    """
    context = context or {}
    
    # 1. Feature Extraction & Assembly
    # We extract partials and merge into one FeatureSet
    f_web = extract_web_features(session_state)
    f_api = extract_api_features(session_state)
    f_auth = extract_auth_features(session_state)
    f_net = extract_network_features(session_state)
    f_sys = extract_system_features(session_state)
    f_meta = extract_meta_features(session_state)
    
    # Combine all
    combined_features = {
        "session_id": session_state.get("session_id", "unknown"),
        **f_web, **f_api, **f_auth, **f_net, **f_sys, **f_meta
    }
    
    # Validation via Pydantic
    feature_set = FeatureSet(**combined_features)
    
    # 2. Model Inference
    # Get Champions
    models = {
        "web": ModelRegistry.get_model("web"),
        "api": ModelRegistry.get_model("api"),
        "auth": ModelRegistry.get_model("auth"),
        "network": ModelRegistry.get_model("network"),
        "system": ModelRegistry.get_model("system"),
        "anomaly": ModelRegistry.get_model("anomaly"),
    }
    
    probs = {}
    for domain, model in models.items():
        if model:
            probs[domain] = model.predict(feature_set)
        else:
            probs[domain] = 0.0 # Fail safe
            
    # 3. Risk Fusion
    fusion_result = RiskFusionEngine.compute_risk(probs, combined_features)
    risk_score = fusion_result["risk_score"]
    
    # 4. Decision Engine
    decision_result = DecisionEngine.decide(risk_score, combined_features, context)
    final_decision = decision_result["final_decision"]
    audit_trail = decision_result["audit_trail"]
    
    # 5. Explanation & Intelligence
    explanation = ExplanationEngine.explain(probs, combined_features, final_decision)
    suggestions = SuggestionEngine.suggest(probs, combined_features)
    recovery_steps = RecoveryEngine.recommend_recovery(combined_features)
    
    # 6. Final Response Construction
    # STRICT CONTRACT: Return InferenceResult object
    return InferenceResult(
        session_id=feature_set.session_id,
        risk_score=risk_score,
        decision=final_decision,
        explanation={
            "primary_cause": explanation["primary_cause"],
            "contributing_factors": explanation["contributing_factors"],
            "prevention_suggestions": suggestions,
            "recovery_advice": recovery_steps,
            "amplified": fusion_result["amplified"],
            "audit_trail": audit_trail,
            "breakdown": probs # Include breakdown in explanation for debugging
        },
        model_versions={name: model.MODEL_VERSION for name, model in models.items() if model},
        policy_version="1.0.0", # TODO: Version policy engine
        metadata={
             "metrics": {
                "bot_probability": probs.get("auth", 0.0),
                "attack_probability": max(probs.get("auth", 0), probs.get("network", 0), probs.get("system", 0)),
                "anomaly_score": probs.get("anomaly", 0.0),
                "risk_score": risk_score,
                "anomaly_amplified": fusion_result["amplified"],
                "web_abuse_probability": probs.get("web", 0.0),
                "api_abuse_probability": probs.get("api", 0.0),
                "network_anomaly_score": probs.get("network", 0.0),
                "infra_stress_score": probs.get("system", 0.0)
            }
        }
    )


def get_models():
    return {
        "web": ModelRegistry.get_model("web"),
        "api": ModelRegistry.get_model("api"),
        "auth": ModelRegistry.get_model("auth"),
        "network": ModelRegistry.get_model("network"),
        "system": ModelRegistry.get_model("system"),
        "anomaly": ModelRegistry.get_model("anomaly"),
    }

def get_pipeline_metadata():
    return {"version": "2.0.0", "last_updated": "2026-02-09"}


# Backward Compatibility Alias
evaluate_single_session = evaluate_session
