from flask import Flask, request, jsonify, session, redirect, url_for, render_template_string
import uuid
import datetime
from confluent_kafka import Producer
import json
import traceback
from flask_cors import CORS

app = Flask(__name__)
app.secret_key = "target-app-super-secret"
CORS(app) # Allow Trust Engine to call it if needed from frontend directly, though backend calls it.

# In-memory session registry for termination state
ACTIVE_SESSIONS = {}  # session_id -> "ACTIVE" | "TERMINATED"

import requests

# Trust Engine Config
TRUST_ENGINE_API_BASE = "http://localhost:5000/api/v1/ingest"

def send_event(domain: str, event_type: str, session_id: str, actor_id: str, payload: dict):
    # Prepare standard event envelope according to EventContract
    event_id = str(uuid.uuid4())
    correlation_id = str(uuid.uuid4())
    
    # ensure payload contains some expected fields if not provided
    payload["ip"] = request.remote_addr if request else "0.0.0.0"
    payload["route"] = request.path if request else "/"
    payload["method"] = request.method if request else "GET"
    payload["correlation_id"] = correlation_id
    if request:
        payload["user_agent"] = request.headers.get("User-Agent", "")

    tenant_id = "default"
    
    event = {
        "event_id": event_id,
        "session_id": session_id or "anonymous",
        "actor_id": actor_id or "anonymous",
        "event_type": event_type,  # ACTUAL event type, e.g., 'AUTH_LOGIN'
        "domain": domain,          # Keep domain tracking for routing
        "timestamp": datetime.datetime.now(datetime.timezone.utc).isoformat(),
        "source": "TARGET_APP_3001",
        "payload": payload
    }
    
    try:
        # Direct HTTP Ingestion
        endpoint = f"{TRUST_ENGINE_API_BASE}/{domain.lower() if domain.lower() in ['web', 'api', 'network', 'system'] else 'web'}"
        headers = {
            "Content-Type": "application/json",
            "X-API-Key": "dev-api-key",
            "X-Platform": "USER_PLATFORM",
            "X-Role": "VIEWER"
        }
        requests.post(endpoint, json=event, headers=headers, timeout=2.0)
    except Exception as e:
        print(f"Failed to transmit event to Trust Engine: {e}")

# Middleware to check termination state
@app.before_request
def check_termination():
    if request.path.startswith('/api/terminate'):
        return
        
    sess_id = session.get("session_id")
    if sess_id and ACTIVE_SESSIONS.get(sess_id) == "TERMINATED":
        # Keep the session ID so we know WHO to reset, but block all dashboard access
        if request.path not in ["/force_password_reset", "/logout", "/api/ping", "/api/keepalive"]:
            return redirect(url_for("force_password_reset"))

# ROUTES
@app.route("/login", methods=["GET", "POST"])
def login():
    import time
    if request.method == "POST":
        username = request.form.get("username")
        
        # Calculate real duration
        loaded_time_str = request.form.get("loaded_time")
        current_time_ms = int(time.time() * 1000)
        try:
            if loaded_time_str:
                login_duration_ms = current_time_ms - int(loaded_time_str)
            else:
                login_duration_ms = 120
        except ValueError:
            login_duration_ms = 120
            
        if login_duration_ms < 0:
            login_duration_ms = 120
            
        # generate a new session id
        sess_id = str(uuid.uuid4())
        session["session_id"] = sess_id
        session["actor_id"] = username
        ACTIVE_SESSIONS[sess_id] = "ACTIVE"
        
        send_event("WEB", "AUTH_LOGIN", sess_id, username, {
            "status_code": 200,
            "metrics": {"login_duration_ms": login_duration_ms},
            "attack_signature": None
        })
        return redirect(url_for("home"))
        
    # GET request
    html = f"""
    <html>
    <head><title>Target App Login</title>
    <style>
        body {{ font-family: sans-serif; background: #f0f2f5; display: flex; justify-content: center; align-items: center; height: 100vh; margin: 0;}}
        .card {{ background: white; padding: 2.5rem; border-radius: 12px; box-shadow: 0 10px 15px -3px rgba(0,0,0,0.1); width: 340px;}}
        input, button {{ width: 100%; padding: 12px; margin: 8px 0; box-sizing: border-box; border: 1px solid #ddd; border-radius: 6px; }}
        .captcha-box {{ background: #f9fafb; border: 1px dashed #cbd5e1; padding: 15px; border-radius: 6px; margin: 15px 0; display: flex; align-items: center; justify-content: space-between; font-size: 14px; color: #475569; }}
        .checkbox {{ width: 20px; height: 20px; margin: 0; cursor: pointer; }}
        button {{ background: #0f172a; color: white; border: none; cursor: pointer; font-weight: bold; margin-top: 10px; }}
        button:hover {{ background: #1e293b; }}
        h2 {{ margin-top: 0; color: #0f172a; }}
    </style>
    </head>
    <body>
    <div class="card">
        <h2>Target Application</h2>
        <p style="color: #64748b; font-size: 14px; margin-bottom: 20px;">Login to simulated environment</p>
        <form method="POST">
            <input type="hidden" name="loaded_time" value="{int(time.time() * 1000)}">
            <input type="text" name="username" value="demo_user" placeholder="Username" required><br>
            <input type="password" name="password" value="password" placeholder="Password" required><br>
            <div class="captcha-box">
                <div>
                   <input type="checkbox" id="captcha" name="captcha" class="checkbox" required>
                   <label for="captcha" style="margin-left: 8px; cursor: pointer;">I am not a robot</label>
                </div>
                <!-- Mock logo -->
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" stroke-width="2"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
            </div>
            <button type="submit">Login</button>
        </form>
    </div>
    </body>
    </html>
    """
    return render_template_string(html)

