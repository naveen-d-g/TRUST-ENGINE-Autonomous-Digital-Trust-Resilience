from flask import Blueprint, request
from backend.ingestion.event_ingestor import EventIngestor
from backend.utils.response_builder import success_response, error_response
from backend.auth.rbac import require
from backend.auth.auth_context import Platform

user_bp = Blueprint("user", __name__)

@user_bp.route("/event", methods=["POST"])
# @require(platform=Platform.USER.value)
# Strict separation: Users emit events here.
def emit_event():
    try:
        result = EventIngestor.ingest(request.json)
        return success_response(result)
    except ValueError as e:
        return error_response(str(e), 400)
    except Exception as e:
        return error_response(f"System Error: {str(e)}", 500)
