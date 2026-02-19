from flask import Blueprint, request, jsonify, current_app, g
from backend.db.models import BatchJob, BatchRawEvent, Session, SessionMetric, db
from backend.core.batchFeatureExtractor import BatchFeatureExtractor
from backend.core.trustDecisionEngine import TrustDecisionEngine
from backend.core.recommendationEngine import RecommendationEngine
from backend.extensions import socketio
from backend.auth.decorators import require_access
from backend.contracts.enums import Role
import pandas as pd
import threading
import uuid
import json
from datetime import datetime
import hashlib

batch_bp = Blueprint('batch_v4', __name__)

def process_batch_job(app, batch_id, user_id):
    """
    Background worker for processing a batch job.
    """
    with app.app_context():
        job = db.session.get(BatchJob, batch_id)
        if not job:
            return

        try:
            print(f"[BATCH WORKER] Starting processing for job {batch_id}")
            
            # 1. Group events by session_id
            raw_events = BatchRawEvent.query.filter_by(batch_id=batch_id).all()
            print(f"[BATCH WORKER] Found {len(raw_events)} raw events")
            
            session_groups = {}
            for e in raw_events:
                if e.session_id not in session_groups:
                    session_groups[e.session_id] = []
                session_groups[e.session_id].append({
                    "event_type": e.event_type,
                    "timestamp": e.timestamp,
                    "ip": e.ip,
                    "payload": e.payload,
                    "user_id": e.user_id
                })

            total_sessions = len(session_groups)
            print(f"[BATCH WORKER] Grouped into {total_sessions} sessions")
            
            processed_count = 0
            all_results = []

            for sid, events in session_groups.items():
                print(f"[BATCH WORKER] Processing session {sid}")
                # A. Feature Extraction
                try:
                    features = BatchFeatureExtractor.extract_features(events)
                except Exception as fe:
                    print(f"[BATCH ERROR] Feature extraction failed for {sid}: {fe}")
                    continue

                # B. Trust Evaluation
                try:
                    score, decision = TrustDecisionEngine.evaluate(features)
                except Exception as te:
                    print(f"[BATCH ERROR] Trust evaluation failed for {sid}: {te}")
                    continue
                
                # C. Recommendation
                rec = RecommendationEngine.recommend(decision, features)
                
                # D. Persist Session
                # Using the same Session model as real-time, but with source="BATCH"
                existing = db.session.get(Session, sid)
                if not existing:
                    new_session = Session(
                        session_id=sid,
                        user_id=events[0]["user_id"],
                        source="BATCH",
                        trust_score=score,
                        final_decision=decision,
                        primary_cause=events[0]["event_type"],
                        recommended_action=rec,
                        ip_address=events[0]["ip"],
                        created_at=events[0]["timestamp"]
                    )
                    db.session.add(new_session)
                    
                    # Also persist metrics breakdown
                    metric = SessionMetric(
                        session_id=sid,
                        bot_probability=features["bot_probability"],
                        attack_probability=features["attack_signal"],
                        anomaly_score=features["anomaly_score"],
                        risk_score=100 - score,
                        web_abuse_probability=features["web_abuse"],
                        api_abuse_probability=features["api_abuse"],
                        network_anomaly_score=features["network_anomaly"]
                    )
                    db.session.add(metric)
                
                processed_count += 1
                # Progress is based on session processing
                socketio.emit("batch_progress", {
                    "batch_id": str(batch_id),
                    "processed": processed_count,
                    "total": total_sessions,
                    "percentage": round((processed_count / total_sessions) * 100, 1)
                })
                
                all_results.append(f"{sid}:{score}:{decision}")
                
                # Commit every 10 sessions to keep DB responsive if huge batch
                if processed_count % 10 == 0:
                    db.session.commit()

            # Final Commit
            job.status = "COMPLETED"
            job.completed_at = datetime.utcnow()
            job.processed_rows = job.total_rows # Set to total for progress bar completion
            
            # Generate deterministic hash of results
            result_str = ",".join(sorted(all_results))
            job.result_hash = hashlib.sha256(result_str.encode()).hexdigest()
            
            db.session.commit()
            print(f"[BATCH WORKER] Job {batch_id} completed successfully")
            
            socketio.emit("batch_completed", {
                "batch_id": str(batch_id),
                "result_hash": job.result_hash
            })

        except Exception as e:
            print(f"Batch processing error: {e}")
            job.status = "FAILED"
            db.session.commit()
            socketio.emit("batch_failed", {"batch_id": str(batch_id), "error": str(e)})

