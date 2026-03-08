import nmap
import threading
from typing import List, Dict
from datetime import datetime

from backend.attack_surface.nmap_parser import NmapParser
from backend.attack_surface.port_risk_engine import PortRiskEngine
from backend.attack_surface.attack_path_engine import AttackPathEngine
from backend.attack_surface.exposure_mapper import ExposureMapper

from backend.db.models import AttackSurfaceScan, AttackPath
from backend.database import db
from backend.extensions import socketio

class NmapRunner:
    """
    Executes NMAP Scans safely. Emits WebSocket updates and writes to DB.
    """
    
    # Restrict allowed scanning targets to local infra
    ALLOWED_HOSTS = ["127.0.0.1", "localhost", "0.0.0.0"]

    @staticmethod
    def scan_target_async(target_host: str, app_context):
        """
        Wrapper to run the blocking nmap scan in a background thread 
        so the Flask server doesn't hang.
        """
        if target_host not in NmapRunner.ALLOWED_HOSTS:
            print(f"[SECURITY] Blocked NMAP scan of unauthorized host: {target_host}")
            return
            
        def _run():
            with app_context():
                NmapRunner._execute_scan(target_host)
                
        thread = threading.Thread(target=_run)
        thread.start()

    @staticmethod
    def _execute_scan(target_host: str):
        try:
            print(f"[NMAP] Starting scan on {target_host}...")
            nm = nmap.PortScanner()
            
            # -sV: Probe open ports to determine service/version info
            # -Pn: Treat all hosts as online -- skip host discovery
            # -F: Fast mode - Scan fewer ports than the default scan
            nm.scan(target_host, arguments='-sV -Pn')
            
            # 1. Parse Output
            parsed_data = NmapParser.parse_scan_result(nm, target_host)
            
            # 2. Enrich with Risk Scores
            high_risk_count = 0
            for port_info in parsed_data["ports"]:
                risk = PortRiskEngine.evaluate_risk(port_info["port"], port_info["service"], port_info["state"])
                port_info["risk_level"] = risk
                if risk == "HIGH":
                    high_risk_count += 1
            
            # 3. Model Attack Paths
            paths = AttackPathEngine.infer_paths(parsed_data["ports"], target_host)
            
            # 4. Map Exposure
            exposed_sessions = ExposureMapper.map_sessions_to_ports(parsed_data["ports"])
            
            # 5. Save to Database
            # Delete old scans for this host to keep it as a "Current State" table
            AttackSurfaceScan.query.filter_by(host=target_host).delete()
            
            for port_info in parsed_data["ports"]:
                scan_record = AttackSurfaceScan(
                    host=target_host,
                    port=port_info["port"],
                    service=port_info["service"],
                    state=port_info["state"],
                    version=port_info["version"],
                    risk_level=port_info["risk_level"]
                )
                db.session.add(scan_record)
                
            AttackPath.query.filter_by(host=target_host).delete()
            for p in paths:
                path_record = AttackPath(
                    host=target_host,
                    source_node=p["source"],
                    target_node=p["target"],
                    technique=p["technique"],
                    likelihood=p["likelihood"]
                )
                db.session.add(path_record)
                
            db.session.commit()
            print(f"[NMAP] Scan completed on {target_host}. Found {len(parsed_data['ports'])} ports.")
            
            # 6. Emit Real-time Update
            payload = {
                "host": target_host,
                "open_ports": len(parsed_data["ports"]),
                "high_risk_ports": high_risk_count,
                "attack_paths": paths,
                "exposed_sessions": len(exposed_sessions),
                "timestamp": datetime.utcnow().isoformat() + "Z"
            }
            socketio.emit('attack_surface_update', payload, namespace='/')
            
        except nmap.PortScannerError as e:
            print(f"[NMAP] Scanner Error: {e}")
        except Exception as e:
            print(f"[NMAP] Unexpected Error: {e}")
