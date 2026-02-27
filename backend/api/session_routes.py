from flask import Blueprint, jsonify
from backend.db.models import Session
from backend.utils.response_builder import success_response, error_response

session_bp = Blueprint("session", __name__)

@session_bp.route("/", methods=["GET"])
def list_sessions():
    from flask import request
    try:
        # Filters
        source = request.args.get("source")
        decision = request.args.get("decision")
        search = request.args.get("search")
        
        query = Session.query

        if source:
            query = query.filter_by(source=source)
        
        if decision:
            query = query.filter_by(final_decision=decision)

        if search:
            # Simple search by user_id or session_id
            query = query.filter(
                (Session.user_id.ilike(f"%{search}%")) | 
                (Session.session_id.ilike(f"%{search}%"))
            )

        # Default sort by latest
        sessions = query.order_by(Session.created_at.desc()).limit(100).all()
        
        # --- MERGE IN-MEMORY SESSIONS ---
        from backend.services.observation_service import SessionStateEngine
        
        # 1. Convert DB sessions to dicts
        results = []
        for s in sessions:
            d = s.to_dict()
            if d.get("risk_score") == 0 and d.get("trust_score") is not None:
                d["risk_score"] = 100.0 - d["trust_score"]
            results.append(d)
        existing_ids = set(s.session_id for s in sessions)

        # 2. Fetch In-Memory Sessions
        mem_sessions = []
        for sid, data in SessionStateEngine._sessions.items():
            # Skip if already in DB results (simple de-dupe)
            if sid in existing_ids:
                continue
                
            # Apply Filters to In-Memory Sessions
            # Source Filter
            # (In-memory usually doesn't store source explicitly top-level, might need to infer or skip filter)
            
            # Search Filter
            if search:
                s_lower = search.lower()
                if s_lower not in sid.lower() and s_lower not in str(data.get("user_id", "")).lower():
                    continue

            # Calculate current risk from history or fallback
            risk_hist = list(data.get("risk_history", []))
            if risk_hist:
                current_risk = risk_hist[-1][1]
            elif data.get("trust_score") is not None: # Corrected 's' to 'data' for in-memory session context
                current_risk = 100.0 - data.get("trust_score")
            else:
                current_risk = data.get("current_risk_score", 0)
            
            # Determine dominant domain or use generic
            # data.get("domain") isn't explicitly stored, infer from first event?
            domain = "WEB"
            events_seq = data.get("events", [])
            if events_seq:
                first_evt = events_seq[0]
                etype = getattr(first_evt, 'event_type', 'http')
                if etype == 'api': domain = 'API'
                elif etype == 'network': domain = 'NETWORK'
                elif etype == 'infra': domain = 'SYSTEM'
            
            mem_sessions.append({
                "session_id": sid,
                "user_id": data.get("user_id", "simulated-user"),
                "ip_address": data.get("ip_address", "127.0.0.1"), 
                "source": "LIVE", 
                "risk_score": current_risk,
                "created_at": data.get("created_at"), 
                "event_count": len(events_seq),
                "anomaly_count": len(events_seq), 
                "signal_count": 0,
                "status": "ACTIVE", 
                "final_decision": "ALLOW",
                "domain": domain
            })
            
        # 3. Combine and Sort
        # DB sessions start_time is usually ISO string or datetime object. 
        # In-memory is float epoch.
        # Ensure consistency for sorting? Frontend usually parses.
        # Let's create a combined list and sort in Python.
        
        combined = results + mem_sessions
        
        # 3. Combine and Sort
        combined = results + mem_sessions

        def sort_key(x):
            ls = x.get("created_at")
            if not ls: return 0.0
            if isinstance(ls, (int, float)): return float(ls)
            try:
                # Parse ISO string "2026-..."
                from datetime import datetime
                dt = datetime.fromisoformat(str(ls).replace('Z', '+00:00'))
                return dt.timestamp()
            except:
                 return 0.0

        combined.sort(key=sort_key, reverse=True)
        
        return success_response(combined[:100]) # Return top 100 merged
    except Exception as e:
        return error_response(str(e), 500)

@session_bp.route("/<session_id>", methods=["GET"])
@session_bp.route("/<session_id>", methods=["GET"])
def get_session_details(session_id):
    try:
        # 1. Try DB first (Persisted Sessions)
        session = Session.query.filter_by(session_id=session_id).first()
        
        if session:
            data = session.to_dict()
            
            # Fetch events if they are related to a Batch Job 
            from backend.db.models import BatchRawEvent
            batch_events = BatchRawEvent.query.filter_by(session_id=session_id).all()
            
            events = []
            for e in batch_events:
                events.append({
                    "event_id": e.id,
                    "type": e.event_type,
                    "timestamp": e.timestamp.isoformat() if e.timestamp else None,
                    "domain": "BATCH",
                    "risk": data.get("risk_score", 0) 
                })
            
            data["events"] = events
            data["signals"] = []
            data["event_count"] = len(events)
            data["signal_count"] = 0
            
            # Make sure we explicitly have risk_score vs trust_score
            if "risk_score" not in data and "trust_score" in data:
                data["risk_score"] = 100.0 - data["trust_score"]
                
            return success_response(data)

        # 2. Try In-Memory State (Live/Simulated Sessions)
        from backend.services.observation_service import SessionStateEngine
        mem_session = SessionStateEngine._sessions.get(session_id)
        
        if mem_session:
            # Construct response from memory
            # mem_session is a dict with deques
            events_list = list(mem_session.get("events", []))
            
            # Convert Event objects to dicts
            events_data = []
            for evt in events_list:
                # evt is an Event object
                d = {
                    "event_id": evt.event_id,
                    "type": evt.event_type,
                    "timestamp": evt.timestamp_epoch, # Frontend handles epoch or iso? Verify.
                    "domain": getattr(evt, 'source', 'unknown'), # Schema uses source/event_type, map to domain?
                    "risk": getattr(evt, 'risk_score', 0)
                }
                events_data.append(d)
                
            return success_response({
                "session_id": session_id,
                "user_id": "simulated-user", # active session might not have user_id stored nicely in root
                "risk_score": mem_session.get("current_risk_score", 0),
                "created_at": mem_session.get("created_at"),
                "event_count": len(events_data),
                "signal_count": 0,
                "events": events_data,
                "signals": [],
                "is_live": True
            })

        return error_response("Session not found", 404)
        
    except Exception as e:
        print(f"[SESSION ERROR] {e}")
        return error_response(str(e), 500)

@session_bp.route("/login-demo", methods=["POST"])
def login_demo():
    # Deprecated in favor of /api/auth/login
    # Redirecting or stubbing for legacy frontend compat if needed
    return error_response("Use /api/auth/login", 410)
