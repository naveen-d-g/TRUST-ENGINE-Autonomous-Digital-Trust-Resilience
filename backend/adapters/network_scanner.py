import subprocess
import xml.etree.ElementTree as ET
import time
import shutil
from backend.services.ingestion_service import IngestionService
from backend.utils.logger import log_error, log_info

class NetworkScanner:
    """
    Adapter for Nmap network scanning.
    Supports Fast, Port, and Full scan modes.
    Normalizes output for the Ingestion Service.
    """
    
    @staticmethod
    def _check_nmap():
        return shutil.which("nmap") is not None

    @staticmethod
    def scan_network(target, mode="fast"):
        """
        Runs Nmap scan on target.
        Modes:
        - fast: -F (Top 100 ports)
        - port: -p 1-10000 (Common range)
        - full: -p- (All 65535 ports - Slow)
        """
        if not NetworkScanner._check_nmap():
            log_error("Nmap not found", "Ensure nmap is installed and in PATH")
            return {"error": "Nmap not installed"}

        cmd = ["nmap", "-sS", "-oX", "-"]
        
        if mode == "fast":
            cmd.append("-F")
        elif mode == "port":
            cmd.extend(["-p", "1-10000"])
        elif mode == "full":
            cmd.append("-p-")
        else:
            cmd.append("-F") # Default to fast
            
        cmd.append(target)
        
        log_info(f"Starting Nmap scan: {' '.join(cmd)}")
        
        try:
            # Run blocking for now, but in a real worker this is fine.
            # For the UI non-blocking requirement, the Route that calls this MUST use a thread.
            result = subprocess.run(cmd, capture_output=True, text=True, timeout=300)
            
            if result.returncode != 0:
                log_error("Nmap failed", result.stderr)
                return {"error": "Scan failed", "details": result.stderr}
                
            return NetworkScanner._parse_nmap_xml(result.stdout, mode, target)
            
        except subprocess.TimeoutExpired:
            log_error("Nmap timeout", f"Scan mode {mode} timed out on {target}")
            return {"error": "Scan timed out"}
        except Exception as e:
            log_error("Nmap execution error", str(e))
            return {"error": str(e)}

    @staticmethod
    def _parse_nmap_xml(xml_content, mode, target):
        try:
            root = ET.fromstring(xml_content)
            events = []
            
            for host in root.findall("host"):
                address = host.find("address").get("addr")
                if not address: continue
                
                ports = []
                open_ports = []
                
                ports_elem = host.find("ports")
                if ports_elem:
                    for port in ports_elem.findall("port"):
                        portid = int(port.get("portid"))
                        state = port.find("state").get("state")
                        service_elem = port.find("service")
                        service = service_elem.get("name") if service_elem is not None else "unknown"
                        
                        ports.append({"port": portid, "state": state, "service": service})
                        if state == "open":
                            open_ports.append(portid)
                
                # Determine Severity based on Open Ports
                severity = "info"
                if len(open_ports) > 0: severity = "low"
                if len(open_ports) > 10: severity = "medium"
                
                # Check for critical ports
                critical_ports = {21, 22, 23, 3389, 445}
                if set(open_ports).intersection(critical_ports):
                    severity = "high"

                # Payload Construction
                feature_payload = {
                    "scan_type": mode,
                    "target": address,
                    "total_ports_scanned": "100" if mode == "fast" else ("10000" if mode == "port" else "65535"),
                    "open_port_count": len(open_ports),
                    "open_ports": open_ports,
                    "details": ports
                }
                
                # Ingest Event
                event = {
                    "event_type": "network",
                    "timestamp": time.time(),
                    "session_id": f"net_scan_{address}",
                    "severity": severity,
                    "features": feature_payload
                }
                
                # Emit
                IngestionService.ingest_network_event(event) # This puts it into SessionState
                events.append(event)
                
            return {"status": "success", "scanned_hosts": len(events), "events": events}

        except ET.ParseError as e:
            log_error("Nmap XML Parse Error", str(e))
            return {"error": "Failed to parse Nmap output"}
