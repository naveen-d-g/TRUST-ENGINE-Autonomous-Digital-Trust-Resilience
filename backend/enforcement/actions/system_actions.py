from typing import Dict, Any

class SystemActions:
    """
    Defines actions specific to System Intrusions / Kill-Chain events.
    Most of these are HIGH IMPACT and thus MANUAL.
    """
    
    @staticmethod
    def get_action_details(action_name: str, target: str) -> Dict[str, Any]:
        """
        Returns execution details/payload for a system action.
        """
        if action_name == "SYSTEM_ISOLATE":
            return {
                "type": "HOST_ISOLATION",
                "target": target,
                "command": f"iptables -A INPUT -s {target} -j DROP", # Advisory/Mock
                "description": "Isolates the host from the network at the soft-firewall level."
            }
            
        elif action_name == "REVOKE_TOKEN":
            return {
                "type": "TOKEN_REVOCATION",
                "target": target,
                "description": "Invalidates all active tokens for the session/user."
            }
            
        elif action_name == "PROCESS_TERMINATE":
            return {
                "type": "PROCESS_KILL",
                "target": target, # pid
                "command": f"kill -9 {target}", # Advisory
                "description": "Terminates the suspicious process."
            }
            
        return {}
