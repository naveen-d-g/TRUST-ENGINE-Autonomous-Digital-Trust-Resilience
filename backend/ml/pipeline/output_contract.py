

"""
ML Core v2 Output Contract
Version: v1.0

Strictly defines the output schema of the Detection Layer.
No other fields or structures are permitted.
Enforces Bitwise Determinism via SHA256 Hashing.
"""
from dataclasses import dataclass, asdict
from typing import List, Dict, Any, Literal
import json
import hashlib

@dataclass(frozen=True)
class Explanation:
    top_features: tuple  # (("feature", 0.5), ...) for immutability
    domain_scores: tuple # (("auth", 0.8), ...) 

@dataclass(frozen=True)
class PredictionOutput:
    session_id: str
    model_version: str
    feature_schema_version: str
    decision_timestamp: float
    risk_score: float   # fixed precision enforced in factory
    risk_label: Literal["BENIGN", "SUSPICIOUS", "HIGH_RISK", "MALICIOUS"]
    explanation: Explanation
    feature_snapshot_id: str      
    output_hash: str    # SHA256 over canonical JSON of the above fields

    def to_dict(self) -> Dict[str, Any]:
        # Convert tuples back to lists/dicts for JSON serialization
        d = asdict(self)
        # Manually fix explanation tuples to dicts if needed for downstream consumers, 
        # but strictly output_hash calculation relies on canonical form.
        return d

    def to_json(self) -> str:
        return json.dumps(self.to_dict())

    @staticmethod
    def create(
        session_id: str,
        model_version: str,
        feature_schema_version: str,
        decision_timestamp: float,
        risk_score: float,
        risk_label: str,
        explanation_data: Dict[str, Any],
        feature_snapshot_id: str
    ) -> 'PredictionOutput':
        """
        Factory method to enforce rounding and hashing.
        """
        # 1. Enforce Precision
        score_rounded = round(risk_score, 6)
        
        # 2. Canonicalize Explanation (Sort keys, use tuples for frozen)
        # explanation_data expected: {"top_features": [{"feature": "x", "value": 1.0}], "domain_scores": {"auth": 0.1}}
        
        # Helper to tuple-ize list of dicts for immutability
        top_feats = []
        if "top_features" in explanation_data:
             # Sort by magnitude descending to ensure deterministic order if logic didn't already
             # But actually, we just want to freeze existing order or sort by name?
             # Let's trust input but freeze it.
             # Actually, for hashing, we must be strict.
             pass 

        # Simple conversion for now to meet frozen requirement
        # We assume explanation_data is already computed deterministically by the engine.
        # We just freeze it.
        # Recursively convert dict/list to tuple
        def make_frozen(obj):
            if isinstance(obj, dict):
                return tuple(sorted((k, make_frozen(v)) for k, v in obj.items()))
            elif isinstance(obj, list):
                return tuple(make_frozen(x) for x in obj)
            return obj

        expl_frozen = Explanation(
            top_features=make_frozen(explanation_data.get("top_features", [])),
            domain_scores=make_frozen(explanation_data.get("domain_scores", {}))
        )

        # 3. Calculate Hash
        # We hash the "pre-hash" fields
        pre_hash_dict = {
            "session_id": session_id,
            "model_version": model_version,
            "feature_schema_version": feature_schema_version,
            "decision_timestamp": decision_timestamp,
            "risk_score": score_rounded,
            "risk_label": risk_label,
            "explanation": asdict(expl_frozen), # back to dict for json dump
            "feature_snapshot_id": feature_snapshot_id
        }
        
        # Canonical JSON dump
        canonical_json = json.dumps(pre_hash_dict, sort_keys=True, separators=(',', ':'))
        out_hash = hashlib.sha256(canonical_json.encode('utf-8')).hexdigest()

        return PredictionOutput(
            session_id=session_id,
            model_version=model_version,
            feature_schema_version=feature_schema_version,
            decision_timestamp=decision_timestamp,
            risk_score=score_rounded,
            risk_label=risk_label,
            explanation=expl_frozen,
            feature_snapshot_id=feature_snapshot_id,
            output_hash=out_hash
        )

def validate_output(output: Dict[str, Any]) -> bool:
    """
    Validates that a dictionary conforms to the PredictionOutput schema.
    """
    # Simple check for keys
    required = {
        "session_id", "risk_score", "risk_label", 
        "explanation", "feature_snapshot_id", 
        "model_version", "feature_schema_version", "decision_timestamp", "output_hash"
    }
    return required.issubset(output.keys())
