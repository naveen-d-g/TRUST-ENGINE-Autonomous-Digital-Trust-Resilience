from flask import Blueprint, request, jsonify
from backend.auth.rbac import require_role
from backend.models.user import User
from backend.extensions import db
from backend.security.password import hash_password
import logging

user_bp = Blueprint('user', __name__)

@user_bp.route("/create", methods=["POST"])
@require_role('ADMIN')
def create_user():
    try:
        data = request.get_json()
        user_id = data.get("user_id")
        email = data.get("email")
        password = data.get("password")
        role = data.get("role", "analyst")  # Default to analyst
        
        # Validation
        if not user_id or not email or not password:
            return jsonify(error="Validation Error", message="user_id, email, and password are required"), 400
        
        if role not in ['admin', 'analyst', 'viewer']:
            return jsonify(error="Validation Error", message="Invalid role. Must be admin, analyst, or viewer"), 400
        
        # Check if user already exists
        if User.query.filter_by(email=email).first():
            return jsonify(error="Conflict", message="User with this email already exists"), 409
        
        if db.session.get(User, user_id):
            return jsonify(error="Conflict", message="User with this ID already exists"), 409
        
        # Create new user
        new_user = User(
            user_id=user_id,
            email=email,
            role=role,
            platform="SECURITY_PLATFORM",
            password_hash=hash_password(password)
        )
        db.session.add(new_user)
        db.session.commit()
        
        return jsonify(message="User created successfully", user=new_user.to_dict()), 201
    except Exception as e:
        db.session.rollback()
        logging.error(f"User Creation Failure: {e}")
        return jsonify(error="Internal Server Error", message=str(e)), 500

@user_bp.route("/list", methods=["GET"])
@require_role('ADMIN')
def list_users():
    try:
        from backend.db.models import Session
        users = User.query.all()
        result = []
        for user in users:
            u_dict = user.to_dict()
            latest_session = Session.query.filter(
                (Session.user_id == user.user_id) | 
                (Session.user_id == user.username) | 
                (Session.user_id == user.email)
            ).order_by(Session.created_at.desc()).first()
            
            if latest_session and latest_session.created_at:
                u_dict['last_login'] = latest_session.created_at.isoformat() + 'Z'
                
            result.append(u_dict)
        return jsonify(result), 200
    except Exception as e:
        logging.error(f"User List Failure: {e}")
        return jsonify(error="Internal Server Error", message=str(e)), 500

@user_bp.route("/delete/<user_id>", methods=["DELETE"])
@require_role('ADMIN')
def delete_user(user_id):
    try:
        user = db.session.get(User, user_id)
        if not user:
            return jsonify(error="Not Found", message="User not found"), 404
        
        # Prevent deleting yourself using the header provided by the frontend if available
        current_user_id = request.headers.get("X-User-ID")
        if current_user_id and user_id == current_user_id:
            return jsonify(error="Forbidden", message="Cannot delete your own account"), 403
        
        try:
            from flask_jwt_extended import verify_jwt_in_request
            verify_jwt_in_request(optional=True)
        except:
            pass

        db.session.delete(user)
        db.session.commit()
        
        return jsonify(message="User deleted successfully"), 200
    except Exception as e:
        db.session.rollback()
        logging.error("User Deletion Failure:", exc_info=True)
        return jsonify(error="Internal Server Error", message=str(e)), 500

@user_bp.route("/update/<user_identifier>", methods=["PUT"])
@require_role(['ADMIN', 'SYSTEM'])
def update_user(user_identifier):
    try:
        user = db.session.get(User, user_identifier)
        if not user:
            user = User.query.filter((User.username == user_identifier) | (User.email == user_identifier)).first()
            
        if not user:
            return jsonify(error="Not Found", message="User not found"), 404
        
        data = request.get_json()
        
        # Update fields if provided
        if "email" in data:
            # Check if email is already taken by another user
            existing = User.query.filter_by(email=data["email"]).first()
            if existing and existing.user_id != user.user_id:
                return jsonify(error="Conflict", message="Email already in use"), 409
            user.email = data["email"]
        
        if "role" in data:
            if data["role"] not in ['admin', 'analyst', 'viewer']:
                return jsonify(error="Validation Error", message="Invalid role"), 400
            user.role = data["role"]
        
        if "password" in data:
            user.password_hash = hash_password(data["password"])
            user.password_reset_required = False
        
        db.session.commit()
        
        return jsonify(message="User updated successfully", user=user.to_dict()), 200
    except Exception as e:
        db.session.rollback()
        logging.error(f"User Update Failure: {e}")
        return jsonify(error="Internal Server Error", message=str(e)), 500
