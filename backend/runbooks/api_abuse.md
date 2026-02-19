# SOC Runbook: API Abuse Response

## 1. Detection Signals

- **Trigger**: `APITrafficModel` or `RateLimitExceeded`.
- **Indicators**:
  - High `api_risk_score`.
  - Token reuse across multiple IPs.
  - Burst rate > 100 req/sec.
  - Accessing unauthorized endpoints (`403 Forbidden` spikes).

## 2. Automated Response

- **Proposal**: `RATE_LIMIT` or `TOKEN_INVALIDATE`.
- **Priority**: P1 (High) if impacting service availability.

## 3. Human Analysis

1.  **Check Token Meta**: Is this a Service Account or User Token?
2.  **Volume Check**: Is this a scheduled batch job? (Check `User-Agent`).
3.  **Business Impact**: Will blocking this break a critical integration?

## 4. Decision & Enforcement

- **If Abuse**:
  - Approve `RATE_LIMIT` (aggressive).
  - If token compromised, Approve `TOKEN_INVALIDATE`.
  - **Justification**: "Token leaked; usage from 50+ IPs."
- **If Misconfig**:
  - Contact Developer / Tenant Admin.
  - Reject Enforcement.

## 5. Rollback

- Re-issue Token (Manual Process via IDP).
- Lift Rate Limit via `EnforcementActions.lift_limit()`.

## 6. Audit Checklist

- [ ] Token ID logged?
- [ ] Tenant notified?
