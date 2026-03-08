# backend/attack_surface/port_risk_engine.py

class PortRiskEngine:
    # High-risk ports often targeted or typically shouldn't be exposed
    HIGH_RISK_PORTS = {
        21: "FTP",
        22: "SSH",
        23: "Telnet",
        3389: "RDP",
        1433: "MSSQL",
        3306: "MySQL",
        27017: "MongoDB",
        11211: "Memcached"
    }

    # Medium-risk ports (can be necessary but require scrutiny)
    MEDIUM_RISK_PORTS = {
        80: "HTTP",
        443: "HTTPS",
        3000: "React/Dev",
        3001: "App Backend",
        5000: "Flask API",
        5432: "PostgreSQL",
        8080: "HTTP-Alt"
    }

    @staticmethod
    def evaluate_risk(port: int, service: str, state: str) -> str:
        """
        Evaluate the risk level of an open port based on heuristic rules.
        """
        if state != "open":
            return "LOW"
            
        if port in PortRiskEngine.HIGH_RISK_PORTS:
            return "HIGH"
            
        if port in PortRiskEngine.MEDIUM_RISK_PORTS:
            return "MEDIUM"
            
        # Unknown/Uncommon services Default to HIGH if they are open
        return "LOW"

    @staticmethod
    def identify_unnecessary_exposure(port: int, environment="DEV") -> bool:
        """
        Identify if a port is an unnecessary exposure.
        """
        if environment == "PROD":
            # In purely restricted prod, only 80/443 should typically be public
            allowed_prod_ports = [80, 443]
            return port not in allowed_prod_ports
        return False
