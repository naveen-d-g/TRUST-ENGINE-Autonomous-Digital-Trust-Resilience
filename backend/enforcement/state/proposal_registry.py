import time
import uuid
import hashlib
from typing import Dict, Any, Optional, List
from backend.orchestration.execution_context import ExecutionContext

from backend.enforcement.state_machine.enforcement_state_machine import EnforcementState, EnforcementStateMachine

class ProposalRegistry:
    """
    In-memory registry for Enforcement Proposals.
    Tracks state, prevents duplicates (idempotency), handles TTL.
    """
    _proposals: Dict[str, Dict[str, Any]] = {} 
    _dedup_index: Dict[str, str] = {} # hash -> proposal_id

    PROPOSAL_TTL = 3600 # 1 hour

    @classmethod
    def register_proposal(cls, context: ExecutionContext, suggested_action: str) -> Optional[str]:
        """
        Creates a new proposal if one doesn't exist for this decision hash.
        Returns proposal_id if created, or existing ID if dup.
        """
        # 1. Clean expired
        cls._cleanup()

        # 2. Compute Dedup Hash (Session + Decision + Risk Score bucket + Time Window)
        # We allow re-proposal after 5 mins if same risk
        time_bucket = int(time.time() / 300) 
        raw_key = f"{context.session_id}:{context.decision}:{int(context.risk_score)}:{time_bucket}"
        dedup_hash = hashlib.sha256(raw_key.encode()).hexdigest()

        if dedup_hash in cls._dedup_index:
            pid = cls._dedup_index[dedup_hash]
            if pid in cls._proposals:
                return pid
            # Found in index but missing in storage? Stale. Remove and continue.
            del cls._dedup_index[dedup_hash]

        # 3. Create Proposal
        pid = str(uuid.uuid4())
        proposal = {
            "id": pid,
            "session_id": context.session_id,
            "user_id": context.user_id, # Flattened for Indexing
            "decision": context.decision,
            "risk_score": context.risk_score,
            "suggested_action": suggested_action,
            "context": context.to_dict(),
            "status": EnforcementState.CREATED,
            "created_at": time.time(),
            "expires_at": time.time() + cls.PROPOSAL_TTL,
            "auto_rollback_at": time.time() + cls.PROPOSAL_TTL + 3600, # Default auto-rollback window
            "dedup_hash": dedup_hash,
            "execution_lock": False
        }
        
        cls._proposals[pid] = proposal
        cls._dedup_index[dedup_hash] = pid
        
        return pid

    @classmethod
    def get_proposal(cls, pid: str) -> Optional[Dict[str, Any]]:
        return cls._proposals.get(pid)

    @classmethod
    def update_status(cls, pid: str, status: str):
        if pid in cls._proposals:
            current = cls._proposals[pid]["status"]
            # Validate transition using State Machine
            EnforcementStateMachine.validate_transition(current, status)
            cls._proposals[pid]["status"] = status
            
    @classmethod
    def list_proposals(cls, status_filter: str = None) -> List[Dict[str, Any]]:
        if status_filter:
            return [v for v in cls._proposals.values() if v["status"] == status_filter]
        return list(cls._proposals.values())

    @classmethod
    def _cleanup(cls):
        now = time.time()
        expired_ids = [pid for pid, p in cls._proposals.items() if p["expires_at"] < now]
        for pid in expired_ids:
            h = cls._proposals[pid]["dedup_hash"]
            if h in cls._dedup_index:
                del cls._dedup_index[h]
            del cls._proposals[pid]
