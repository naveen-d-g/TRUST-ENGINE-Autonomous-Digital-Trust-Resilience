from typing import Dict, Any, Tuple
from backend.orchestration.execution_context import ExecutionContext
from backend.enforcement.policy.enforcement_rules import EnforcementRules

class EnforcementPolicyEngine:
    """
    Evaluates if an enforcement proposal is valid and safe.
    Enforces 'Manual-First' by defaulting to PENDING state for most actions.
    """
    
    @staticmethod
    def evaluate(context: ExecutionContext) -> Tuple[str, bool]:
        """
        Returns (Suggested Action, Is_Auto_Executable).
        """
        # 1. Get Suggested Action based on Rules
        action = EnforcementRules.get_allowed_action(
            context.decision, 
            context.risk_score, 
            context.trust_score
        )
        
        # 2. Check Action Safety
        is_auto = False
        
        # Override: If action is safe AND confidence is high AND trust is low -> maybe auto
        # BUT User Requirement: "NO auto-blocking logic".
        # So we only allow very specific soft actions to be auto if configured.
        
        if action in EnforcementRules.SAFE_AUTO_ACTIONS:
            # Example: Rate limit might be auto if risk > 50
            if context.risk_score > 50:
                is_auto = True
        
        if action in EnforcementRules.MANUAL_ONLY_ACTIONS:
            is_auto = False
            
        # 3. Trust Safety Net
        # Never auto-penalize high trust users
        if context.trust_score > 85:
            is_auto = False
            
        return action, is_auto
