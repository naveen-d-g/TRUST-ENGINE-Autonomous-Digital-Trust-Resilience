
"""
Feature Builder (Stateless)
Version: v1.0

This module transforms a SessionState object into a feature vector according to the strict schema.
It enforces time-gating to prevent data leakage.
"""
from typing import List, Dict, Any, Optional
import math
from backend.ml.core.session_state import SessionState
from backend.ml.core.feature_schema import FEATURE_ORDER, FEATURE_SCHEMA_VERSION

class FeatureBuilder:
    def __init__(self, schema_version: str = FEATURE_SCHEMA_VERSION):
        if schema_version != FEATURE_SCHEMA_VERSION:
            raise ValueError(f"Schema version mismatch: Expected {FEATURE_SCHEMA_VERSION}, got {schema_version}")

    def build_features(self, session: SessionState, decision_timestamp: Optional[float] = None) -> List[float]:
        """
        Extracts features from the session state up to the decision timestamp.
        Returns a list of floats corresponding exactly to FEATURE_ORDER.
        """
        # Strict time cutoff
        events = session.get_events_before_cutoff(decision_timestamp)
        
        # Initialize features map
        feats = {name: 0.0 for name in FEATURE_ORDER}

        if not events:
            return [feats[name] for name in FEATURE_ORDER]

        # --- Aggregate Raw Counts ---
        # Domain Models Integration (Option A)
        # We integrate the logic from Web, API, Auth, Network, System domains.

        # --- Domain: Web ---
        total_requests = len(events)
        paths = set()
        status_codes = []
        payload_sizes = []
        for e in events:
            paths.add(e.get('path', e.get('url', '')))
            status_codes.append(e.get('status_code', 200))
            payload_sizes.append(e.get('content_length', 0))
            
        start_time = events[0]['timestamp']
        end_time = events[-1]['timestamp']
        duration = max(1.0, end_time - start_time)

        feats['request_rate_per_min'] = (total_requests / duration) * 60
        feats['path_entropy'] = len(paths) / total_requests if total_requests > 0 else 0
        feats['error_4xx_ratio'] = len([s for s in status_codes if 400 <= s < 500]) / total_requests if total_requests > 0 else 0
        feats['error_5xx_ratio'] = len([s for s in status_codes if s >= 500]) / total_requests if total_requests > 0 else 0
        feats['payload_size_mean'] = sum(payload_sizes) / total_requests if total_requests > 0 else 0

        # --- Domain: API ---
        token_reuses = 0
        endpoints = []
        for e in events:
            if e.get('token_reused', False): token_reuses += 1
            endpoints.append(e.get('path', ''))
            
        feats['token_reuse_count'] = token_reuses
        feats['endpoint_variance'] = len(set(endpoints))
        feats['rate_limit_hits'] = len([s for s in status_codes if s == 429])
        # auth_failure_ratio calculation below

        # --- Domain: Auth ---
        auth_failures = 0
        login_attempts = 0
        captcha_fails = 0
        for e in events:
             if e.get('event_type') == 'LOGIN_ATTEMPT':
                login_attempts += 1
                if e.get('auth_status') == 'failed':
                    auth_failures += 1
             if e.get('event_type') == 'CAPTCHA_FAIL':
                captcha_fails += 1

        feats['failed_login_attempts'] = auth_failures
        feats['login_velocity'] = login_attempts / duration if duration > 0 else 0
        feats['captcha_failures'] = captcha_fails
        feats['auth_failure_ratio'] = auth_failures / login_attempts if login_attempts > 0 else 0

        # --- Domain: Network/System ---
        headless = 0
        bot_prob = 0.0
        for e in events:
            if e.get('headless_browser', False): headless = 1
            if e.get('bot_probability', 0) > bot_prob: bot_prob = e.get('bot_probability', 0)

        feats['distinct_paths_count'] = len(paths)
        feats['headless_browser_flag'] = headless
        feats['bot_probability_score'] = bot_prob
        feats['session_duration_sec'] = duration

        # Return strictly ordered vector
        return [feats[name] for name in FEATURE_ORDER]

    def _calculate_entropy(self, items):
        # Placeholder if strict Shannon entropy is needed later
        return 0.0
