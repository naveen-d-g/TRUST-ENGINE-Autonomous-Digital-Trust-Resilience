import sys
import os
import unittest
from dataclasses import asdict

sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '../..')))

from backend.threat_model.threat_analyzer import ThreatAnalyzer
from backend.threat_model.threat_taxonomy import ThreatSeverity
from backend.orchestration.execution_context import ExecutionContext

class TestCascadePrevention(unittest.TestCase):
    def test_shared_asset_block_requires_admin(self):
        print("=== Test: Cascade Prevention ===")
        
        # Context with shared asset (e.g. Corporate Proxy IP)
        ctx = ExecutionContext(session_id="shared_sess", risk_score=90)
        
        # Analyze "BLOCK_IP" on a generic/shared IP
        action = "BLOCK_IP"
        target = "192.168.1.1" # Mock shared
        
        assessment = ThreatAnalyzer.assess(action, target, ctx)
        
        print(f"Assessment: {assessment}")
        
        # Blast Radius check
        self.assertIsNotNone(assessment.blast_radius.shared_asset)
        
        # Logic: Shared Asset + Block = Potential Cascade
        # Threat Analyzer should flag this.
        # Note: In our simple stub, we assumed all BLOCK_IP on this IP triggered shared logic.
        
        self.assertEqual(assessment.required_approval_level, "ADMIN")
        print(">>> PASS: Admin approval enforced for Shared Asset Block.")

if __name__ == '__main__':
    unittest.main()
