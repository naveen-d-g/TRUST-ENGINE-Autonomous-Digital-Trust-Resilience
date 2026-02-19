from flask import Blueprint, request, jsonify, g
from backend.auth.decorators import require_access
from backend.models.user import User
from backend.extensions import db
from datetime import datetime

auth_bp = Blueprint('auth', __name__)

@auth_bp.route("/login", methods=["POST"])
def login():
    data = request.get_json()
    email = data.get("email")
    password = data.get("password")

    if not email or not password:
        return jsonify(error="Validation Error", message="Email and password are required"), 400

    user = User.query.filter_by(email=email).first()

    if user and user.check_password(password):
        # Update last login
        user.last_login = datetime.utcnow()
        db.session.commit()

        access_token = create_access_token(identity=user.user_id)
        return jsonify(
            access_token=access_token,
            user=user.to_dict()
        ), 200

    return jsonify(error="Authentication Error", message="Invalid email or password"), 401

@auth_bp.route("/me", methods=["GET"])
@require_access()
def me():
    ctx = g.auth
    user = db.session.get(User, ctx.user_id)
    if not user:
        return jsonify(error="Not Found", message="User not found"), 404
    
    return jsonify(user=user.to_dict()), 200

@auth_bp.route("/logout", methods=["POST"])
@require_access()
def logout():
    # In this context, logout is client-side.
    return jsonify(message="Successfully logged out"), 200