@app.route("/force_password_reset", methods=["GET", "POST"])
def force_password_reset():
    sess_id = session.get("session_id")
    actor_id = session.get("actor_id", "User")
    error_msg = ""
    
    if not sess_id or ACTIVE_SESSIONS.get(sess_id) != "TERMINATED":
        return redirect(url_for("login"))
        
    if request.method == "POST":
        new_password = request.form.get("new_password")
        if new_password == "password":
            error_msg = "<div style='color: #ef4444; background: rgba(220,38,38,0.1); padding: 10px; border-radius: 6px; margin-bottom: 15px; border: 1px solid #ef4444;'>Error: New password cannot be the same as the old password.</div>"
        else:
            # In a real app, update the DB here.
            # Clear the terminated session, force them to log back in with new credentials.
            ACTIVE_SESSIONS.pop(sess_id, None)
            session.clear()
            return redirect(url_for("login"))
        
    html = f"""
    <html>
    <head><title>SECURITY ALERT: Change Password</title>
    <style>
        body {{ font-family: sans-serif; background: #0f172a; display: flex; justify-content: center; align-items: center; height: 100vh; margin: 0; color: white;}}
        .card {{ background: #1e293b; padding: 2.5rem; border-radius: 12px; box-shadow: 0 20px 25px -5px rgba(0,0,0,0.5); width: 450px; border: 1px solid #dc2626;}}
        input, button {{ width: 100%; padding: 12px; margin: 8px 0; box-sizing: border-box; border: 1px solid #334155; border-radius: 6px; background: #0f172a; color: white;}}
        button {{ background: #dc2626; color: white; border: none; cursor: pointer; font-weight: bold; margin-top: 20px; text-transform: uppercase; letter-spacing: 1px;}}
        button:hover {{ background: #b91c1c; }}
        h2 {{ margin-top: 0; color: #ef4444; display: flex; align-items: center; gap: 10px;}}
        .alert-box {{ background: rgba(220, 38, 38, 0.1); border: 1px solid rgba(220, 38, 38, 0.3); padding: 15px; border-radius: 6px; font-size: 14px; line-height: 1.5; color: #fca5a5; margin-bottom: 20px;}}
    </style>
    </head>
    <body>
    <div class="card">
        <h2>⚠️ ACCOUNT COMPROMISED</h2>
        <div class="alert-box">
            <strong>Security Incident Detected!</strong><br><br>
            The Automated Trust Engine intercepted a malicious attack originating from your active session.<br><br>
            To prevent further unauthorized access, your session ({sess_id}) was instantly permanently terminated (Quarantined) by the SOC.<br><br>
            You MUST change your password immediately before you can log in again.
        </div>
        {error_msg}
        <form method="POST">
            <input type="password" name="new_password" placeholder="New Secure Password" required minlength="8"><br>
            <input type="password" name="confirm_password" placeholder="Confirm Password" required minlength="8"><br>
            <button type="submit">Update Password & Login</button>
        </form>
    </div>
    </body>
    </html>
    """
    return render_template_string(html)

