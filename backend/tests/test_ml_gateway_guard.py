from backend.session.snapshot import SessionSnapshot
from backend.ml.inference_adapter import evaluate_session
from uuid import UUID

def test_snapshot_allowed():
    snap = SessionSnapshot(
        session_id=UUID("11111111-1111-1111-1111-111111111111"),
        event_count=3,
        domains_seen=["WEB"],
        first_seen="2026-02-10T10:00:00Z",
        last_seen="2026-02-10T10:05:00Z"
    )

    result = evaluate_session(snap)
    assert "risk_score" in result
    assert result["session_id"] == "11111111-1111-1111-1111-111111111111"
