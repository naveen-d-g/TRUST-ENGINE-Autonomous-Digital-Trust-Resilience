from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from backend.auth.rbac import require_role
from backend.models.user import User
from backend.extensions import db
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
        new_user = User(user_id=user_id, email=email, role=role)
        new_user.set_password(password)
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
        users = User.query.all()
        return jsonify([user.to_dict() for user in users]), 200
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
        
        # Prevent deleting yourself
        current_user_id = get_jwt_identity()
        if user_id == current_user_id:
            return jsonify(error="Forbidden", message="Cannot delete your own account"), 403
        
        db.session.delete(user)
        db.session.commit()
        
        return jsonify(message="User deleted successfully"), 200
    except Exception as e:
        db.session.rollback()
        logging.error(f"User Deletion Failure: {e}")
        return jsonify(error="Internal Server Error", message=str(e)), 500

@user_bp.route("/update/<user_id>", methods=["PUT"])
@require_role('ADMIN')
def update_user(user_id):
    try:
        user = db.session.get(User, user_id)
        if not user:
            return jsonify(error="Not Found", message="User not found"), 404
        
        data = request.get_json()
        
        # Update fields if provided
        if "email" in data:
            # Check if email is already taken by another user
            existing = User.query.filter_by(email=data["email"]).first()
            if existing and existing.user_id != user_id:
                return jsonify(error="Conflict", message="Email already in use"), 409
            user.email = data["email"]
        
        if "role" in data:
            if data["role"] not in ['admin', 'analyst', 'viewer']:
                return jsonify(error="Validation Error", message="Invalid role"), 400
            user.role = data["role"]
        
        if "password" in data:
            user.set_password(data["password"])
        
        db.session.commit()
        
        return jsonify(message="User updated successfully", user=user.to_dict()), 200
    except Exception as e:
        db.session.rollback()
        logging.error(f"User Update Failure: {e}")
        return jsonify(error="Internal Server Error", message=str(e)), 500
