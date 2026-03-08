def rule_based_bot_check(features):
    """
    Detects deterministic automation patterns that violate human physics.
    """
    
    # 1. Robotic Timing (Perfectly consistent intervals)
    if 0 < features.get("avg_interval", 0) < 0.005: # < 5ms is non-human
        return 0.95

    # 2. Perfect Smoothness (Zero velocity jitter)
    if features.get("avg_velocity", 0) > 0 and features.get("velocity_std", 0) < 0.1:
        return 0.9

    # 3. High Speed Navigation
    if features.get("avg_velocity", 0) > 10000: # Virtual mouse warping
        return 0.85

    # 4. Low Interaction Entropy (Scripted linear moves)
    if features.get("movement_entropy", 0) < 0.5 and features.get("avg_velocity", 0) > 0:
        return 0.75

    return 0.0
