import sys
import os
import unittest
from flask import Flask, jsonify

# Add root to sys.path
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '../..')))

from backend.middleware.platform_guard import PlatformGuard
from backend.api.security_platform_routes import security_bp
from backend.api.user_platform_routes import user_bp

class TestPlatformIsolation(unittest.TestCase):
    def setUp(self):
        self.app = Flask(__name__)
        self.app.register_blueprint(security_bp)
        self.app.register_blueprint(user_bp)
        self.client = self.app.test_client()

    def test_security_platform_access_denied(self):
        # Try accessing security API without header
        response = self.client.get('/platform/security/enforcement/proposals')
        self.assertEqual(response.status_code, 403)
        self.assertIn("PlatformIsolationViolation", response.get_json()["error"])

    def test_security_platform_access_allowed(self):
        # Try accessing security API WITH header
        response = self.client.get('/platform/security/enforcement/proposals', 
                                   headers={"X-Platform-Type": "SECURITY"})
        # Should be 200 (Empty list OK)
        self.assertEqual(response.status_code, 200)

    def test_user_platform_cross_access_denied(self):
        # Try sending USER header to SECURITY endpoint (should fail if we had strict role check, 
        # but middleware checks for equality to required type "SECURITY")
        response = self.client.get('/platform/security/enforcement/proposals', 
                                   headers={"X-Platform-Type": "USER"})
        self.assertEqual(response.status_code, 403)

    def test_user_platform_access_allowed(self):
        # Send event with correct header
        response = self.client.post('/platform/user/events/web', 
                                   json={"event": "data"},
                                   headers={"X-Platform-Type": "USER"})
        self.assertEqual(response.status_code, 200)

if __name__ == '__main__':
    unittest.main()
