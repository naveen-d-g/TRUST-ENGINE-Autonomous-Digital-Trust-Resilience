# ML Detection Core v2 (Purified Layer) - Contract & Constitution

## 📜 Core Guarantees

1.  **Bitwise Determinism**:
    - Replaying the same sequence of `CanonicalEvent`s MUST produce a bitwise-identical `PredictionOutput`.
    - This includes Risk Score, Label, Explanation, and Feature Snapshot.

2.  **Immutability**:
    - Predictions are **frozen** once emitted.
    - No downstream component (Orchestration, Enforcement) may modify a prediction.

3.  **Strict Isolation (The "Purified Layer")**:
    - The ML Core (`backend/ml/core`, `backend/ml/pipeline`) is **stateless** and **isolated**.
    - **FORBIDDEN IMPORTS**:
      - `backend.orchestration`
      - `backend.enforcement`
      - `backend.database` (SQLAlchemy)
      - `requests` (No external network calls)
    - **ALLOWED EVENTS**:
      - Inputs: Raw Dictionaries (passed through `CanonicalEvent` normalization).
      - Outputs: `PredictionOutput` frozen objects.

4.  **No Online Learning**:
    - Model weights are **static** in production.
    - Updates occur ONLY via offline training + governed usage of `ModelRegistry`.
    - Feedback (`OutcomeEmitter`) is written to a log/store but NEVER triggers immediate training.

5.  **Explanations**:
    - Tier 1 (Determinism): Tree path contributions (Online).
    - Tier 2 (Deep Analysis): SHAP (Offline Only).

## 🏗️ Architecture

- **`core/`**: Session Aggregation, Feature Building (Time-Gated).
- **`models/`**: Static Model Wrappers (GradientBoosting).
- **`pipeline/`**: Inference Orchestration.
- **`guards/`**: Immutability & Leakage Protection.
- **`training/`**: Offline Training Scripts (Reproducible).

## 🚫 Hard Prohibitions

- **NO** Access to "Live" DB State inside `inference_pipeline.py`.
- **NO** "User Risk" feedback loops into `FeatureBuilder` (Derivation leakage).
- **NO** Thread-local storage for session state. All state must be passed explicitly.

---

_Violation of this contract constitutes a Critical System Failure._
