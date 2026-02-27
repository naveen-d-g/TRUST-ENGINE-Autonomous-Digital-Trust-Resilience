from flask import Blueprint, request, g
from backend.utils.response_builder import success_response, error_response
from backend.utils.time_utils import iso_now
from backend.config import Config
from backend.models.user import User
from backend.db.models import Session
from backend.extensions import db
from backend.audit.audit_logger import AuditLogger
import uuid
try:
    from backend.security.password import hash_password
except ImportError:
    def hash_password(pwd): return pwd

auth_bp = Blueprint("auth", __name__)

@auth_bp.route("/login", methods=["POST"])
def login():
    """
    Simulates Login.
    In production, verifies credential hash against User table.
    """
    data = request.json or {}
    username = str(data.get("username") or "").strip().lower()
    password = str(data.get("password") or "").strip()
    
    print(f"DEBUG LOGIN: Received username='{username}', password='{password}'")
    
    # Real DB Check
    user = User.query.filter((User.email == username) | (User.username == username)).first()
    
    if not user or not user.check_password(password):
        return error_response("Invalid credentials", 401)
        
    role = user.role.upper()
    platform = user.platform if hasattr(user, 'platform') else "SECURITY_PLATFORM"
        
    # Generate Session
    session_id = str(uuid.uuid4())
    
    # Audit Login
    # Note: We don't have g.user_id yet if this is the first call, so we use provided username
    AuditLogger.log(
        actor=username,
        action="USER_LOGIN",
        details={"status": "success", "role": role},
        role=role,
        platform=platform,
        req_id=getattr(g, 'req_id', None)
    )
    
    return success_response({
        "api_key": Config.API_KEY, # In prod, this would be a user-specific token
        "session_id": session_id,
        "user_id": username,
        "role": role,
        "platform": platform,
        "expires_at": iso_now()
    })

@auth_bp.route("/validate", methods=["POST"])
def validate():
    # Only useful if token auth is implemented.
    # For now, just echo back context.
    return success_response({
        "valid": True,
        "user_id": getattr(g, "user_id", "unknown"),
        "role": getattr(g, "role", "unknown"),
        "platform": getattr(g, "platform", "unknown")
    })

# --- User Management CRUD ---

@auth_bp.route("/users", methods=["GET"])
def list_users():
    users = User.query.all()
    # Mocking last_login for the UI by checking the latest session
    result = []
    for u in users:
        u_dict = u.to_dict()
        latest_session = Session.query.filter_by(user_id=u.user_id).order_by(Session.created_at.desc()).first()
        if latest_session and latest_session.created_at:
            u_dict['last_login'] = latest_session.created_at.isoformat()
        else:
            u_dict['last_login'] = None
        result.append(u_dict)
    return success_response(result)

@auth_bp.route("/users", methods=["POST"])
def create_user():
    data = request.json or {}
    email = data.get("email")
    role = data.get("role", "ANALYST")
    user_id = data.get("user_id") or email.split('@')[0] if email else str(uuid.uuid4())
    password = data.get("password", "")
    
    if User.query.filter_by(email=email).first():
        return error_response("User with that email already exists", 400)
    if User.query.filter_by(user_id=user_id).first():
        return error_response("User ID already exists", 400)
        
    new_user = User(
        user_id=user_id,
        email=email,
        username=user_id,
        role=role,
        platform="SECURITY_PLATFORM",
        password_hash=hash_password(password) if password else None
    )
    db.session.add(new_user)
    db.session.commit()
    
    AuditLogger.log(
        actor_id=getattr(g, 'user_id', 'system'),
        action="USER_CREATED",
        details={"target_user_id": user_id, "role": role},
        role=getattr(g, 'role', 'system'),
        platform="SECURITY_PLATFORM",
        req_id=getattr(g, 'req_id', 'unknown')
    )
    return success_response(new_user.to_dict())

@auth_bp.route("/users/<user_id>", methods=["PUT"])
def update_user(user_id):
    user = User.query.filter_by(user_id=user_id).first()
    if not user:
        return error_response("User not found", 404)
        
    data = request.json or {}
    if "email" in data:
        user.email = data["email"]
    if "role" in data:
        user.role = data["role"]
    if data.get("password"):
        user.password_hash = hash_password(data["password"])
        
    db.session.commit()
    return success_response(user.to_dict())

@auth_bp.route("/users/<user_id>", methods=["DELETE"])
def delete_user(user_id):
    user = User.query.filter_by(user_id=user_id).first()
    if not user:
        return error_response("User not found", 404)
        
    db.session.delete(user)
    db.session.commit()
    return success_response({"message": "User deleted"})

@auth_bp.route("/users/<user_id>/profile", methods=["GET"])
def get_user_profile(user_id):
    """
    Fetches the Global Risk Profile and Blast Radius for a user.
    """
    user = User.query.filter_by(user_id=user_id).first()
    if not user:
        return error_response("User not found", 404)

    sessions = Session.query.filter_by(user_id=user_id).order_by(Session.created_at.desc()).all()
    
    if not sessions:
        return success_response({
            "user_id": user_id,
            "global_risk_score": 0.0,
            "total_sessions": 0,
            "terminated_sessions": 0,
            "blast_radius": []
        })
        
    total_sessions = len(sessions)
    terminated_count = sum(1 for s in sessions if s.final_decision == "TERMINATED")
    
    # Calculate global risk: average of the highest 3 risk scores to penalize severe anomalies
    risk_scores = sorted([s.risk_score for s in sessions if s.risk_score is not None], reverse=True)
    top_risks = risk_scores[:3] if risk_scores else [0.0]
    global_risk = sum(top_risks) / len(top_risks) if top_risks else 0.0
    
    # Optional enhancement: if multiple sessions are terminated, blast risk to 99
    if terminated_count > 0:
        global_risk = max(global_risk, 85.0 + (terminated_count * 2))
        
    # Compile blast radius (unique IPs mapping to counts or recent timestamps)
    ips = {}
    for s in sessions:
        if s.ip_address:
            if s.ip_address not in ips:
                ips[s.ip_address] = {"count": 1, "last_seen": s.created_at.isoformat() if s.created_at else None}
            else:
                ips[s.ip_address]["count"] += 1
                
    blast_radius = [{"ip": ip, **data} for ip, data in ips.items()]

    return success_response({
        "user_id": user_id,
        "email": user.email,
        "global_risk_score": min(global_risk, 100.0),
        "total_sessions": total_sessions,
        "terminated_sessions": terminated_count,
        "blast_radius": blast_radius
    })

