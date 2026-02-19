from typing import Dict, Any, List
from backend.ml.decision.prevention_modes import ActionType

class SuggestionEngine:
    """
    Generates deterministic prevention suggestions.
    """
    @staticmethod
    def suggest(probs: Dict[str, float], features: Dict[str, Any]) -> List[str]:
        # 1. Generate Candidates
        candidates = set()
        
        # Web / API
        if probs.get("web", 0) > 0.5 or probs.get("api", 0) > 0.5:
            candidates.add(ActionType.RATE_LIMIT)
            candidates.add(ActionType.CAPTCHA)
            
        # Auth
        if probs.get("auth", 0) > 0.5:
            candidates.add(ActionType.STEP_UP_AUTH)
            
        # Network / System (Severe)
        if probs.get("network", 0) > 0.6 or probs.get("system", 0) > 0.6:
            candidates.add(ActionType.SESSION_FREEZE)
            candidates.add(ActionType.ISOLATE_IP)
            
        if not candidates:
            return []

        # 2. Score & Rank Candidates (ML Learning)
        from backend.ml.learning.enforcement_outcome_model import EnforcementOutcomeModel
        from backend.ml.recovery_learning.recovery_effectiveness_tracker import RecoveryEffectivenessTracker
        
        scored_candidates = []
        for action in candidates:
            # Base Score (could come from policy/model, here we assume equal)
            base_score = 1.0 
            
            # Outcome Learning Score [-1, 1]
            outcome_score = EnforcementOutcomeModel.get_effectiveness_score(action, features)
            
            # Recovery Score [0, 1] (if applicable)
            recovery_score = 0.5 # Neutral default
            if action in [ActionType.CAPTCHA, ActionType.STEP_UP_AUTH]:
                recovery_score = RecoveryEffectivenessTracker.get_effectiveness_score(action)
                
            # Final Weight
            # We promote actions with positive outcomes and high recovery effectiveness
            # Weight = Base * (1 + Outcome) * (0.5 + Recovery)
            weight = base_score * (1.0 + 0.5 * outcome_score) * (0.5 + recovery_score)
            
            scored_candidates.append((action, weight))
            
        # 3. Sort by Weight Descending
        scored_candidates.sort(key=lambda x: x[1], reverse=True)
        
        # Return sorted action names
        return [x[0] for x in scored_candidates]
