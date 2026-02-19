# SOC Runbook: Platform Outage / Dependency Failure

## 1. Trigger

- `EnforcementFailure` (TIMEOUT, DEPENDENCY_FAILURE).
- `SafeMode` Activation.
- Health Check Fails (ML Service, DB, Redis).

## 2. Immediate Response

1.  **Activate Safe Mode**: Prevent active enforcement if decision quality is compromised.
    - `SafeMode.enable_global_safe_mode()` (if Risk > Value).
2.  **Fail-Open / Fail-Closed**:
    - **Auth**: Fail-Closed (Deny access if IDP down).
    - **WAF**: Fail-Open (Allow traffic if ML down, but log heavily).

## 3. Diagnosis

- Check `AuditLog` for `ENFORCEMENT_CRASH`.
- Check Infrastructure Metrics (CPU, Memory, Network).

## 4. Recovery

- Restart Services.
- Verify `ContextGuards` are passing.
- Disable `SafeMode`.

## 5. Audit Checklist

- [ ] Outage Duration.
- [ ] Failed Enforcements Count.
- [ ] Recovery Operations Logged.
