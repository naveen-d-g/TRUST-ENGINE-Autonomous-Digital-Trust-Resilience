class DecisionType:
    ALLOW = "ALLOW"
    MONITOR = "MONITOR"
    RESTRICT = "RESTRICT"
    ESCALATE = "ESCALATE"

class ActionType:
    NONE = "none"
    CAPTCHA = "captcha"
    RATE_LIMIT = "rate_limit"
    STEP_UP_AUTH = "step_up_auth"
    SESSION_FREEZE = "session_freeze"
    ISOLATE_IP = "isolate_ip"
