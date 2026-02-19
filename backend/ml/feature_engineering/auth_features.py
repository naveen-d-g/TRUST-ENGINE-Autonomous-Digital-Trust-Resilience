from typing import Dict, Any
import statistics

def extract_auth_features(session: Dict[str, Any]) -> Dict[str, float]:
    """
    Extracts Authentication-related features.
    """
    auth_timestamps = list(session.get("auth_timestamps", []))
    time_btwn = 0.0
    if len(auth_timestamps) > 1:
        diffs = [t2 - t1 for t1, t2 in zip(auth_timestamps, auth_timestamps[1:])]
        time_btwn = statistics.mean(diffs)
        
    auth_velocity = 0.0
    if len(auth_timestamps) > 1:
        dur = auth_timestamps[-1] - auth_timestamps[0]
        if dur > 0.001:
            auth_velocity = (len(auth_timestamps) / dur) * 60
            
    is_sim = session.get("is_simulation", False)
            
    return {
        "failed_login_attempts": session.get("failed_login_attempts", 0) if is_sim else session.get("failed_login_counter", 0),
        "login_velocity": session.get("login_velocity", 0.0) if is_sim else auth_velocity,
        "time_between_attempts": time_btwn,
        "captcha_failures": session.get("captcha_failures", 0), # This one was already pulling from session, so it's fine
        "credential_entropy": session.get("credential_entropy", 0.0) if is_sim else 0.0
    }
