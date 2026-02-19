# Mocking SessionSnapshot for prompt alignment
class SessionSnapshot:
    pass

def enforce_snapshot(input_data):
    # In a real scenario, this would check against the SessionSnapshot class
    # For now, we follow the prompt's crash-on-violation rule.
    if not hasattr(input_data, 'session_id') or 'snapshot' not in str(type(input_data)).lower():
         raise RuntimeError("ML gateway violation: Raw event data blocked. Snapshot required.")
