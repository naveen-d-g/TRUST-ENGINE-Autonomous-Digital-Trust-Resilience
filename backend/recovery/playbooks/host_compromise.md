# Playbook: System Host Compromise Recovery

# Severity: CRITICAL

# Action: ADVISORY

1. **Isolation**:
   - Immediately verify Host Isolation (iptables/network group).
   - Ensure the host cannot communicate internally.

2. **Investigation**:
   - Capture memory dump for forensics.
   - identifying the parent process of the intrusion.
   - Check for lateral movement logs from this host.

3. **Remediation**:
   - Re-image the host from a known good state.
   - Do NOT attempt to clean the live infection manually.
   - Rotate all credentials (SSH keys, API tokens) present on the host.

4. **Restoration**:
   - Deploy clean image.
   - Monitor for 24 hours (Restricted Mode).
