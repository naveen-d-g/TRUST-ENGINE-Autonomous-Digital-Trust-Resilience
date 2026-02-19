import time

class ApprovalWorkflow:
    """
    Manages the lifecycle of an enforcement proposal.
    """

    @staticmethod
    def validate_approval(proposal: dict, approver_role: str) -> bool:
        """
        Checks if the approver has sufficient rights.
        """
        action = proposal.get("suggested_action")
        
        # Admin required for critical actions
        if action in ["SYSTEM_ISOLATE", "REVOKE_TOKEN"]:
            if approver_role != "admin":
                return False
                
        # Analyst can approve basic stuff
        if approver_role in ["analyst", "admin"]:
            return True
            
        return False

    @classmethod
    def sign_approval(cls, proposal: dict, approver_id: str, role: str, justification: str) -> dict:
        """
        Attached accountability metadata.
        """
        # Safe Mode Check
        from backend.governance.safe_mode import SafeMode
        # Proposal has 'context' dict
        tenant_id = proposal.get("context", {}).get("tenant_id")
        if tenant_id and SafeMode.is_enabled(tenant_id):
             raise ValueError("Safe Mode is Enabled. Approvals are suspended.")

        if not justification or len(justification.strip()) < 5:
             # Justification Policy
             # In a real system, we might stricter checks based on Severity.
             # Master Prompt says "If severity >= HIGH -> justification mandatory".
             # We assume High Risk actions imply High Severity here, or we trust the caller.
             # But let's enforce a baseline.
             raise ValueError("Approval requires valid justification.")

        proposal["approved_by"] = approver_id
        proposal["approval_role"] = role
        proposal["approval_justification"] = justification
        proposal["approval_timestamp"] = time.time()
        return proposal

    @staticmethod
    def is_expired(proposal: dict) -> bool:
        return time.time() > proposal.get("expires_at", 0)
