import pytest
from backend.ml.inference_adapter import evaluate_session

def test_raw_event_rejected():
    with pytest.raises(RuntimeError) as excinfo:
        evaluate_session({"bad": "data"})
    assert "ML INPUT VIOLATION" in str(excinfo.value)