@batch_bp.route("/upload", methods=["POST"])
@require_access(role=Role.ANALYST)
def upload_batch():
    if 'file' not in request.files:
        return jsonify(error="No file part"), 400
    
    file = request.files['file']
    if file.filename == '':
        return jsonify(error="No selected file"), 400

    try:
        # Load CSV
        df = pd.read_csv(file)
        
        # Validation
        required_cols = ["session_id", "event_type", "timestamp", "payload"]
        print(f"[BATCH DEBUG] Uploaded columns: {df.columns.tolist()}")
        for col in required_cols:
            if col not in df.columns:
                print(f"[BATCH ERROR] Missing column: {col}")
                return jsonify(error=f"Missing required column: {col}. Found: {df.columns.tolist()}"), 400
        
        # Create Job
        job_id = uuid.uuid4()
        user_id = getattr(g.auth, 'user_id', 'ANONYMOUS')
        
        job = BatchJob(
            id=job_id,
            file_name=file.filename,
            uploaded_by=str(user_id),
            total_rows=len(df),
            status="PROCESSING"
        )
        db.session.add(job)
        
        # Clean NaNs
        df = df.where(pd.notnull(df), None)

        # Ingest Raw Events
        for index, row in df.iterrows():
            try:
                payload = row.get("payload", "{}")
                if isinstance(payload, str):
                    try:
                        payload = json.loads(payload)
                    except:
                        payload = {"raw": payload}
                elif payload is None:
                     payload = {}
                
                # Ensure Dictionary
                if not isinstance(payload, dict):
                     payload = {"raw": str(payload)}

                raw_event = BatchRawEvent(
                    batch_id=job_id,
                    session_id=str(row["session_id"]),
                    user_id=str(row.get("user_id", "") or ""),
                    event_type=str(row["event_type"]),
                    ip=str(row.get("ip", "0.0.0.0")),
                    timestamp=pd.to_datetime(row["timestamp"]) if row.get("timestamp") else datetime.utcnow(),
                    payload=payload
                )
                db.session.add(raw_event)
            except Exception as row_e:
                print(f"[BATCH SKIP] Failed to process row {index}: {row_e}")
                continue
        
        
        db.session.commit()
        
        # Trigger Background Processing
        app_obj = current_app._get_current_object()
        thread = threading.Thread(target=process_batch_job, args=(app_obj, job_id, user_id))
        thread.start()
        
        return jsonify({
            "batch_id": str(job_id),
            "status": "PROCESSING",
            "total_rows": len(df)
        }), 202

    except Exception as e:
        return jsonify(error="Processing failed", message=str(e)), 500

@batch_bp.route("/<batch_id>", methods=["GET"])
@require_access(role=Role.ANALYST)
def get_batch_status(batch_id):
    job = db.session.get(BatchJob, batch_id)
    if not job:
        return jsonify(error="Not Found"), 404
    
    return jsonify(job.to_dict()), 200

@batch_bp.route("/<batch_id>/results", methods=["GET"])
@require_access(role=Role.ANALYST)
def get_batch_results(batch_id):
    # Get session IDs from raw events for this batch
    raw_sids = db.session.query(BatchRawEvent.session_id).filter_by(batch_id=batch_id).distinct().all()
    sids = [s[0] for s in raw_sids]
    
    sessions = Session.query.filter(Session.session_id.in_(sids)).all()
    return jsonify([s.to_dict() for s in sessions]), 200
