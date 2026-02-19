from backend.db.models import Incident
from backend.incidents.enums import IncidentStatus, IncidentSeverity
from backend.extensions import db

class IncidentManager:
    @staticmethod
    def correlate(signal):
        """
        Rules:
        - Same session_id OR same actor_id within time window
        - If open incident exists → attach
        - Else create new incident
        """
        # Find open incident (mock logic for now as simplified in prompt)
        incident = Incident.query.filter(
            Incident.status == IncidentStatus.OPEN,
            Incident.tenant_id == signal.get("tenant_id")
        ).first()

        if not incident:
            incident = Incident(
                tenant_id=signal.get("tenant_id"),
                status=IncidentStatus.OPEN,
                severity=IncidentSeverity.MEDIUM # Baseline
            )
            db.session.add(incident)
            db.session.commit()
            print(f"[OK] Created new Incident: {incident.id}")
        
    @staticmethod
    def transition_state(incident_id, new_status):
        import uuid
        try:
            uuid.UUID(str(incident_id))
        except ValueError:
            return False

        from backend.incidents.lifecycle import transition_status
        incident = Incident.query.filter_by(id=incident_id).first()
        if not incident:
            return False
        transition_status(incident, new_status)
        db.session.commit()
        return True
