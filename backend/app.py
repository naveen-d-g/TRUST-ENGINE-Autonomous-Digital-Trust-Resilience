from flask import Flask, request, abort, jsonify
from dotenv import load_dotenv
import os
import sys

# Load environment variables from .env file
load_dotenv()

# Add project root to sys.path to allow absolute imports of 'backend'
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

# Load env before importing config
load_dotenv(os.path.abspath(os.path.join(os.path.dirname(__file__), '../.env')))

from backend.config import Config
from backend.extensions import db, cors, limiter, socketio
from backend.auth.middleware import auth_middleware
from backend.models.user import User
from backend.models.session import Session
from backend.models.session_metric import SessionMetric
from backend.models.event import Event
from backend.db.models import Incident
from backend.audit.models import AuditLog
from backend.security.password import hash_password
from backend.middleware.security_logger import init_security_logger

def ensure_admin():
    admin = User.query.filter_by(email="dghere@admin").first()
    if not admin:
        admin = User(
            email="dghere@admin",
            username="admin", 
            platform="LOCAL",
            password_hash=hash_password("dghere"),
            role="ADMIN"
        )
        db.session.add(admin)
        db.session.commit()
        print("[OK] Admin user 'dghere@admin' created")
    
    # Seed sess-attack for demonstration
    if not Session.query.filter_by(session_id="sess-attack").first():
        s_attack = Session(
            session_id="sess-attack",
            user_id="user-attack-sim",
            trust_score=15.5,
            final_decision="REJECT",
            primary_cause="Simulation Attack",
            ip_address="1.2.3.4"
        )
        db.session.add(s_attack)
        from backend.models.session_metric import SessionMetric
        m_attack = SessionMetric(
            session_id="sess-attack",
            attack_probability=0.92,
            risk_score=84.5
        )
        db.session.add(m_attack)
        db.session.commit()
        print("[OK] Seeded 'sess-attack' session")

def create_app(config_class=Config):
    """
    Flask Application Factory for SOC Platform (V2).
    """
    app = Flask(__name__)
    app.config.from_object(config_class)

    # Initialize Extensions
    db.init_app(app)
    
    # 🔒 BLOCKER #0: PostgreSQL Connection Check at Boot
    from sqlalchemy import text
    with app.app_context():
        try:
            db.create_all() # Ensure tables exist
            db.session.execute(text("SELECT 1"))
            ensure_admin()
            print("[OK] PostgreSQL connection established and admin ensured")
        except Exception as e:
            raise RuntimeError(f"[FATAL] PostgreSQL unreachable: {e}")

    # Allow all origins for development, and ensure all /api paths are covered
    cors.init_app(app, resources={
        r"/api/*": {"origins": "*"},
        r"/api/v1/*": {"origins": "*"},
        r"/socket.io/*": {"origins": "*"}
    }, allow_headers=["Content-Type", "Authorization", "X-API-Key", "X-Platform", "X-Role", "X-Tenant-ID"], 
       methods=["GET", "POST", "OPTIONS", "PUT", "DELETE", "PATCH"])
    limiter.init_app(app)

    # Register Auth Middleware
    auth_middleware(app)

    # Initialize Security Logger
    init_security_logger(app)

    # Register Blueprints
    from backend.api.soc_routes import bp as soc_bp
    from backend.api.batch_routes import batch_bp
    from backend.api.read_routes import read_bp
    from backend.ingestion.ingestion_routes import ingestion_bp
    from backend.routes.simulation_routes import simulation_bp
    from backend.routes.metrics_routes import metrics_bp
    from backend.routes.dashboard_routes import dashboard_bp
    from backend.auth.auth_routes import auth_bp
    from backend.routes.live_routes import live_bp
    from backend.api.session_routes import session_bp
    from backend.api.monitoring_routes import monitoring_bp
    from backend.api.enforcement_routes import enforcement_bp
    from backend.routes.trust_routes import trust_bp
    
    app.register_blueprint(soc_bp, url_prefix="/api/v1/soc")
    app.register_blueprint(batch_bp, url_prefix="/api/v1/batch")
    app.register_blueprint(read_bp, url_prefix="/api/v1/read")
    app.register_blueprint(ingestion_bp, url_prefix="/api/v1/ingest")
    app.register_blueprint(auth_bp, url_prefix="/api/v1/auth")
    app.register_blueprint(simulation_bp, url_prefix="/api/v1/simulate")
    app.register_blueprint(metrics_bp, url_prefix="/api/v1/metrics")
    app.register_blueprint(dashboard_bp, url_prefix="/api/v1/dashboard")
    app.register_blueprint(live_bp, url_prefix="/api/v1/live")
    app.register_blueprint(session_bp, url_prefix="/api/v1/sessions")
    app.register_blueprint(monitoring_bp, url_prefix="/api/v1/monitoring")
    app.register_blueprint(enforcement_bp, url_prefix="/api/v1/enforcement")
    app.register_blueprint(trust_bp, url_prefix="/api/v1/trust")
    
    # 💥 DOMAIN KAFKA CONSUMER
    try:
        from backend.ingestion.domain_kafka_consumer import start_domain_consumer
        start_domain_consumer()
        print("[OK] Domain Kafka Consumer started")
    except ImportError:
        print("[WARN] confluent_kafka not installed, domain_kafka_consumer skipped.")

    
    @app.route("/")
    def index():
        return {"status": "ok", "message": "SOC Platform V2 API Home"}

    @app.route("/api/health")
    def health_check():
        return {"status": "ok", "version": "v2-bootstrapped"}

    @app.errorhandler(400)
    def bad_request(e):
        return jsonify(error=str(e.description)), 400

    @app.errorhandler(401)
    def unauthorized(e):
        return jsonify(error=str(e.description)), 401

    @app.errorhandler(403)
    def forbidden(e):
        return jsonify(error=str(e.description)), 403

    # Initialize Extensions (SocketIO only, db is already init)
    # db.init_app(app) <- Removed duplicate
    socketio.init_app(app) # Initialize SocketIO

    # ... (rest of the file) ...

    return app

app = create_app()

if __name__ == "__main__":
    # Support concurrent SSE streams and REST API calls
    socketio.run(app, host="0.0.0.0", port=5000, debug=True, allow_unsafe_werkzeug=True)