@app.route("/")
def index():
    sess_id = session.get("session_id")
    if sess_id and ACTIVE_SESSIONS.get(sess_id) == "ACTIVE":
        return redirect(url_for("home"))
    return redirect(url_for("login"))

@app.route("/home", methods=["GET", "POST"])
def home():
    sess_id = session.get("session_id")
    actor_id = session.get("actor_id")
    if not sess_id or ACTIVE_SESSIONS.get(sess_id) == "TERMINATED":
        return redirect(url_for("login"))
        
    send_event("WEB", "API_CALL", sess_id, actor_id, {
        "status_code": 200,
        "metrics": {"render_ms": 45}
    })
    
    if request.method == "POST":
        # Handle the new dummy form submission on the dashboard
        data_field = request.form.get("data_field", "")
        
        send_event("WEB", "FORM_SUBMIT", sess_id, actor_id, {
            "status_code": 200,
            "metrics": {"submission_time_ms": 50},
            "form_data": data_field,
            "route": "/home"
        })
        
    html = f"""
    <html>
    <head><title>Home</title>
    <style>
        body {{ font-family: sans-serif; background: #f0f2f5; margin: 0; padding: 0; }}
        .navbar {{ background: #0f172a; padding: 1rem 2rem; display: flex; justify-content: space-between; align-items: center; color: white; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1); }}
        .nav-links a {{ color: #cbd5e1; text-decoration: none; margin-right: 20px; font-weight: 500; font-size: 15px; padding: 8px 12px; border-radius: 4px; transition: all 0.2s; }}
        .nav-links a:hover, .nav-links a.active {{ background: #1e293b; color: white; }}
        .logout-btn {{ color: #ef4444; text-decoration: none; font-weight: 600; padding: 8px 16px; border: 1px solid #ef4444; border-radius: 4px; transition: all 0.2s; }}
        .logout-btn:hover {{ background: rgba(239, 68, 68, 0.1); }}
        
        .content {{ padding: 2rem; max-width: 1000px; margin: 0 auto; }}
        .card {{ background: white; padding: 2rem; border-radius: 8px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); margin-bottom: 1rem; }}
        
        button.submit {{ background: #38bdf8; color: #0f172a; border: none; font-weight: bold; padding: 12px 20px; border-radius: 4px; margin-top: 15px; cursor: pointer; transition: all 0.2s; }}
        button.submit:hover {{ background: #0ea5e9; }}
        
        .form-section {{ margin-top: 10px; padding: 20px; background: #f8fafc; border: 1px dashed #cbd5e1; border-radius: 6px; }}
        input[type="text"] {{ width: 100%; padding: 12px; margin-top: 8px; border: 1px solid #cbd5e1; border-radius: 6px; box-sizing: border-box; }}
        .badge {{ background: #10b981; color: white; padding: 4px 8px; border-radius: 4px; font-size: 12px; font-weight: bold; }}
    </style>
    </head>
    <body>
    
    <div class="navbar">
        <div style="font-weight: bold; font-size: 18px;">Acme Corp <span style="font-weight: normal; color: #94a3b8; margin-left:10px;">| Internal Gateway</span></div>
        <div class="nav-links">
            <a href="/home" class="active">Home</a>
            <a href="/dashboard">Dashboard</a>
        </div>
        <div>
            <span style="margin-right: 15px; color: #94a3b8; font-size: 14px;">Logged in: <strong style="color:white;">{actor_id}</strong></span>
            <a href="/logout" class="logout-btn">Logout</a>
        </div>
    </div>

    <div class="content">
        <div class="card">
            <div style="display:flex; justify-content:space-between; align-items:center;">
               <h2 style="margin:0;">Welcome Home, {actor_id}</h2>
               <span class="badge">Session Active</span>
            </div>
            <p style="color:#64748b; margin-top:10px;">Please enter your daily payload metrics below for processing.</p>
            
            <div class="form-section">
                <p style="margin-top:0;"><strong>Secure Data Entry</strong></p>
                <form method="POST" action="/home">
                    <label style="font-size:14px; color:#475569; font-weight:600;">Sensitive Data Field</label>
                    <input type="text" name="data_field" placeholder="Enter sensitive alphanumeric data payload..." required />
                    <button type="submit" class="submit">Save Data to Systems</button>
                    <p style="font-size:12px; color:#94a3b8; margin-top:10px; margin-bottom:0;">Submitting this form immediately fires an event to the Trust Engine.</p>
                </form>
            </div>
        </div>
    </div>
    
    <script>
    setInterval(() => {{
        fetch('/api/keepalive').catch(e=>console.error(e));
        // Also check if we got kicked out by checking a simple endpoint
        fetch('/api/ping').then(r=>{{
            if(r.status === 403) window.location.reload();
        }});
    }}, 1000);
    </script>
    </body>
    </html>
    """
    return render_template_string(html)

