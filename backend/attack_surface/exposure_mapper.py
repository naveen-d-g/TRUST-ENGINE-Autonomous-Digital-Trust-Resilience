from backend.services.observation_service import SessionStateEngine

class ExposureMapper:
    """
    Ties Active Trust Engine user sessions to the exposed 
    attack surface of the host they are connected to.
    """
    
    @staticmethod
    def map_sessions_to_ports(open_ports: list) -> list:
        """
        Maps currently active user sessions to exposed host ports.
        (Future-proofing for multi-tenant / multi-node deployment).
        """
        # Note: In a true distributed system, we would match 'target_host' 
        # to the specific pod/node the session is hitting.
        # For this localhost deployment, all sessions touch the exposed ports.
        
        exposed_sessions = []
        
        # Get all live sessions from observation logic
        active_sessions = SessionStateEngine._sessions.values()
        
        for session in active_sessions:
            if not session.get('is_active', False):
                continue
                
            exposed_sessions.append({
                "session_id": session.get("session_id"),
                "user_id": session.get("user_id", "Anonymous"),
                "platform": session.get("platform", "WEB")
            })
            
        return exposed_sessions
