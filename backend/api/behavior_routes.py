from flask import Blueprint, request, jsonify
from backend.ml.bot_detection.bot_detector import detect_bot
from backend.middleware.security_logger import log_security_event

behavior_bp = Blueprint("behavior", __name__)

import requests
from backend.db.models import Session
from backend.extensions import db

@behavior_bp.before_request
def block_platform_telemetry():
    if request.headers.get('X-Platform') == 'SECURITY_PLATFORM':
        return jsonify({"status": "ignored", "reason": "internal_platform_noise"}), 200

@behavior_bp.route("/mouse", methods=["POST"])
def mouse_behavior():
    """
    Receives mouse behavior telemetry, computes bot probability, and enforces security.
    """
    data = request.json
    if not data or "events" not in data:
        return jsonify({"error": "Missing mouse events payload"}), 400

    session_id = data.get("session_id")
    events = data.get("events", [])
    bot_prob, features = detect_bot(events)

    # 1. Update Session in Database
    if session_id:
        sess = Session.query.get(session_id)
        if sess:
            # Bot probability reduces trust score inversely
            # (e.g., 0.8 bot prob -> 20 trust score)
            new_trust = max(0, 100 - (bot_prob * 100))
            sess.trust_score = min(sess.trust_score, new_trust)
            sess.bot_detected = bot_prob > 0.5
            sess.bot_reason = f"Behavioral Anomaly Score: {bot_prob:.2f}"
            
            if bot_prob > 0.8:
                sess.final_decision = "TERMINATE"
                sess.primary_cause = "Automated Bot Behavior Detected"
            elif bot_prob > 0.5:
                # If trust was already lower, don't overwrite with a higher value unless logic warrants
                sess.final_decision = "RESTRICT" if sess.final_decision == "ALLOW" else sess.final_decision
            
            db.session.commit()

    # 2. Autonomous Enforcement (Out-of-band termination)
    # Only target known sessions; anonymous detections are logged but not sent to the termination hook
    if bot_prob > 0.8 and session_id and session_id != "anonymous":
        log_security_event(
            f"[BOT_ENFORCEMENT] Triggering termination for session {session_id} (Prob: {bot_prob})",
            severity="CRITICAL",
            metadata=features,
            session_id=session_id
        )
        try:
            # Hit Target App's enforcement hook
            requests.post(
                "http://localhost:3001/api/terminate",
                json={"session_id": session_id},
                timeout=1.0
            )
        except Exception as e:
            print(f"Failed to trigger Target App termination: {e}")

    return jsonify({
        "status": "success",
        "bot_probability": bot_prob,
        "enforced": bot_prob > 0.8,
        "features": features
    })

@behavior_bp.route("/stats", methods=["GET"])
def get_behavior_stats():
    """
    Returns aggregated behavior metrics for the dashboard.
    """
    # Placeholder for aggregated stats
    # In a real system, these would be queried from the database
    return jsonify({
        "avg_bot_probability": 0.12,
        "active_monitors": 1,
        "threat_level": "LOW",
        "recent_detections": 0
    })
