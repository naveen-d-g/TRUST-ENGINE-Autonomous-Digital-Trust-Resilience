class AttackPathEngine:
    """
    Infers potential attack paths a threat actor might take
    based on the combination of services exposed.
    """
    
    @staticmethod
    def infer_paths(open_ports: list, host: str) -> list:
        paths = []
        port_nums = [p["port"] for p in open_ports]
        services = [p["service"].lower() for p in open_ports]
        
        # Rule 1: Exposed Application -> Database Data Exfiltration
        if any("http" in s or "web" in s for s in services):
            db_ports = [3306, 5432, 27017, 1433, 6379]
            exposed_dbs = [p for p in port_nums if p in db_ports]
            if exposed_dbs:
                paths.append({
                    "source": f"Web App ({next(p['port'] for p in open_ports if 'http' in p['service'].lower())})",
                    "target": f"Database ({exposed_dbs[0]})",
                    "technique": "Application Exploit -> Lateral Data Exfiltration",
                    "likelihood": "HIGH"
                })
                
        # Rule 2: Remote Code Execution -> Internal Privilege Escalation
        if 22 in port_nums or 23 in port_nums or 3389 in port_nums:
            mgmt_port = 22 if 22 in port_nums else 23 if 23 in port_nums else 3389
            paths.append({
                "source": "Internet / LAN",
                "target": f"OS Remote Management ({mgmt_port})",
                "technique": "Brute Force / Credential Stuffing -> Host Takeover",
                "likelihood": "CRITICAL"
            })
            
        # Rule 3: File Server Exfiltration
        if 21 in port_nums or 445 in port_nums:
            file_port = 21 if 21 in port_nums else 445
            paths.append({
                "source": "Internet / LAN",
                "target": f"File Server ({file_port})",
                "technique": "Anonymous Access -> Mass Data Exfiltration",
                "likelihood": "HIGH"
            })
            
        # Default Fallback if vulnerable but no specific chains
        if not paths and any(p for p in open_ports if p.get("risk_level") == "HIGH"):
             paths.append({
                "source": "Exposed High-Risk Service",
                "target": "Host System",
                "technique": "Unknown Vulnerability Exploitation",
                "likelihood": "MEDIUM"
             })
             
        return paths
