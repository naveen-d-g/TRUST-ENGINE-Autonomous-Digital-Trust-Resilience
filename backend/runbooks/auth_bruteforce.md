# SOC Runbook: Auth Bruteforce Response

## 1. Detection Signals

- **Trigger**: `AuthFailureAnomaly`.
- **Indicators**:
  - Multiple failed logins (> 5/min).
  - Credential Stuffing (User/Pass distinct pairs).
  - Password Spraying (Single Pass / Many Users).

## 2. Automated Response

- **Proposal**: `STEP_UP_AUTH` (MFA) or `TEMP_BLOCK`.
- **Priority**: P0 (Critical) if Admin accounts targeted.

## 3. Human Analysis

1.  **Target Value**: Are they targeting Admins or Regular users?
2.  **Source**: Is it a Botnet (Distributed) or Single IP?
3.  **Success Rate**: Did any attempt succeed? (Check `AuthSuccess` logs).

## 4. Decision & Enforcement

- **If Attack**:
  - Approve `STEP_UP_AUTH` for all targeted accounts.
  - If Admin targeted, Approve `TEMP_IP_RESTRICT`.
  - **Justification**: "Credential Stuffing detected on Admin Portal."
- **If User Error**:
  - Monitor Only.
  - Send "Forgot Password" email.

## 5. Rollback

- Unlock Account via IDP.
- Remove IP Block.

## 6. Audit Checklist

- [ ] Targeted Accounts listed?
- [ ] Attack Source (IP/ASN) recorded?
