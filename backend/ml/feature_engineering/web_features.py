from typing import Dict, Any, List
import statistics
import math
import re

# Simple Regex for basic SQLi detection (Demo purposes)
SQLI_PATTERN = re.compile(r"(union\s+select|or\s+1=1|drop\s+table|insert\s+into)", re.IGNORECASE)

def calculate_entropy(data_list):
    if not data_list: return 0.0
    counter = {}
    total = len(data_list)
    for item in data_list:
        counter[item] = counter.get(item, 0) + 1
    entropy = 0.0
    for count in counter.values():
        p = count / total
        entropy -= p * math.log2(p)
    return entropy

def extract_web_features(session: Dict[str, Any]) -> Dict[str, float]:
    """
    Extracts features from 'events' list in session dict.
    """
    events = session.get("events", [])
    
    # 1. Extract raw lists
    timestamps = []
    paths = []
    status_codes = [] # We might not have this in request events, only response events
    payloads = []
    
    scanner_score = 0.0
    
    for e in events:
        # Timestamp
        ts = e.get("timestamp")
        if isinstance(ts, str):
            # Parse ISO if string
            try:
                # Basic ISO parser or ignore for speed
                pass 
            except: pass
        elif isinstance(ts, (int, float)):
             timestamps.append(ts)
             
        # Payload Analysis
        payload = e.get("payload", {})
        if isinstance(payload, dict):
            # Check for SQLi in values
            for v in payload.values():
                if isinstance(v, str) and SQLI_PATTERN.search(v):
                    scanner_score = 1.0
            
            # Path extraction
            if "url" in payload:
                paths.append(payload["url"])
            if "path" in payload:
                paths.append(payload["path"])
                
            # Payload Size
            payloads.append(len(str(payload)))

    # 2. Calculate Stats
    
    # Check if we are in simulation mode and have injected values
    is_sim = session.get("is_simulation", False)
    
    request_rate = session.get("request_rate_per_min", 0.0) if is_sim else 0.0
    # If not simulation or not provided, we would calculate it here (skipped for now)
    
    unique_paths = len(set(paths))
    
    if is_sim and "path_entropy" in session:
        path_entropy = session["path_entropy"]
    else:
        path_entropy = calculate_entropy(paths)

    if is_sim and "payload_size_mean" in session:
        payload_mean = session["payload_size_mean"]
    else:
        payload_mean = statistics.mean(payloads) if payloads else 0.0
        
    if is_sim and "scanner_signature_score" in session:
        scanner_score = session["scanner_signature_score"]
    # else scanner_score is already calculated above
    
    return {
        "request_rate_per_min": request_rate,
        "unique_path_count": unique_paths,
        "path_entropy": path_entropy,
        "error_rate_4xx": session.get("error_rate_4xx", 0.0) if is_sim else 0.0,
        "error_rate_5xx": 0.0,
        "payload_size_mean": payload_mean,
        "scanner_signature_score": scanner_score
    }
