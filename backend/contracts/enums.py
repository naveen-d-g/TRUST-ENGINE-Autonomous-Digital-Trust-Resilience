from enum import Enum

class DomainEnum(str, Enum):
    WEB = "WEB"
    API = "API"
    NETWORK = "NETWORK"
    SYSTEM = "SYSTEM"


class ActorTypeEnum(str, Enum):
    USER = "USER"
    SERVICE = "SERVICE"


class Role(str, Enum):
    VIEWER = "VIEWER"
    ANALYST = "ANALYST"
    ADMIN = "ADMIN"

class IngestionSourceEnum(str, Enum):
    USER_PLATFORM = "USER_PLATFORM"
    SECURITY_PLATFORM = "SECURITY_PLATFORM"


class EventTypeEnum(str, Enum):
    AUTH_LOGIN = "AUTH_LOGIN"
    AUTH_FAILED = "AUTH_FAILED"
    API_CALL = "API_CALL"
    SYSTEM_ERROR = "SYSTEM_ERROR"

# Aliases for compatibility
Domain = DomainEnum
ActorType = ActorTypeEnum
Platform = IngestionSourceEnum
EventType = EventTypeEnum

class SignalSeverity(str, Enum):
    INFO = "INFO"
    LOW = "LOW"
    MEDIUM = "MEDIUM"
    HIGH = "HIGH"
    CRITICAL = "CRITICAL"


