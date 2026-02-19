from typing import Dict, Any, List
import statistics

def extract_system_features(session: Dict[str, Any]) -> Dict[str, Any]:
    """
    Extracts System-related features, including Kill-Chain indicators.
    """
    # Standard System Metrics
    cpu_spikes = session.get("cpu_spikes", 0)
    mem_spikes = session.get("mem_spikes", 0)
    syscall_anomalies = session.get("syscall_anomalies", 0)
    
    process_spawns = list(session.get("process_spawns", []))
    process_spawn_rate = 0.0
    
    if process_spawns:
        process_spawn_rate = len(process_spawns) 
    
    # Kill-Chain Logic Extraction
    unusual_parents = False
    sudo_usage = False
    token_manipulation = False
    registry_mod = False
    cron_edit = False
    log_deletion = False
    process_injection = False
    
    defense_evasion_val = 0.0
    
    # Heuristic: Scan process names/details
    for proc in process_spawns:
        p_lower = proc.lower() if isinstance(proc, str) else ""
        if "sudo" in p_lower or "su " in p_lower:
            sudo_usage = True
        if "reg add" in p_lower or "reg edit" in p_lower:
            registry_mod = True
        if "crontab" in p_lower or "schtasks" in p_lower:
            cron_edit = True
        if "rm " in p_lower and (".log" in p_lower or "/var/log" in p_lower):
            log_deletion = True
            defense_evasion_val = 1.0
        if "injection" in p_lower:
            process_injection = True
            defense_evasion_val = 1.0
        
    # Check flags if they were set directly by ingestion
    if session.get("kill_chain_flags", {}).get("unusual_parent"): unusual_parents = True
    
    return {
        "cpu_spike_score": float(cpu_spikes),
        "memory_spike_score": float(mem_spikes),
        "process_spawn_rate": float(process_spawn_rate),
        "privileged_process_count": 0, 
        "syscall_anomaly_score": float(syscall_anomalies),
        "binary_entropy_score": 0.0,
        "persistence_indicator_score": 1.0 if (registry_mod or cron_edit) else 0.0,
        "defense_evasion_score": defense_evasion_val,
        
        # Kill-Chain Booleans
        "unusual_parent_process": unusual_parents,
        "sudo_usage": sudo_usage,
        "token_manipulation": token_manipulation,
        "registry_mod": registry_mod,
        "cron_edit": cron_edit,
        "log_deletion": log_deletion,
        "process_injection": process_injection
    }