@app.route("/dashboard")
def dashboard():
    sess_id = session.get("session_id")
    actor_id = session.get("actor_id")
    if not sess_id or ACTIVE_SESSIONS.get(sess_id) == "TERMINATED":
        return redirect(url_for("login"))
        
    send_event("WEB", "API_CALL", sess_id, actor_id, {
        "status_code": 200,
        "metrics": {"render_ms": 45}
    })
        
    html = f"""
    <html>
    <head><title>Dashboard</title>
    <style>
        body {{ font-family: sans-serif; background: #f0f2f5; margin: 0; padding: 0; }}
        .navbar {{ background: #0f172a; padding: 1rem 2rem; display: flex; justify-content: space-between; align-items: center; color: white; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1); }}
        .nav-links a {{ color: #cbd5e1; text-decoration: none; margin-right: 20px; font-weight: 500; font-size: 15px; padding: 8px 12px; border-radius: 4px; transition: all 0.2s; }}
        .nav-links a:hover, .nav-links a.active {{ background: #1e293b; color: white; }}
        .logout-btn {{ color: #ef4444; text-decoration: none; font-weight: 600; padding: 8px 16px; border: 1px solid #ef4444; border-radius: 4px; transition: all 0.2s; }}
        .logout-btn:hover {{ background: rgba(239, 68, 68, 0.1); }}
        
        .content {{ padding: 2rem; max-width: 1000px; margin: 0 auto; }}
        .card {{ background: white; padding: 2rem; border-radius: 8px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); margin-bottom: 1rem; }}
        button {{ padding: 10px 15px; margin-right: 10px; cursor: pointer; background: #e0e0e0; border: 1px solid #ccc; border-radius: 4px; font-weight:bold;}}
        button.danger {{ background: #ff4d4f; color: white; border: none; }}
        #log {{ background: #222; color: #0f0; padding: 15px; font-family: monospace; height: 200px; overflow-y: scroll; border-radius: 6px; margin-top: 1rem; box-shadow: inset 0 2px 4px rgba(0,0,0,0.5);}}
    </style>
    </head>
    <body>
    <div class="navbar">
        <div style="font-weight: bold; font-size: 18px;">Acme Corp <span style="font-weight: normal; color: #94a3b8; margin-left:10px;">| Internal Gateway</span></div>
        <div class="nav-links">
            <a href="/home">Home</a>
            <a href="/dashboard" class="active">Dashboard</a>
        </div>
        <div>
            <span style="margin-right: 15px; color: #94a3b8; font-size: 14px;">Logged in: <strong style="color:white;">{actor_id}</strong></span>
            <a href="/logout" class="logout-btn">Logout</a>
        </div>
    </div>
    
    <div class="content">
        <div class="card">
            <h2>System Diagnostics Dashboard</h2>
            <p style="color:#64748b; margin-bottom:20px;">Use the controls below to verify backend telemetry and simulate security triggers. (Session ID: <code>{sess_id}</code>)</p>
            <div style="margin-bottom:20px;">
                <button onclick="triggerAPI()">Trigger API Call</button>
                <button onclick="triggerAttack()" class="danger">Simulate Attack</button>
            </div>
            
            <div id="log">Event Log initialized...<br></div>
        </div>
    </div>
    <script>
    function logMsg(msg) {{
        const log = document.getElementById('log');
        const now = new Date().toLocaleTimeString();
        log.innerHTML += '[' + now + '] > ' + msg + '<br>';
        log.scrollTop = log.scrollHeight;
    }}
    function triggerAPI() {{
        logMsg('Initiating generic API call...');
        fetch('/api/data').then(r=>r.json()).then(d=>logMsg('<span style="color:#818cf8">API Error Success: ' + JSON.stringify(d) + '</span>')).catch(e=>logMsg('<span style="color:#f87171">API Error: ' + e + '</span>'));
    }}
    function triggerAttack() {{
        logMsg('<span style="color:#fbbf24">Simulating malicious attack vector...</span>');
        fetch('/simulate_attack').then(r=>r.json()).then(d=>logMsg('<span style="color:#4ade80">Attack Telemetry Sent: ' + JSON.stringify(d) + '</span>')).catch(e=>logMsg('<span style="color:#f87171">Attack Simulation Error: ' + e + '</span>'));
    }}
    setInterval(() => {{
        fetch('/api/keepalive').catch(e=>console.error(e));
        // Also check if we got kicked out by checking a simple endpoint
        fetch('/api/ping').then(r=>{{
            if(r.status === 403) window.location.reload();
        }});
    }}, 1000);
    </script>
    </body>
    </html>
    """
    return render_template_string(html)

