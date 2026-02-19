from flask import Blueprint, request, g
from backend.utils.response_builder import success_response, error_response
from backend.utils.time_utils import iso_now
from backend.config import Config
from backend.models.user import User
from backend.audit.audit_logger import AuditLogger
import uuid

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
    
    # Mock Logic (Replace with DB check)
    if username == "admin" and password == "admin":
        role = "admin"
        platform = "security_platform"
    elif username == "analyst" and password == "analyst":
        role = "analyst"
        platform = "security_platform"
    elif username == "viewer" and password == "viewer":
        role = "viewer" 
        platform = "user_platform"
    else:
        return error_response("Invalid credentials", 401)
        
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
