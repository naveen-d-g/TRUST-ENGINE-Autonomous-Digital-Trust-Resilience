
import time
from collections import deque
import statistics
import queue
import math

def calculate_entropy(data_list):
    if not data_list:
        return 0.0
    counter = {}
    for item in data_list:
        counter[item] = counter.get(item, 0) + 1
    total = len(data_list)
    entropy = 0.0
    for count in counter.values():
        p = count / total
        entropy -= p * math.log2(p)
    return entropy

# Configuration for Session State
SESSION_TTL_SECONDS = 30 * 60  # 30 minutes
MAX_WINDOW_SIZE = 100          # Keep last 100 events for sliding window
MIN_EVENTS_FOR_VARIANCE = 5

class SessionStateEngine:
    """
    In-memory session state engine.
    Stores rolling windows of events and aggregates metrics.
    Designed to be replaced by Redis in future.
    """
    
    # Store sessions in memory: { session_id: { ... state ... } }
    _sessions = {}
    
    # Pub/Sub for Live Streaming
    _listeners = []
    
    # Global Event History (for persistence on refresh)
    _global_history = deque(maxlen=500)

    @classmethod
    def listen(cls):
        """
        Returns a queue.Queue that will receive new events.
        """
        q = queue.Queue(maxsize=100)
        cls._listeners.append(q)
        return q

    @classmethod
    def get_global_history(cls):
        """Returns the last N global events."""
        return list(cls._global_history)

    @classmethod
    def _notify_listeners(cls, event):
        """
        Push event to all active listeners.
        """
        dead_listeners = []
        for q in cls._listeners:
            try:
                q.put_nowait(event)
            except queue.Full:
                dead_listeners.append(q)
        
        # Remove full/dead listeners (assumes client disconnected or slow)
        for q in dead_listeners:
            if q in cls._listeners:
                cls._listeners.remove(q)

    @classmethod
    def update_session_state(cls, session_id, event):
        """
        Updates the state for a given session with a new event.
        Also performs lazy eviction of expired sessions if needed (or we can rely on a cleanup job).
        """
        current_time = time.time()
        
        # Add to global history
        cls._global_history.append(event)

        
        # 1. functionality: Create if not exists
        if session_id not in cls._sessions:
            cls._sessions[session_id] = {
                "created_at": current_time,
                "last_active": current_time,
                "events": deque(maxlen=MAX_WINDOW_SIZE),
                "total_requests": 0,
                
                # --- NEW: RAW METRIC STORAGE FOR ML ---
                
                # WEB / API
                "request_timestamps": deque(maxlen=MAX_WINDOW_SIZE),
                "paths": deque(maxlen=MAX_WINDOW_SIZE),
                "response_times": deque(maxlen=MAX_WINDOW_SIZE),
                "status_codes": deque(maxlen=MAX_WINDOW_SIZE),
                "payload_sizes": deque(maxlen=MAX_WINDOW_SIZE),
                
                # AUTH
                "auth_timestamps": deque(maxlen=MAX_WINDOW_SIZE), # For time_between_attempts
                "failed_login_counter": 0,
                "captcha_failures": 0,
                
                # NETWORK
                "unique_ports": set(),
                "lateral_movement_score": 0.0,
                "port_scan_count": 0,
                
                # SYSTEM
                "process_spawns": deque(maxlen=MAX_WINDOW_SIZE),
                "cpu_spikes": 0,
                "mem_spikes": 0,
                "syscall_anomalies": 0,
                
                # API SPECIFIC
                "api_usage_counter": 0,
                "rate_limit_hits": 0,
                "token_reuse_detected": False,
                
                # HISTORY
                "risk_history": deque(maxlen=MAX_WINDOW_SIZE), # (timestamp, score)
                "infra_stress_window": deque(maxlen=MAX_WINDOW_SIZE),
            }
        
        session = cls._sessions[session_id]
        session["last_active"] = current_time
        # Store as dict for serialization if needed, or keep object if we trust it
        # For Redis compatibility, we'd eventually serialize this whole state.
        # For now, we store the Event object but in get_session_features we rely on simple types.
        session["events"].append(event) 
        session["total_requests"] += 1
        
        # Notify Listeners (Live Stream)
        cls._notify_listeners(event)
        
        # 1.5 Emit Socket.IO Events for Frontend Stores
        from backend.extensions import socketio
        try:
             # Map event type to socket event name
             evt_name = f"{event.event_type}_event" # web_event, api_event...
             
             # Map 'http' -> 'web' for consistency with frontend
             if event.event_type == 'http': evt_name = 'web_event'
             
             # Flatten payload for frontend convenience
             socket_payload = {
                 "event": event.to_dict(),
                 "risk": getattr(event, 'risk_score', 0),
                 "decision": "ALLOW", # Default, populated by inference later if available
                 "suggestion": "None"
             }
             
             socketio.emit(evt_name, socket_payload)
        except Exception as e:
            print(f"[Socket Error] Failed to emit {evt_name}: {e}")
        
        # 2. Extract specific features from event
        event_type = event.event_type
        # details = event.get("details", {}) # OLD
        details = event.raw_features       # NEW
        
        # Track Timestamps
        timestamp = event.timestamp_epoch
        session["request_timestamps"].append(timestamp)
        
        # --- FEATURE EXTRACTION BY DOMAIN ---
        
        if event_type == "http":
            session["paths"].append(details.get("path", "/"))
            session["response_times"].append(details.get("response_time_ms", 0))
            session["payload_sizes"].append(details.get("request_size_bytes", 0))
            session["status_codes"].append(details.get("status_code", 200))
            
        elif event_type == "auth":
            session["auth_timestamps"].append(timestamp)
            status = details.get("status")
            if status == "failed":
                session["failed_login_counter"] += 1
            elif status == "success":
                session["failed_login_counter"] = 0 # Reset on success
            
            if details.get("captcha_failed", False):
                session["captcha_failures"] += 1

        elif event_type == "api":
            session["api_usage_counter"] += 1
            if details.get("token_reused", False):
                session["token_reuse_detected"] = True
            if details.get("rate_limited", False):
                session["rate_limit_hits"] += 1

        elif event_type == "network":
             if details.get("lateral_movement", False):
                 session["lateral_movement_score"] = float(details.get("severity", 1.0))
             if details.get("port_scan", False):
                 session["port_scan_count"] += 1
             if "dest_port" in details:
                 session["unique_ports"].add(details["dest_port"])

        elif event_type == "infra": # System/Infra
            session["infra_stress_window"].append(details.get("cpu_load", 0))
            if details.get("cpu_spike", False): session["cpu_spikes"] += 1
            if details.get("mem_spike", False): session["mem_spikes"] += 1
            if details.get("syscall_anomaly", False): session["syscall_anomalies"] += 1
            if "process_name" in details:
                session["process_spawns"].append(details["process_name"])

        # 3. Automatic Eviction Check (Simple Lazy)
        if len(cls._sessions) > 10000:
             cls.prune_expired_sessions()
             
        return cls._sessions[session_id]

    @classmethod
    def get_session_features(cls, session_id):
        """
        Returns derived features for the ML engine.
        Calculates simple statistics from rolling windows.
        """
        session = cls._sessions.get(session_id)
        if not session:
            return {}
            
        now = time.time()
        
        # --- WEB FEATURES ---
        timestamps = list(session["request_timestamps"])
        request_rate = 0.0
        if len(timestamps) > 1:
            duration = timestamps[-1] - timestamps[0]
            if duration > 0.001:
                request_rate = (len(timestamps) / duration) * 60
        
        paths = list(session["paths"])
        unique_paths = len(set(paths))
        path_entropy = calculate_entropy(paths)
        
        status_codes = list(session["status_codes"])
        total_reqs = len(status_codes)
        error_4xx = 0
        error_5xx = 0
        if total_reqs > 0:
            error_4xx = sum(1 for c in status_codes if 400 <= c < 500) / total_reqs
            error_5xx = sum(1 for c in status_codes if c >= 500) / total_reqs
            
        payloads = list(session["payload_sizes"])
        payload_mean = statistics.mean(payloads) if payloads else 0.0
        
        # --- API FEATURES ---
        # Burst score: simple heuristic based on rate limit hits or immediate velocity
        api_burst = 1.0 if session["rate_limit_hits"] > 0 else 0.0
        token_reuse = 1 if session["token_reuse_detected"] else 0
        
        # --- AUTH FEATURES ---
        auth_timestamps = list(session["auth_timestamps"])
        time_btwn = 0.0
        if len(auth_timestamps) > 1:
            diffs = [t2 - t1 for t1, t2 in zip(auth_timestamps, auth_timestamps[1:])]
            time_btwn = statistics.mean(diffs)
            
        # Auth Velocity (attempts per minute)
        auth_velocity = 0.0
        if len(auth_timestamps) > 1:
             dur = auth_timestamps[-1] - auth_timestamps[0]
             if dur > 0.001:
                 auth_velocity = (len(auth_timestamps) / dur) * 60
        
        # --- NETWORK FEATURES ---
        unique_port_count = len(session["unique_ports"])
        
        # --- SYSTEM FEATURES ---
        avg_infra_stress = 0.0
        if session["infra_stress_window"]:
            avg_infra_stress = statistics.mean(session["infra_stress_window"])
            
        process_spawn_rate = 0.0 # events per min?
        # Approximation: count in window
        if len(timestamps) > 1: # Use same window duration
             duration_sys = timestamps[-1] - timestamps[0]
             if duration_sys > 1:
                 process_spawn_rate = (len(session["process_spawns"]) / duration_sys) * 60

        # --- META FEATURES ---
        risk_hist = list(session["risk_history"]) # [(ts, score), ...]
        hist_mean = 0.0
        velocity = 0.0
        current_risk_score = 0
        if risk_hist:
            scores = [r[1] for r in risk_hist]
            hist_mean = statistics.mean(scores)
            current_risk_score = scores[-1]
            
            # Velocity helper
            last_risk_timestamp = risk_hist[-1][0]
            
            if len(risk_hist) > 1:
                delta_score = risk_hist[-1][1] - risk_hist[0][1]
                delta_time = risk_hist[-1][0] - risk_hist[0][0]
                if delta_time > 0:
                    velocity = delta_score / delta_time # Pre-inference velocity (based on history)
        else:
             last_risk_timestamp = now

        return {
            "session_id": session_id,
            
            # Web
            "request_rate_per_min": request_rate,
            "unique_path_count": unique_paths,
            "path_entropy": path_entropy,
            "error_rate_4xx": error_4xx,
            "error_rate_5xx": error_5xx,
            "payload_size_mean": payload_mean,
            "scanner_signature_score": 0.0, # Placeholder
            
            # API
            "api_burst_score": api_burst,
            "token_reuse_count": token_reuse,
            "auth_failure_ratio": 0.0, # Handled by specialized auth model usually, or calc here? 
                                       # Let's add simple calc: failed_logins / total_reqs (if known auth endpoint?) 
                                       # Actually better: failed_login_counter
            "endpoint_variance": 0.0, # Placeholder
            "rate_limit_hits": session["rate_limit_hits"],
            
            # Auth
            "failed_login_attempts": session["failed_login_counter"],
            "time_between_attempts": time_btwn,
            "captcha_failures": session["captcha_failures"],
            "credential_entropy": 0.0, # Metadata not available
            "login_velocity": auth_velocity,
            
            # Network
            "port_scan_count": session["port_scan_count"],
            "unique_ports": unique_port_count,
            "lateral_movement_score": session["lateral_movement_score"],
            "fan_out_ratio": 0.0, # Placeholder
            "scan_signature_score": 0.0, # Placeholder
            
            # System
            "cpu_spike_score": session["cpu_spikes"],
            "memory_spike_score": session["mem_spikes"],
            "process_spawn_rate": process_spawn_rate,
            "privileged_process_count": 0, # Placeholder
            "syscall_anomaly_score": session["syscall_anomalies"],
            "infra_stress_score": avg_infra_stress,
            
            # Meta
            "session_age": now - session["created_at"],
            "risk_velocity": velocity,
            "historical_risk_mean": hist_mean,
            "current_risk_score": current_risk_score,
            "last_risk_timestamp": last_risk_timestamp
        }

    @classmethod
    def update_risk_history(cls, session_id, risk_score):
        """
        Updates the risk history for a session.
        Called by the inference pipeline after risk calculation.
        """
        if session_id in cls._sessions:
            cls._sessions[session_id]["risk_history"].append((time.time(), risk_score))

    @classmethod
    def get_risk_history(cls, session_id):
        """
        Returns list of (timestamp, score) tuples.
        """
        if session_id in cls._sessions:
            return list(cls._sessions[session_id]["risk_history"])
        return []

    @classmethod
    def prune_expired_sessions(cls):
        """
        Removes sessions inactive for > SESSION_TTL_SECONDS
        """
        now = time.time()
        to_remove = []
        for sid, data in cls._sessions.items():
            if now - data["last_active"] > SESSION_TTL_SECONDS:
                to_remove.append(sid)
        
        for sid in to_remove:
            del cls._sessions[sid]
