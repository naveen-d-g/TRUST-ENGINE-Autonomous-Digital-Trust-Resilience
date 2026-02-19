from backend.session.session_snapshot import SessionSnapshot

def enforce_snapshot_only(input_obj):
    """
    BLOCKER #2: ML Guard
    """
    if not isinstance(input_obj, SessionSnapshot):
        raise RuntimeError(
            "SECURITY VIOLATION: ML received non-snapshot input"
        )
