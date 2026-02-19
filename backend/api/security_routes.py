from flask import Blueprint, request, jsonify
from backend.ingestion.ingestion_pipeline import IngestionPipeline
from backend.utils.response_builder import success_response, error_response

security_bp = Blueprint("security", __name__)

@security_bp.route("/web", methods=["POST"])
def ingest_web():
    try:
        result = IngestionPipeline.process(request.json, domain_override="WEB")
        return success_response(result)
    except ValueError as e: return error_response(str(e), 400)
    except Exception as e: return error_response(str(e), 500)

@security_bp.route("/api", methods=["POST"])
def ingest_api():
    try:
        result = IngestionPipeline.process(request.json, domain_override="API")
        return success_response(result)
    except ValueError as e: return error_response(str(e), 400)
    except Exception as e: return error_response(str(e), 500)

@security_bp.route("/network", methods=["POST"])
def ingest_network():
    try:
        result = IngestionPipeline.process(request.json, domain_override="NETWORK")
        return success_response(result)
    except ValueError as e: return error_response(str(e), 400)
    except Exception as e: return error_response(str(e), 500)

@security_bp.route("/system", methods=["POST"])
def ingest_system():
    try:
        result = IngestionPipeline.process(request.json, domain_override="SYSTEM")
        return success_response(result)
    except ValueError as e: return error_response(str(e), 400)
    except Exception as e: return error_response(str(e), 500)
