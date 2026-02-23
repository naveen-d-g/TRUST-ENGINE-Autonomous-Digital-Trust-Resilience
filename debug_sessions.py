import tempfile
from backend.services.observation_service import SessionStateEngine
from backend.app import create_app

app = create_app()
with app.app_context():
    for sid, state in SessionStateEngine._sessions.items():
        print(f"SID: {sid}")
        events = state.get("events", [])
        if events:
            latest = events[-1]
            print(f"  Latest raw_features: {latest.raw_features}")
        else:
            print("  No events.")