@app.route("/logout")
def logout():
    sess_id = session.get("session_id")
    actor_id = session.get("actor_id", "Unknown")
    
    if sess_id:
        # Broadcast logout signal to SOC
        send_event("AUTH", "AUTH_LOGOUT", sess_id, actor_id, {
            "status_code": 200,
            "metrics": {},
            "final_decision": "TERMINATE" # Signal that the session is officially over
        })
        ACTIVE_SESSIONS.pop(sess_id, None)
        
    session.clear()
    return redirect(url_for("login"))

@app.route("/api/data")
def api_data():
    sess_id = session.get("session_id")
    actor_id = session.get("actor_id")
    send_event("API", "API_CALL", sess_id, actor_id, {
        "status_code": 200,
        "metrics": {"query_ms": 15},
        "query": "SELECT * from sensitive_data",
        "risk_score": 2.5,
        "final_decision": "ALLOW"
    })
    return jsonify({"data": "sensitive_info", "status": "success"})

@app.route("/simulate_attack")
def simulate_attack():
    sess_id = session.get("session_id")
    actor_id = session.get("actor_id")
    send_event("NETWORK", "SYSTEM_ERROR", sess_id, actor_id, {
        "status_code": 403,
        "metrics": {"packet_size": 1500},
        "attack_signature": "SQL_INJECTION_ATTEMPT",
        "severity": "CRITICAL",
        "risk_score": 85.5,
        "final_decision": "RESTRICT"
    })
    send_event("API", "API_CALL", sess_id, actor_id, {
        "status_code": 403,
        "attack_signature": "DATA_EXFILTRATION_PATTERN",
        "severity": "CRITICAL",
        "risk_score": 98.9,
        "final_decision": "ESCALATE"
    })
    return jsonify({"status": "attack simulated"})

@app.route("/api/ping")
def ping():
    sess_id = session.get("session_id")
    if sess_id and ACTIVE_SESSIONS.get(sess_id) == "TERMINATED":
        return jsonify({"status": "terminated"}), 403
    return jsonify({"status": "ok"})

@app.route("/api/keepalive")
def keepalive():
    sess_id = session.get("session_id", "anon")
    actor_id = session.get("actor_id", "anon")
    
    if sess_id and ACTIVE_SESSIONS.get(sess_id) == "TERMINATED":
        return jsonify({"status": "terminated"}), 403
        
    send_event("SYSTEM", "API_CALL", sess_id, actor_id, {
        "status_code": 200,
        "metrics": {"cpu_usage_percent": 12, "memory_mb": 256}
    })
    return jsonify({"status": "ok"})


# ENFORCEMENT HOOK (Trust Engine calls this)
@app.route("/api/terminate", methods=["POST"])
def terminate_session():
    data = request.json or {}
    sess_id = data.get("session_id")
    if not sess_id:
        return jsonify({"status": "error", "message": "Missing session_id"}), 400
        
    if sess_id in ACTIVE_SESSIONS:
        ACTIVE_SESSIONS[sess_id] = "TERMINATED"
        print(f"🚨 TERMINATED SESSION {sess_id} via Webhook!")
        return jsonify({"status": "success", "message": f"Session {sess_id} terminated"}), 200
        
    return jsonify({"status": "ignored", "message": "Session not found"}), 404

if __name__ == "__main__":
    app.run(port=3001, debug=True)
