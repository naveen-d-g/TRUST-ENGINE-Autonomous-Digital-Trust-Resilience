from typing import Dict, Any

class RecoveryEffectivenessTracker:
    """
    Tracks and scores the effectiveness of recovery challenges (CAPTCHA, MFA).
    """
    
    # In-memory stats: ChallengeType -> { "solved": int, "abandoned": int, "failed": int, "avg_time": float }
    _stats: Dict[str, Dict[str, Any]] = {}

    @classmethod
    def track_outcome(cls, challenge_type: str, outcome: str, resolution_time: float):
        """
        Log a recovery attempt outcome.
        outcome: "SOLVED", "ABANDONED", "FAILED"
        """
        if challenge_type not in cls._stats:
            cls._stats[challenge_type] = {"solved": 0, "abandoned": 0, "failed": 0, "total_time": 0.0, "count": 0}
            
        s = cls._stats[challenge_type]
        
        if outcome == "SOLVED":
            s["solved"] += 1
            s["total_time"] += resolution_time
            s["count"] += 1
        elif outcome == "ABANDONED":
            s["abandoned"] += 1
        elif outcome == "FAILED":
            s["failed"] += 1
            
    @classmethod
    def get_effectiveness_score(cls, challenge_type: str) -> float:
        """
        Returns a score [0, 1] representing how 'good' this challenge is.
        Factors: High solve rate (good user exp) + fast resolution.
        (Note: In a real security system, 'abandoned' might be GOOD if it stops bots, 
        but BAD if it stops humans. We need a 'human_likelihood' context to know. 
        For now, we assume we want GENUINE users to solve it.)
        """
        s = cls._stats.get(challenge_type)
        if not s or (s["solved"] + s["abandoned"] + s["failed"] == 0):
            return 0.5 # Neutral
            
        total = s["solved"] + s["abandoned"] + s["failed"]
        solve_rate = s["solved"] / total
        
        # Bonus for speed (if solved)
        # Normalize time? Say < 30s is good.
        avg_time = s["total_time"] / s["count"] if s["count"] > 0 else 60.0
        time_factor = 1.0 if avg_time < 30 else (30.0 / avg_time)
        
        return solve_rate * 0.8 + time_factor * 0.2
