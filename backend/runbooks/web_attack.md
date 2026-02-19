# SOC Runbook: Web Attack Response

## 1. Detection Signals

- **Trigger**: `SuggestionEngine` output or `ThreatAnalyzer` alert.
- **Indicators**:
  - High `web_risk_score` (> 80).
  - Rapid sequence of 4xx/5xx errors.
  - Path traversal patterns (e.g., `../../etc/passwd`).
  - SQL Injection signatures in `query_params`.
  - XSS payloads in POST bodies.

## 2. Automated Response (System)

- **Immediate Action**: None (Manual-First Policy).
- **Proposal Created**: `RESTRICT` or `ESCALATE` based on severity.
- **Suggested Actions**: `CAPTCHA`, `RATE_LIMIT` (WAF Layer).

## 3. Human Analysis (SOC Analyst)

1.  **Verify Context**: Check `ExecutionContext` for `user_id` and `session_history`. Is this a known user?
2.  **Check False Positives**: Is the payload actually a developer testing code? (Check `user_role`).
3.  **Correlate**: Are there similar attacks from the same IP/Subnet? (Check `BlastRadius`).

## 4. Decision & Enforcement

- **If Malicious**:
  - Approve `CAPTCHA` for immediate mitigation.
  - If persistence continues, Approve `TEMP_IP_RESTRICT` (15m).
  - **Justification Required**: "Confirmed SQLi pattern in login form."
- **If False Positive**:
  - Reject Proposal.
  - Mark Risk Signal as `FALSE_POSITIVE` in `FeedbackLoop`.

## 5. Rollback

- If valid user is blocked:
  - Execute `ROLLBACK` on `TEMP_IP_RESTRICT`.
  - Log `COMPENSATION_EVENT`.

## 6. Audit Checklist

- [ ] Decision Logged with Trace ID?
- [ ] Justification provided?
- [ ] Blast Radius confirmed (Single Session vs Tenant)?
