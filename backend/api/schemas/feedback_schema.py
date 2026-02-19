from typing import Literal, Dict, Any
from dataclasses import dataclass

LabelType = Literal["BENIGN", "MALICIOUS"]
SourceType = Literal["ANALYST", "OUTCOME"]

@dataclass
class FeedbackRequest:
    session_id: str
    label: LabelType
    source: SourceType

    @staticmethod
    def from_dict(data: Dict[str, Any]) -> "FeedbackRequest":
        return FeedbackRequest(
            session_id=data["session_id"],
            label=data["label"],
            source=data["source"]
        )
