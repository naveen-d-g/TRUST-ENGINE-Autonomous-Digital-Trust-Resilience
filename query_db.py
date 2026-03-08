import psycopg2
import json

conn = psycopg2.connect("postgresql://postgres:Naveen%40123@localhost:5432/trust_platform")
cursor = conn.cursor()

print("\n--- RECENT EVENTS ---")
cursor.execute("SELECT event_type, session_id, payload, timestamp FROM events ORDER BY timestamp DESC LIMIT 15;")
events = cursor.fetchall()

for evt in events:
    print(f"[{evt[3]}] {evt[0]} (Session: {evt[1]})")
    payload = evt[2]
    if isinstance(payload, str):
        payload = json.loads(payload)
    if 'metrics' in payload:
        print(f"  Metrics: {payload.get('metrics')}")
    if 'raw_features' in payload:
        print(f"  Raw: {payload.get('raw_features')}")
