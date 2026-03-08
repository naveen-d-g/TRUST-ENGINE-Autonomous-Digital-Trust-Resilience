from .feature_extractor import extract_mouse_features
from .xgboost_model import predict_bot_probability
from .rule_engine import rule_based_bot_check

def detect_bot(mouse_events):
    """
    Entry point for behavior-based bot detection.
    Combines feature extraction, rule-based heuristics, and ML inference.
    """
    if not mouse_events or len(mouse_events) < 5:
        return 0.0, {}

    # 1. Extract features
    features = extract_mouse_features(mouse_events)

    # 2. Heuristic check
    rule_score = rule_based_bot_check(features)

    # 3. ML inference
    ml_score = predict_bot_probability(features)

    # 4. Final fusion (Take maximum of both or weighted average)
    # Using max ensures that if a rule is triggered (deterministic bot), we catch it even if ML is unsure.
    final_bot_probability = max(rule_score, ml_score)

    return float(final_bot_probability), features
