from flask import jsonify
from backend.contracts.event_schema import IngestResponse
from pydantic import ValidationError

def register_error_handlers(app):
    """
    Registers global error handlers to ensure consistent JSON responses.
    """
    
    @app.errorhandler(400)
    def handle_bad_request(e):
        return jsonify({
            "status": "error",
            "message": str(e.description) if hasattr(e, 'description') else "Bad Request"
        }), 400

    @app.errorhandler(401)
    def handle_unauthorized(e):
        return jsonify({
            "status": "error",
            "message": "Unauthorized: Invalid or missing credentials"
        }), 401

    @app.errorhandler(403)
    def handle_forbidden(e):
        return jsonify({
            "status": "error",
            "message": "Forbidden: Insufficient permissions"
        }), 403

    @app.errorhandler(404)
    def handle_not_found(e):
        return jsonify({
            "status": "error",
            "message": "Resource not found"
        }), 404

    @app.errorhandler(ValidationError)
    def handle_pydantic_error(e):
        """
        Catches Pydantic validation errors and returns 400.
        """
        return jsonify({
            "status": "error",
            "message": "Schema Validation Error",
            "details": e.errors()
        }), 400

    @app.errorhandler(500)
    def handle_server_error(e):
        """
        Generic 500 handler.
        In production, suppress stack traces.
        """
        # Log the error here in a real app
        response = {
            "status": "error",
            "message": "Internal Server Error"
        }
        if app.config["DEBUG"]:
             response["debug"] = str(e)
             
        return jsonify(response), 500
