
"""
Drift Report Schema
Version: v1.0

Defines the schema for drift monitoring reports.
Read-Only / Alert-Only.
"""
from dataclasses import dataclass, asdict
from typing import Literal

@dataclass(frozen=True)
class DriftMetric:
    feature_name: str
    metric_type: Literal["Z_SCORE", "PSI", "KS"]
    score: float
    threshold: float
    drift_detected: bool

@dataclass(frozen=True)
class DriftReport:
    model_version: str
    timestamp: float
    metrics: tuple[DriftMetric, ...] # Frozen tuple
    
    def to_dict(self):
        return asdict(self)
