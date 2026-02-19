import sys
import os
import unittest

# Add root to sys.path
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '../..')))

from backend.orchestration.blast_radius_guard import BlastRadiusGuard
from backend.threat_model.threat_taxonomy import ThreatSeverity

class TestBlastRadius(unittest.TestCase):
    
    def test_tenant_wide_block(self):
        print("=== Test: Blast Radius Tenant Guard ===")
        
        # 1. Low Severity + Tenant Scope -> FAIL
        action = "BLOCK_TENANT_IP_RANGE"
        assessment = {
            "severity": ThreatSeverity.MEDIUM, # Not Critical!
            "blast_radius": "TENANT"
        }
        
        with self.assertRaises(ValueError) as cm:
            BlastRadiusGuard.validate_proposal(action, assessment)
        self.assertIn("requires CRITICAL severity", str(cm.exception))
        
        # 2. Critical Severity + Tenant Scope -> PASS
        assessment["severity"] = ThreatSeverity.CRITICAL
        try:
            BlastRadiusGuard.validate_proposal(action, assessment)
        except ValueError:
            self.fail("BlastGuard raised ValueError unexpectedly for CRITICAL tenant action")
            
        print(">>> PASS: Tenant-wide actions correctly gated.")

if __name__ == '__main__':
    unittest.main()
