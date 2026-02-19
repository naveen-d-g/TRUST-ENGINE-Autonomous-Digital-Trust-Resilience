def score_event(event_type):
    if event_type == "AUTH_LOGIN":
        return 1.0
    if event_type == "AUTH_FAIL":
        return 5.0
    return 0.5
