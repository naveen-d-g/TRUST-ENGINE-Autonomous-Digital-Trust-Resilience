from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from backend.services.demo_service import DemoService
from backend.database.models import User
from backend.utils.logger import log_error
from backend.utils.rbac import viewer_required

demo_bp = Blueprint('demo', __name__)

def get_current_user_role():
    try:
        from flask_jwt_extended import verify_jwt_in_request
        verify_jwt_in_request(optional=True)
        user_id = get_jwt_identity()
        if user_id:
            user = User.query.get(user_id)
            if user:
                return user_id, user.role
    except Exception:
        pass
    return None, None

@demo_bp.route("/start", methods=["POST"])
def start_demo():
    try:
        user_id, role = get_current_user_role()
        
        # If no user logged in (anonymous demo), user_id will be None.
        # DemoService.start_demo will handle this by assigning a default demo user.
        
        result = DemoService.start_demo(user_id)
        return jsonify(result), 201
    except Exception as e:
        log_error("Failed to start demo", error=str(e))
        return jsonify(error="Demo Error", message=str(e)), 500

@demo_bp.route("/event", methods=["POST"])
def record_event():
    try:
        data = request.get_json()
        demo_id = data.get("demo_session_id")
        event_type = data.get("event_type")
        metadata = data.get("features", {})
        
        if not demo_id or not event_type:
             return jsonify(error="Validation Error", message="demo_session_id and event_type required"), 400
             
        result = DemoService.record_event(demo_id, event_type, metadata)
        return jsonify(result), 200
        
    except ValueError as ve:
         return jsonify(error="Validation Error", message=str(ve)), 400
    except Exception as e:
        log_error("Demo Event Error", error=str(e))
        return jsonify(error="Internal Server Error", message=str(e)), 500

@demo_bp.route("/end", methods=["POST"])
def end_demo():
    try:
        data = request.get_json()
        demo_id = data.get("demo_session_id")
        
        if not demo_id:
             return jsonify(error="Validation Error", message="demo_session_id required"), 400
             
        result = DemoService.end_demo(demo_id)
        return jsonify(result), 200
    except Exception as e:
        return jsonify(error="Error", message=str(e)), 500

@demo_bp.route("/sessions", methods=["GET"])
def get_demo_sessions():
    """
    List all demo sessions.
    """
    try:
        user_id, role = get_current_user_role()
        # Allow all users to view sessions for now
        # if role not in ['admin', 'analyst']:
        #     return jsonify(error="Forbidden", message="Access denied"), 403
            
        limit = request.args.get('limit', 50, type=int)
        offset = request.args.get('offset', 0, type=int)
        
        sessions = DemoService.get_all_demo_sessions(limit, offset)
        return jsonify(sessions), 200
    except Exception as e:
        return jsonify(error="Error", message=str(e)), 500

@demo_bp.route("/<demo_id>", methods=["GET"])
def get_demo_details(demo_id):
    """
    Full details.
    """
    try:
        user_id, role = get_current_user_role()
        # Allow all users to view sessions/details for now
        # if role not in ['admin', 'analyst']:
        #     return jsonify(error="Forbidden", message="Access denied"), 403
            
        result = DemoService.get_demo_details(demo_id)
        if not result:
            return jsonify(error="Not Found", message="Demo session not found"), 404
            
        return jsonify(result), 200
    except Exception as e:
        return jsonify(error="Error", message=str(e)), 500
