
from typing import Dict, Any, List
import copy
import random

class AttackSimulator:
    """
    Simulates adversarial adaptation (Evasion attacks).
    """
    
    @staticmethod
    def mutate_features(features: Dict[str, Any], mutation_type: str = "noise") -> Dict[str, Any]:
        """
        Applies adversarial mutations.
        """
        mutated = copy.deepcopy(features)
        
        if mutation_type == "noise":
            # Add random noise to numericals
            if "request_rate_per_min" in mutated:
                mutated["request_rate_per_min"] += random.randint(-5, 5)
                
        elif mutation_type == "slow_roll":
            # Reduce rate to evade velocity checks
            if "request_rate_per_min" in mutated:
                mutated["request_rate_per_min"] *= 0.1
                
        return mutated

    @classmethod
    def run_simulation(cls, base_features: Dict[str, Any], model) -> Dict[str, Any]:
        """
        Tests if mutations bypass the model.
        """
        original_score = model.predict(base_features)
        
        attacks = ["noise", "slow_roll"]
        results = {}
        
        for attack in attacks:
            mutant = cls.mutate_features(base_features, attack)
            new_score = model.predict(mutant)
            results[attack] = {
                "original_score": original_score,
                "new_score": new_score,
                "bypassed": (original_score > 0.8 and new_score < 0.5) # Example threshold
            }
            
        return results
