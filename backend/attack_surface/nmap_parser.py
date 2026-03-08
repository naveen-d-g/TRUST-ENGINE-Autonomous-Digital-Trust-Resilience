import nmap
import json
import socket
from datetime import datetime

class NmapParser:
    """
    Parses complex nmap object graphs into simple JSON structures.
    Resilient to missing versions or extra nmap fields.
    """
    
    @staticmethod
    def parse_scan_result(nm_scanner, target_host: str) -> dict:
        """
        Takes the populated `nmap.PortScanner` object and extracts 
        normalized JSON representation of the host attack surface.
        """
        result = {
            "host": target_host,
            "ip": target_host,
            "os_matches": [],
            "ports": [],
            "timestamp": datetime.utcnow().isoformat() + "Z",
            "status": "down"
        }
        
        # If target doesn't resolve in nmap results (e.g. host is down)
        if not nm_scanner.all_hosts() or target_host not in nm_scanner.all_hosts():
            # Try by IP if a hostname was used
            try:
                ip = socket.gethostbyname(target_host)
                if ip in nm_scanner.all_hosts():
                    target_host = ip
                    result["ip"] = ip
                else:
                    return result
            except socket.gaierror:
                return result

        host_data = nm_scanner[target_host]
        result["status"] = host_data.state()
        
        # OS Detection Parsing
        if 'osmatch' in host_data and host_data['osmatch']:
            for match in host_data['osmatch']:
                result["os_matches"].append({
                    "name": match.get('name', 'Unknown'),
                    "accuracy": match.get('accuracy', '0')
                })

        # TCP Port Parsing
        if 'tcp' in host_data:
            for port, port_data in host_data['tcp'].items():
                parsed_port = {
                    "port": int(port),
                    "state": port_data.get('state', 'unknown'),
                    "service": port_data.get('name', 'unknown'),
                    "version": port_data.get('version', '') + " " + port_data.get('extrainfo', ''),
                    "product": port_data.get('product', '')
                }
                # Clean up whitespace
                parsed_port["version"] = parsed_port["version"].strip()
                result["ports"].append(parsed_port)
                
        # UDP Port Parsing
        if 'udp' in host_data:
            for port, port_data in host_data['udp'].items():
                 parsed_port = {
                    "port": int(port),
                    "state": port_data.get('state', 'unknown'),
                    "service": port_data.get('name', 'unknown') + " (UDP)",
                    "version": port_data.get('version', ''),
                    "product": port_data.get('product', '')
                 }
                 result["ports"].append(parsed_port)

        return result
