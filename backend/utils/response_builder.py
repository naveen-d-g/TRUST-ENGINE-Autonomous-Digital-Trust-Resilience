from flask import jsonify
from typing import Any, Dict, Optional

def success_response(data: Any = None, message: str = "Success", status_code: int = 200):
    """
    Standard Success Response.
    """
    response = {
        "status": "success",
        "message": message,
        "data": data
    }
    return jsonify(response), status_code

def error_response(message: str, status_code: int = 400, details: Optional[Any] = None):
    """
    Standard Error Response.
    """
    response = {
        "status": "error",
        "message": message
    }
    if details:
        response["details"] = details
        
    return jsonify(response), status_code
