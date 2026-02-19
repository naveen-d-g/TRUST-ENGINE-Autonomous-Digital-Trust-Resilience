
"""
Explanation Determinism Test
Version: v1.0

Verifies that explanations are stable, deterministic, and identical across runs.
"""
import pytest
import json
from backend.ml.pipeline.output_contract import PredictionOutput

# Mock Explanation Output
MOCK_EXPLANATION = {
    "top_features": [
        {"feature": "request_rate", "value": 0.9},
        {"feature": "error_ratio", "value": 0.1}
    ],
    "domain_scores": {"web": 0.8, "api": 0.2}
}

def test_explanation_immutability():
    """
    Test that PredictionOutput correctly freezes explanation structure.
    """
    # Create Output
    out1 = PredictionOutput.create(
        session_id="test_sess",
        model_version="v1",
        feature_schema_version="v1",
        decision_timestamp=100.0,
        risk_score=0.9,
        risk_label="MALICIOUS",
        explanation_data=MOCK_EXPLANATION,
        feature_snapshot_id="hash123"
    )
    
    # Re-Create (Simulate Replay)
    out2 = PredictionOutput.create(
        session_id="test_sess",
        model_version="v1",
        feature_schema_version="v1",
        decision_timestamp=100.0, # Exact same time
        risk_score=0.9,
        risk_label="MALICIOUS",
        explanation_data=MOCK_EXPLANATION, # Exact same dict
        feature_snapshot_id="hash123"
    )

    # Assert Bitwise Identity via Hash
    assert out1.output_hash == out2.output_hash
    assert out1.explanation == out2.explanation
    
    # Assert JSON Stability
    assert out1.to_json() == out2.to_json()

def test_explanation_sorting():
    """
    Test that dictionary key variations (in domains/features) are normalized.
    """
    # Twisted order
    twisted_explanation = {
        "domain_scores": {"api": 0.2, "web": 0.8}, # flipped order
        "top_features": [
            {"value": 0.9, "feature": "request_rate"}, # flipped keys
            {"value": 0.1, "feature": "error_ratio"}
        ]
    }
    
    out3 = PredictionOutput.create(
        session_id="test_sess",
        model_version="v1",
        feature_schema_version="v1",
        decision_timestamp=100.0,
        risk_score=0.9,
        risk_label="MALICIOUS",
        explanation_data=twisted_explanation,
        feature_snapshot_id="hash123"
    )
    out_canonical = PredictionOutput.create(
        session_id="test_sess",
        model_version="v1",
        feature_schema_version="v1",
        decision_timestamp=100.0,
        risk_score=0.9,
        risk_label="MALICIOUS",
        explanation_data={
            "domain_scores": {"web": 0.8, "api": 0.2},
            "top_features": [
                {"feature": "request_rate", "value": 0.9},
                {"feature": "error_ratio", "value": 0.1}
            ]
        },
        feature_snapshot_id="hash123"
    )

    # Assert that twisted dictionary keys produce identical hash to canonical input
    # Note: List order in top_features MUST match for hash equality if not sorted by logic.
    # Our twisted input had same list order, just flipped keys inside dicts.
    assert out3.output_hash == out_canonical.output_hash
    assert out3.explanation == out_canonical.explanation

if __name__ == "__main__":
    pytest.main([__file__])
