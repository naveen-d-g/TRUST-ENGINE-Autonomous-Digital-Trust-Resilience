
def validate_evaluation_request(data):
    """
    Stricter validation for evaluation request.
    """
    if not isinstance(data, dict):
        return False, "Payload must be a JSON object"
        
    required_root = ["session_id", "user_id", "features"]
    for field in required_root:
        if field not in data:
            return False, f"Missing required field: {field}"
            
    if not isinstance(data["features"], dict):
        return False, "'features' must be a JSON object"
        
    features = data["features"]
    
    # Define validation rules: (type, min, max or None)
    rules = {
        "request_rate_per_min": (float, 0, None),
        "avg_request_interval": (float, 0, None),
        "navigation_entropy": (float, 0, 1.0),
        "failed_login_attempts": (int, 0, None),
        "headless_browser_flag": (bool, None, None),
        "captcha_passed": (bool, None, None),
        "session_duration_sec": (int, 0, None)
    }
    
    # Defaults for missing optional features
    defaults = {
        "request_rate_per_min": 0.0,
        "avg_request_interval": 0.0,
        "navigation_entropy": 0.0,
        "failed_login_attempts": 0,
        "headless_browser_flag": False,
        "captcha_passed": True,
        "session_duration_sec": 0
    }
    
    validated_features = {}
    for key, (vtype, vmin, vmax) in rules.items():
        val = features.get(key, defaults[key])
        
        # Type check
        try:
            if vtype == float:
                val = float(val)
            elif vtype == int:
                val = int(val)
            elif vtype == bool:
                if not isinstance(val, bool):
                    return False, f"'{key}' must be a boolean"
        except (ValueError, TypeError):
            return False, f"'{key}' has invalid type. Expected {vtype.__name__}"
            
        # Range check
        if vmin is not None and val < vmin:
            return False, f"'{key}' must be >= {vmin}"
        if vmax is not None and val > vmax:
            return False, f"'{key}' must be <= {vmax}"
            
        validated_features[key] = val
        
    # Update data with validated features (including defaults)
    data["features"] = validated_features
    return True, None

def validate_batch_request(files):
    """
    Validate CSV presence and file extension.
    """
    if 'file' not in files:
        return False, "No file uploaded"
    
    file = files['file']
    if file.filename == '':
        return False, "No file selected"
        
    if not file.filename.endswith('.csv'):
        return False, "Only CSV files are allowed"
        
    return True, None
