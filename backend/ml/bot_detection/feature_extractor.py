import numpy as np

def extract_mouse_features(events):
    """
    Converts raw mouse event data into behavioral feature vectors.
    events: List of dicts with {x, y, time}
    """
    if not events or len(events) < 2:
        return {
            "avg_velocity": 0,
            "velocity_std": 0,
            "avg_acceleration": 0,
            "movement_entropy": 0,
            "avg_interval": 0,
            "idle_count": 0
        }

    velocities = []
    accelerations = []
    intervals = []
    
    for i in range(1, len(events)):
        dx = events[i]["x"] - events[i-1]["x"]
        dy = events[i]["y"] - events[i-1]["y"]
        dt = (events[i]["time"] - events[i-1]["time"]) / 1000.0 # convert to seconds

        if dt > 0:
            velocity = np.sqrt(dx**2 + dy**2) / dt
            velocities.append(velocity)
            intervals.append(dt)
            
            if len(velocities) > 1:
                dv = velocities[-1] - velocities[-2]
                accelerations.append(dv / dt)

    # Simplified entropy calculation based on velocity distribution
    velocity_hist, _ = np.histogram(velocities, bins=10)
    velocity_hist = velocity_hist / np.sum(velocity_hist) if np.sum(velocity_hist) > 0 else []
    entropy = -np.sum(velocity_hist * np.log2(velocity_hist + 1e-9)) if len(velocity_hist) > 0 else 0

    return {
        "avg_velocity": float(np.mean(velocities)) if velocities else 0.0,
        "velocity_std": float(np.std(velocities)) if velocities else 0.0,
        "avg_acceleration": float(np.mean(accelerations)) if accelerations else 0.0,
        "movement_entropy": float(entropy),
        "avg_interval": float(np.mean(intervals)) if intervals else 0.0,
        "idle_count": sum(1 for dt in intervals if dt > 2.0) # > 2 seconds idle
    }
