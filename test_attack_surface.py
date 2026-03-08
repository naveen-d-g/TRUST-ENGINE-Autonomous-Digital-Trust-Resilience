import urllib.request
import json

try:
    req = urllib.request.Request(
        "http://localhost:5000/api/v1/attack-surface/data", 
        headers={
            "X-API-Key": "dev-api-key",
            "X-Platform": "SECURITY_PLATFORM",
            "X-Role": "ADMIN"
        }
    )
    with urllib.request.urlopen(req) as response:
        data = response.read()
        print("HTTP STATUS:", response.status)
        parsed = json.loads(data)
        print("JSON KEYS:", list(parsed.keys()))
        if 'summary' in parsed:
            print("SUMMARY:", parsed['summary'])
        if 'ports' in parsed:
            print("NUM PORTS:", len(parsed['ports']))
except Exception as e:
    import urllib.error
    if isinstance(e, urllib.error.HTTPError):
        print("HTTP ERROR:", e.code, e.read().decode())
    else:
        print("ERROR:", e)
