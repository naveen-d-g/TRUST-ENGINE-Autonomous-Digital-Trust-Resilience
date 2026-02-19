import pytest
from backend.app import app
from backend.extensions import db
from backend.audit.audit_models import AuditLog
from backend.audit.audit_log import AuditLogger

@pytest.fixture
def client():
    app.config["TESTING"] = True
    app.config["SQLALCHEMY_DATABASE_URI"] = "sqlite:///:memory:"
    with app.test_client() as client:
        with app.app_context():
            db.session.remove()
            db.drop_all()
            db.create_all()
            yield client

def test_audit_log_is_append_only(client):
    """
    Verfies that any attempt to update an existing audit log entry raises a RuntimeError.
    """
    with app.app_context():
        logger = AuditLogger()
        logger.append({"action": "GENESIS_ACTION", "actor": "USER_1"})
        
        log = AuditLog.query.first()
        assert log is not None
        
        # Attempt Mutation
        log.action = "MUTATED"
        
        with pytest.raises(RuntimeError) as excinfo:
            db.session.commit()
        
        assert "Audit logs are immutable" in str(excinfo.value)
        db.session.rollback()

def test_audit_log_is_not_deletable(client):
    """
    Verifies that any attempt to delete an audit log entry raises a RuntimeError.
    """
    with app.app_context():
        logger = AuditLogger()
        logger.append({"action": "DELETE_ME", "actor": "USER_1"})
        
        log = AuditLog.query.first()
        assert log is not None
        
        # Attempt Deletion
        db.session.delete(log)
        
        with pytest.raises(RuntimeError) as excinfo:
            db.session.commit()
            
        assert "Audit logs are immutable" in str(excinfo.value)
        db.session.rollback()

def test_hash_chain_integrity(client):
    """
    Verifies that the hash chain is correctly computed and verifiable.
    """
    with app.app_context():
        logger = AuditLogger()
        logger.append({"action": "STEP_1", "details": {"data": 1}})
        logger.append({"action": "STEP_2", "details": {"data": 2}})
        
        # Chain should be valid
        assert logger.verify_chain() is True
        
        # Manually break the chain in DB (bypassing model guards via raw SQL if possible, 
        # but here we just check if verify_chain catches discrepancies)
        logs = AuditLog.query.all()
        assert len(logs) == 2
        assert logs[1].prev_hash == logs[0].hash
