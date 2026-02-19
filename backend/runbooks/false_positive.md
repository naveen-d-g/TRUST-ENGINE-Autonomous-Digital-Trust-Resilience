# SOC Runbook: False Positive Handling

## 1. Trigger

- User Complaint ("I can't log in", "I'm being blocked").
- Support Ticket.
- `AnalystFeedbackModel` signal.

## 2. Investigation

1.  **Locate Trace**: specific `trace_id` or `session_id`.
2.  **Review Logic**: Why did ML score high risk? (Check `ExplanationEngine`).
3.  **Validate**: Was the user behavior legitimate but anomalous? (e.g., travel, new device).

## 3. Remediation

- **Immediate**: Execute `ROLLBACK` on active enforcement.
- **Learning**:
  - Tag Trace as `FALSE_POSITIVE` in `AuditLog`.
  - Trigger `AnalystFeedbackModel.record_feedback(..., "OVERRIDE")`.
  - Update `AllowList` if Policy allows (Careful!).

## 4. Audit Checklist

- [ ] Original Decision ID.
- [ ] Reason for FP (Model Drift vs Human Error).
- [ ] Learning Loop Triggered?
