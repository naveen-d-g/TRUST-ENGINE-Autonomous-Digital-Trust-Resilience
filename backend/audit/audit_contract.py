from abc import ABC, abstractmethod

class AuditContract(ABC):
    @abstractmethod
    def append(self, record: dict) -> None:
        """Append-only audit write"""
        pass

    @abstractmethod
    def verify_chain(self) -> bool:
        """Verify hash chain integrity"""
        pass
