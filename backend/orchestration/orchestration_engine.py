from typing import Dict, Any
from backend.orchestration.execution_context import ExecutionContext
from backend.orchestration.async_dispatcher import AsyncDispatcher
from backend.audit.audit_log import AuditLogger
from backend.orchestration.decision_router import DecisionRouter

# Placeholder for Enforcement (Phase 3)
# from backend.enforcement.state.proposal_registry import ProposalRegistry 

class OrchestrationEngine:
    """
    Coordinates the flow after ML inference.
    Non-blocking.
    """
    
    @staticmethod
    def process_inference_result(ml_result: Dict[str, Any]):
        """
        Entry point from Inference Pipeline.
        Dispatches to background thread.
        """
        AsyncDispatcher.fire_and_forget(
            "process_inference",
            OrchestrationEngine._process_sync,
            ml_result
        )
        
    @staticmethod
    def _process_sync(ml_result: Dict[str, Any]):
        """
        Synchronous processing logic (runs in background thread).
        """
        try:
            # 1. Create Execution Context
            context = ExecutionContext(
                session_id=ml_result.get("session_id"),
                risk_score=ml_result.get("risk_score", 0.0),
                decision=ml_result.get("decision", "ALLOW"),
                breakdown=ml_result.get("breakdown", {}),
                trust_score=ml_result.get("trust_score", 100.0),
                # TODO: Populate user_id, history etc.
            )
            
            # 2. Log Decision
            AuditLogger.log_system_event("RECEIVED", f"Processing ml result: {context.to_dict()}", "INFO")
            
            # 3. Route
            workflow = DecisionRouter.route_decision(context.decision)
            
            # 4. Handle Workflow
            if workflow == "MONITORING_ONLY":
                # Just log, maybe update trust metric stats
                AuditLogger.log_system_event("MONITORED", f"No action needed: {context.to_dict()}", "INFO")
                
            elif workflow == "SOC_ALERT":
                AuditLogger.log_system_event("ALERTED", f"Sent to SOC Alert Stream: {context.to_dict()}", "WARNING")
                
            elif workflow in ["ENFORCEMENT_PROPOSAL", "HIGH_PRIORITY_ENFORCEMENT"]:
                # Check for Staleness before proposing
                if context.is_expired():
                    AuditLogger.log_system_event("REJECTED_STALE", f"Context expired before orchestration: {context.to_dict()}", "WARNING")
                    return

                # Blast Radius Guard
                from backend.orchestration.blast_radius_guard import BlastRadiusGuard
                # We need threat assessment here. Ideally it comes from context or we do a lightweight check.
                # Assuming context might have it or we create a temp one.
                # For now, let's assume if it's high impact, we check.
                # Actually, EnforcementEngine does the heavy Threat Analysis.
                # But Master Prompt said "Before Proposal Creation".
                # Orchestration calls EnforcementEngine.handle_enforcement_request, which DOES Threat Analysis then Register.
                # So technically EnforcementEngine check IS "Before Proposal Creation" (Registration).
                # But let's add a safety check here if we have info.
                # Since we don't have full threat assessment here yet, we defer to EnforcementEngine.
                # wait, EnforcementEngine lines 33-35 do Threat Analysis, then line 57 does Override, then line 69 Register.
                # So inside EnforcementEngine is the right place. 
                # Let's verify EnforcementEngine has it... 
                # I checked EnforcementEngine earlier, it has `ThreatAnalyzer.assess` but I didn't see `BlastRadiusGuard.validate`.
                # I Should add it to EnforcementEngine instead of here to avoid duplicating Threat Analysis.
                pass 


                # Handover to Enforcement Engine
                from backend.enforcement.enforcement_engine import EnforcementEngine
                EnforcementEngine.handle_enforcement_request(context)
                
                AuditLogger.log_system_event("PROPOSED", f"Enforcement Proposal Handed Off ({workflow}): {context.to_dict()}", "INFO")
                
        except Exception as e:
            AuditLogger.log_system_event("ORCHESTRATION_ERROR", str(e), "ERROR")
            raise e
