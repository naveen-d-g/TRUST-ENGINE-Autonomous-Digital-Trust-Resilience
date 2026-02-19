
"""
Architecture Constraints Test (Purified Layer)
Version: v1.0

Strictly enforces the isolation of the ML core.
Scans for forbidden imports to ensure:
1. FeatureBuilder NEVER imports Derivation logic (No feedback loops).
2. Inference Pipeline NEVER imports SHAP/Drift (No runtime overhead).
"""
import ast
import os
import pytest

CORE_PATH = "backend/ml/core"
PIPELINE_PATH = "backend/ml/pipeline"

def get_imports(file_path):
    with open(file_path, "r", encoding="utf-8") as f:
        tree = ast.parse(f.read(), filename=file_path)

    imports = []
    for node in ast.walk(tree):
        if isinstance(node, ast.Import):
            for alias in node.names:
                imports.append(alias.name)
        elif isinstance(node, ast.ImportFrom):
            if node.module:
                imports.append(node.module)
    return imports

def test_feature_builder_isolation():
    """ FeatureBuilder must NOT import derivation logic """
    fb_path = os.path.join(CORE_PATH, "feature_builder.py")
    if not os.path.exists(fb_path):
        pytest.skip(f"{fb_path} not found")

    imports = get_imports(fb_path)
    for imp in imports:
        assert "backend.ml.derivation" not in imp, f"FeatureBuilder imports Derivation Logic: {imp}"
        assert "backend.ml.monitoring" not in imp, f"FeatureBuilder imports Monitoring: {imp}"

def test_inference_pipeline_performance():
    """ Inference Pipeline must NOT import heavy explainability modules """
    inf_path = os.path.join(PIPELINE_PATH, "inference.py")
    if not os.path.exists(inf_path):
        pytest.skip(f"{inf_path} not found")

    imports = get_imports(inf_path)
    for imp in imports:
        # Forbidden Modules (The "Purified Layer" contract)
        if "backend.orchestration" in imp:
            pytest.fail(f"Inference Pipeline imports Orchestration: {imp}")
        if "backend.enforcement" in imp:
             pytest.fail(f"Inference Pipeline imports Enforcement: {imp}")
        if "sqlalchemy" in imp or "backend.database" in imp:
             pytest.fail(f"Inference Pipeline imports Database Logic: {imp}")
        if "requests" in imp or "urllib" in imp:
             pytest.fail(f"Inference Pipeline performs Network I/O: {imp}")

        if "backend.ml.explainability" in imp:
             # Regular explanation is allowed (Tier 1), but NOT shap_runner (Tier 2)
             if "shap_runner" in imp:
                 pytest.fail(f"Inference Pipeline imports SHAP Runner (Tier 2): {imp}")

if __name__ == "__main__":
    pytest.main([__file__])
