
import hashlib

class PrivacyGuard:
    """
    Ensures no PII leaves the system.
    """
    SALT = "CHANGE_ME_IN_PROD" 

    @classmethod
    def anonymize(cls, raw_id: str) -> str:
        """
        Returns SHA256 hash of entity ID with salt.
        """
        combined = f"{raw_id}:{cls.SALT}"
        return hashlib.sha256(combined.encode()).hexdigest()
    
    @classmethod
    def validate_hash(cls, entity_hash: str) -> bool:
        # Simple regex or length check
        return len(entity_hash) == 64
