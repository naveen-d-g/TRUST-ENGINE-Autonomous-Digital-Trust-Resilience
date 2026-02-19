import pytest
from backend.ml.schema.feature_schema import FeatureSet
from backend.ml.schema.model_contracts import BaseRiskModel

def test_feature_set_defaults():
    """Test that FeatureSet initializes with defaults."""
    fs = FeatureSet(session_id="test_session")
    assert fs.session_id == "test_session"
    assert fs.request_rate_per_min == 0.0
    assert fs.unusual_parent_process is False

def test_feature_set_parsing():
    """Test that FeatureSet parses dict correctly."""
    data = {
        "session_id": "s1",
        "request_rate_per_min": 100.0,
        "extra_field": "ignore_me"
    }
    fs = FeatureSet(**data)
    assert fs.request_rate_per_min == 100.0
    assert not hasattr(fs, "extra_field")

class MockModel(BaseRiskModel):
    MODEL_NAME = "mock"
    MODEL_VERSION = "v1"
    REQUIRED_FEATURES = ["request_rate_per_min"]
    
    def predict(self, features):
        return 0.5

def test_model_contract_metadata():
    """Test standard model metadata."""
    model = MockModel()
    assert model.metadata.name == "mock"
    assert model.metadata.version == "v1"
    assert "request_rate_per_min" in model.metadata.required_features

def test_pydantic_integration():
    """Test that models accept FeatureSet objects."""
    model = MockModel()
    fs = FeatureSet(session_id="test", request_rate_per_min=50.0)
    # validate_features should pass
    model.validate_features(fs)
    assert model.predict(fs) == 0.5
