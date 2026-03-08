from flask import Blueprint, jsonify, request
from backend.auth.rbac import require_role
from backend.db.models import AttackSurfaceScan, AttackPath
from backend.attack_surface.nmap_runner import NmapRunner
from flask import current_app
from sqlalchemy import desc

attack_surface_bp = Blueprint('attack_surface', __name__)

@attack_surface_bp.route('/scan', methods=['POST'])
@require_role(["ADMIN", "ANALYST"])
def trigger_scan():
    """
    Manually triggers a background NMAP scan.
    Returns 202 Accepted immediately.
    """
    payload = request.get_json() or {}
    target_host = payload.get("host", "127.0.0.1")
    
    if target_host not in NmapRunner.ALLOWED_HOSTS:
        return jsonify({"error": f"Scanning {target_host} is not permitted."}), 403
        
    NmapRunner.scan_target_async(target_host, current_app.app_context)
    return jsonify({"status": "accepted", "message": f"Scan initiated on {target_host}."}), 202

@attack_surface_bp.route('/data', methods=['GET'])
def get_attack_surface_data():
    """
    Retrieves the latest scanned attack surface data for the UI.
    """
    target_host = request.args.get("host", "127.0.0.1")
    
    # Get all ports for the host
    ports = AttackSurfaceScan.query.filter_by(host=target_host).order_by(desc(AttackSurfaceScan.scan_time)).all()
    print(f"[DEBUG] AttackSurface GET for {target_host} -> found {len(ports)} ports in DB")
    
    # Get all inferred paths
    paths = AttackPath.query.filter_by(host=target_host).order_by(desc(AttackPath.detected_at)).all()
    
    high_risk = sum(1 for p in ports if p.risk_level == "HIGH")
    
    # Map back to dictionaries
    ports_data = [p.to_dict() for p in ports]
    paths_data = [p.to_dict() for p in paths]
    
    from backend.attack_surface.exposure_mapper import ExposureMapper
    exposed_sessions = ExposureMapper.map_sessions_to_ports(ports_data)
    
    # Generate mock LLM Insight based on data
    if not ports_data:
        ai_insight = "The AI Intelligence engine detected no open ports. Your attack surface is currently minimal, reducing external exposure risks significantly and preventing unauthorized ingress."
    elif high_risk > 0:
        ai_insight = f"CRITICAL PRIORITY: The AI Intelligence engine identified {high_risk} high-risk ports exposed. Immediate remediation is recommended. Restrict access via security groups or implement strict Zero Trust network policies to prevent lateral movement and exploitation."
    else:
        ai_insight = f"The target host has {len(ports_data)} open ports. While no high-risk exposures were flagged, continuous monitoring and ML behavior evaluation is advised to detect anomalous traffic patterns targeting these services."
    
    return jsonify({
        "host": target_host,
        "summary": {
            "total_open_ports": len(ports_data),
            "high_risk_count": high_risk,
            "last_scan": ports_data[0]["scan_time"] if ports_data else None,
            "exposed_sessions_count": len(exposed_sessions),
            "ai_insight": ai_insight
        },
        "ports": ports_data,
        "attack_paths": paths_data,
        "exposed_sessions": exposed_sessions
    }), 200
