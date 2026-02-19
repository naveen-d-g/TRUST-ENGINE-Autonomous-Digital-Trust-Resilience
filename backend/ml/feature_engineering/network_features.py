from typing import Dict, Any

def extract_network_features(session: Dict[str, Any]) -> Dict[str, float]:
    """
    Extracts Network-related features.
    """
    unique_ports = session.get("unique_ports", set())
    
    return {
        "port_scan_count": session.get("port_scan_count", 0),
        "unique_ports": len(unique_ports),
        "fan_out_ratio": 0.0,
        "lateral_movement_score": session.get("lateral_movement_score", 0.0),
        "scan_signature_score": 0.0
    }
