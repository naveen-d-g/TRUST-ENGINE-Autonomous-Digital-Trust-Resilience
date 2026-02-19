from typing import Dict, Any, Optional
from backend.orchestration.execution_context import ExecutionContext
from backend.enforcement.state.proposal_registry import ProposalRegistry
from backend.enforcement.state_machine.enforcement_state_machine import EnforcementState
from backend.governance.enforcement_policy_engine import EnforcementPolicyEngine
from backend.enforcement.enforcement_actions import EnforcementActions
from backend.audit.audit_log import AuditLogger
from backend.threat_model.threat_analyzer import ThreatAnalyzer
from backend.common.scope import EnforcementScopeResolver
from backend.enforcement.cooldown_manager import CooldownManager
from backend.enforcement.outcome_emitter import OutcomeEmitter
from backend.incidents.incident_manager import IncidentManager
from backend.recovery.recovery_engine import RecoveryEngine

class EnforcementEngine:
    """
    Main entry point for enforcement logic.
    Safety-first: Threat Analysis -> Policy -> Proposal -> Execution.
    Integrated with OutcomeEmitter, RecoveryEngine, and IncidentManager.
    """

    @staticmethod
    def execute_approved_proposal(proposal_id: str, context: ExecutionContext):
         proposal = ProposalRegistry.get_proposal(proposal_id)
         
         # 0. Safe Mode Check (Late Binding)
         from backend.governance.safe_mode import SafeMode
         if SafeMode.is_enabled(context.tenant_id):
             AuditLogger.log_system_event("ENFORCEMENT_SKIPPED", "Safe Mode Enabled during Manual Execution", "WARN")
             return

         # Strict State Transition: APPROVED -> EXECUTING
         ProposalRegistry.update_status(proposal_id, "EXECUTING") 
         AuditLogger.log_enforcement(proposal_id, proposal["suggested_action"], "EXECUTING", "MANUAL_EXECUTION_START")
         
         try:
             success = EnforcementActions.execute_action(proposal["suggested_action"], context.to_dict())
             if success:
                 ProposalRegistry.update_status(proposal_id, EnforcementState.COMPLETED)
                 AuditLogger.log_enforcement(proposal_id, proposal["suggested_action"], "COMPLETED", "MANUAL_APPROVAL")
                 
                 # Feedback (Success)
                 OutcomeEmitter.emit_outcome(
                     context.to_dict(), 
                     proposal["suggested_action"], 
                     "SUCCESS", 
                     details="Manual Approval Executed"
                 )
             else:
                 ProposalRegistry.update_status(proposal_id, EnforcementState.FAILED)
                 AuditLogger.log_enforcement(proposal_id, proposal["suggested_action"], "FAILED", "MANUAL_APPROVAL")
                 
                 # Feedback (Failed)
                 OutcomeEmitter.emit_outcome(
                     context.to_dict(), 
                     proposal["suggested_action"], 
                     "FAILED",
                     details="Manual Execution Returned False"
                 )
                 
                 # Recovery Trigger
                 RecoveryEngine.generate_recovery_plan(
                     proposal_id, 
                     "EXECUTION_FAILURE", 
                     context.to_dict(),
                     proposal.get("threat_assessment", {})
                 )

         except Exception as e:
             ProposalRegistry.update_status(proposal_id, EnforcementState.FAILED)
             AuditLogger.log_enforcement(proposal_id, proposal["suggested_action"], "FAILED_CRASH", str(e))
             
             # Feedback (Crash)
             OutcomeEmitter.emit_outcome(
                 context.to_dict(), 
                 proposal["suggested_action"], 
                 "FAILED_CRASH", 
                 str(e)
             )
             
             # Recovery Trigger
             RecoveryEngine.generate_recovery_plan(
                 proposal_id,
                 "SYSTEM_CRASH",
                 context.to_dict(),
                 proposal.get("threat_assessment", {})
             )
             
             # Failure Classification Log
             from backend.enforcement.failure.failure_classifier import EnforcementFailureClassifier
             failure_type = EnforcementFailureClassifier.classify_exception(e)
             AuditLogger.log_system_event("ENFORCEMENT_CRASH", f"Action {proposal['suggested_action']} crashed. Type: {failure_type}", "ERROR")

    @staticmethod
    def handle_enforcement_request(context: ExecutionContext):
        """
        Called by Orchestration Engine/Decision Router.
        Evaluates policy and registers proposal or executes auto-actions.
        """
        # 0. Safety & Governance Checks
        from backend.governance.safe_mode import SafeMode
        from backend.common.context_guards import ContextGuards, StaleContextError
        
        # Kill-switch
        if SafeMode.is_enabled(context.tenant_id):
             AuditLogger.log_system_event("ENFORCEMENT_SKIPPED", "Safe Mode Enabled", "WARN")
             return

        # Freshness
        try:
            ContextGuards.ensure_context_fresh(context)
        except StaleContextError as e:
            AuditLogger.log_system_event("ENFORCEMENT_REJECTED", str(e), "WARN")
            return

        # 1. Policy Gate (Get suggested action)
        suggested_action, default_is_auto = EnforcementPolicyEngine.evaluate(context)
        
        if suggested_action == "NONE":
            return

        # 2. Threat Modeling (Advisory)
        target = context.session_id
        threat_assessment = ThreatAnalyzer.assess(suggested_action, target, context)
        # Bypass frozen check for late-binding safety property
        object.__setattr__(context, 'threat_assessment', threat_assessment.to_dict())

        # Safety: Blast Radius Check
        from backend.orchestration.blast_radius_guard import BlastRadiusGuard
        try:
             BlastRadiusGuard.validate_proposal(suggested_action, threat_assessment.to_dict())
        except ValueError as e:
             AuditLogger.log_system_event("ENFORCEMENT_REJECTED", f"Blast Radius Violation: {e}", "CRITICAL")
             return

        # 3. Idempotency Check (Pre-Registry)
        from backend.enforcement.idempotency import IdempotencyContract
        idempotency_key = IdempotencyContract.generate_key(
             context.session_id, suggested_action, context.risk_score
        )
        
        # Check active proposals
        active_props = ProposalRegistry.list_proposals()
        existing_pid = next(
            (p['id'] for p in active_props 
             if p["session_id"] == context.session_id 
             and p["suggested_action"] == suggested_action
             and p["status"] not in [EnforcementState.COMPLETED, EnforcementState.FAILED, "ROLLED_BACK"]),
            None
        )
        if existing_pid:
            AuditLogger.log_enforcement(existing_pid, suggested_action, "DUPLICATE_SKIPPED", "Idempotency Check")
            return

        # 4. Governance: Threat Override
        from backend.governance.threat_override_policy import ThreatOverridePolicy
        is_overridden, override_reason = ThreatOverridePolicy.evaluate_override(threat_assessment.to_dict())
        
        is_auto = default_is_auto
        if is_overridden:
            is_auto = False
            AuditLogger.log_system_event("OVERRIDE_TRIGGERED", f"Action {suggested_action} forced MANUAL due to {override_reason}", "WARN")

        # 5. Register Proposal
        pid = ProposalRegistry.register_proposal(context, suggested_action)
        
        # LINK INCIDENT (Regardless of auto/manual)
        # This attaches the decision to the Incident correlation engine
        incident_id = IncidentManager.link_proposal_to_incident(ProposalRegistry.get_proposal(pid))
        
        # Check if proposal is already in a terminal/advanced state (Idempotency Catch)
        current_proposal = ProposalRegistry.get_proposal(pid)
        if current_proposal["status"] in [EnforcementState.COMPLETED, EnforcementState.EXECUTING, EnforcementState.APPROVED, EnforcementState.ROLLED_BACK]:
             # Already processed or processing. Do nothing.
             AuditLogger.log_enforcement(pid, suggested_action, "SKIPPED", f"Idempotent Skip (Status: {current_proposal['status']})")
             return

        # 6. State Transition
        if is_auto:
            # Governance Matrix Check
            from backend.governance.approval_matrix import ApprovalMatrix
            if not ApprovalMatrix.can_approve(suggested_action, "system", threat_assessment.severity):
                 is_auto = False
                 AuditLogger.log_enforcement(pid, suggested_action, "AUTO_DENIED", "Approval Matrix Rejected System Role")

        if is_auto:
            # Check Cooldown
            scope_enum = EnforcementScopeResolver.resolve_scope(context.to_dict())
            if not CooldownManager.check_cooldown(suggested_action, context.session_id, scope_enum, context.tenant_id):
                 AuditLogger.log_system_event("ENFORCEMENT_THROTTLED", f"Action {suggested_action} in cooldown", "WARN")
                 # We probably should fail the proposal here or mark it throttled?
                 ProposalRegistry.update_status(pid, EnforcementState.FAILED)
                 return

            # Explicit Transition for Audit Trail & State Machine Compliance
            ProposalRegistry.update_status(pid, EnforcementState.PENDING)
            ProposalRegistry.update_status(pid, EnforcementState.APPROVED)
            ProposalRegistry.update_status(pid, EnforcementState.EXECUTING)
            
            try:
                success = EnforcementActions.execute_action(suggested_action, context.to_dict())
                if success:
                    ProposalRegistry.update_status(pid, EnforcementState.COMPLETED)
                    AuditLogger.log_enforcement(pid, suggested_action, "COMPLETED", "AUTO_POLICY")
                    
                    # Cooldown Record
                    CooldownManager.record_execution(suggested_action, context.session_id, scope_enum)
                    
                    # ML Feedback - SUCCESS
                    OutcomeEmitter.emit_outcome(context.to_dict(), suggested_action, "SUCCESS")
                    
                else:
                    ProposalRegistry.update_status(pid, EnforcementState.FAILED)
                    AuditLogger.log_enforcement(pid, suggested_action, "FAILED", "AUTO_POLICY")
                    
                    # Feedback - FAILED
                    OutcomeEmitter.emit_outcome(context.to_dict(), suggested_action, "FAILED")

                    # Recovery Trigger
                    RecoveryEngine.generate_recovery_plan(
                        incident_id,
                        "EXECUTION_FAILURE",
                        context.to_dict(),
                        threat_assessment.to_dict()
                    )

                    # Failure Classification
                    from backend.enforcement.failure.failure_classifier import EnforcementFailureClassifier
                    failure_type = EnforcementFailureClassifier.classify_result(False)
                    AuditLogger.log_system_event("ENFORCEMENT_FAILURE", f"Action {suggested_action} failed. Type: {failure_type}", "ERROR")

            except Exception as e:
                ProposalRegistry.update_status(pid, EnforcementState.FAILED)
                AuditLogger.log_enforcement(pid, suggested_action, "FAILED_CRASH", str(e))
                
                # Feedback - FAILED CRASH
                OutcomeEmitter.emit_outcome(context.to_dict(), suggested_action, "FAILED_CRASH", str(e))
                
                # Recovery Trigger
                try:
                    RecoveryEngine.generate_recovery_plan(
                        incident_id,
                        "SYSTEM_CRASH",
                        context.to_dict(),
                        threat_assessment.to_dict()
                    )
                except Exception as re:
                   AuditLogger.log_system_event("RECOVERY_ENGINE_FAILURE", f"Correction failed: {re}", "ERROR")

                # Failure Classification
                from backend.enforcement.failure.failure_classifier import EnforcementFailureClassifier
                failure_type = EnforcementFailureClassifier.classify_exception(e)
                AuditLogger.log_system_event("ENFORCEMENT_CRASH", f"Action {suggested_action} crashed. Type: {failure_type}", "ERROR")
                
        else:
            # Move to PENDING
            ProposalRegistry.update_status(pid, EnforcementState.PENDING)
            AuditLogger.log_enforcement(pid, suggested_action, "PENDING", "POLICY_GATE")
