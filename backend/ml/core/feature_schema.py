
"""
Feature Schema & Ordering Contract
Version: v1.0

This file defines the strict order and type of features used in the ML model.
This schema MUST be versioned. If the schema changes, the version must be bumped,
and models must be retrained.

Determinism Contract:
- The order of features in `FEATURE_ORDER` is immutable for a given version.
- Feature vectors must always strictly follow this order.
"""
import hashlib

FEATURE_SCHEMA_VERSION = "v1.0"

# STRICT FEATURE ORDER (Tuple for immutability)
FEATURE_ORDER = (
    # --- Web Features ---
    "request_rate_per_min",      # Float: Requests per minute
    "path_entropy",              # Float: Randomness of paths accessed
    "error_4xx_ratio",           # Float: Ratio of 4xx errors
    "error_5xx_ratio",           # Float: Ratio of 5xx errors
    "payload_size_mean",         # Float: Average payload size (bytes)
    
    # --- API Features ---
    "token_reuse_count",         # Int: Times token was reused (if applicable)
    "endpoint_variance",         # Float: Variance in endpoints accessed
    "rate_limit_hits",           # Int: Number of 429 responses
    "auth_failure_ratio",        # Float: Ratio of failed auth attempts
    
    # --- Auth Features ---
    "failed_login_attempts",     # Int: Count of failed logins
    "login_velocity",            # Float: Speed of login attempts
    "captcha_failures",          # Int: Count of failed captchas
    
    # --- Network/System Features ---
    "distinct_paths_count",      # Int: Number of unique paths visited
    "headless_browser_flag",     # Int: 1 if headless detected, else 0
    "bot_probability_score",     # Float: Heuristic bot score
    "session_duration_sec",      # Float: Duration of session in seconds
)

# Calculate Schema Hash (SHA256 of comma-separated list)
# This hash MUST match the model's expected schema hash during inference.
_schema_string = ",".join(FEATURE_ORDER)
FEATURE_SCHEMA_HASH = hashlib.sha256(_schema_string.encode('utf-8')).hexdigest()

def validate_schema_compatibility(model_schema_hash: str):
    """
    Raises error if runtime schema hash does not match model's expected hash.
    """
    if model_schema_hash != FEATURE_SCHEMA_HASH:
        raise ValueError(
            f"Schema Mismatch! Runtime: {FEATURE_SCHEMA_HASH[:8]}... "
            f"vs Model: {model_schema_hash[:8]}..."
        )

def get_feature_index(feature_name: str) -> int:
    """
    Returns the index of a feature in the vector.
    Raises ValueError if feature not found.
    """
    return FEATURE_ORDER.index(feature_name)
