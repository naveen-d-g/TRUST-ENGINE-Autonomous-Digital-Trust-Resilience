from dataclasses import dataclass
from uuid import UUID
from typing import List

@dataclass(frozen=True)
class SessionSnapshot:
    session_id: UUID
    event_count: int
    domains_seen: List[str]
    first_seen: str
    last_seen: str
