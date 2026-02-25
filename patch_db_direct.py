import sys
import os
from dotenv import load_dotenv

sys.path.append(os.path.abspath(os.path.dirname(__file__)))
load_dotenv(os.path.join(os.path.dirname(__file__), '.env'))

import psycopg2
db_url = os.environ.get('DATABASE_URL')
if not db_url:
    print("ERROR: DATABASE_URL not found in environment.")
    sys.exit(1)

print("Connecting to:", db_url)

conn = psycopg2.connect(db_url)
conn.autocommit = True
cur = conn.cursor()

try:
    cur.execute("ALTER TABLE users ADD COLUMN password_reset_required BOOLEAN DEFAULT FALSE;")
    print("users added")
except Exception as e:
    print("users error:", e)

try:
    cur.execute("ALTER TABLE sessions ADD COLUMN bot_detected BOOLEAN DEFAULT FALSE;")
    print("bot_detected added")
except Exception as e:
    print("bot_detected error:", e)

try:
    cur.execute("ALTER TABLE sessions ADD COLUMN bot_reason TEXT;")
    print("bot_reason added")
except Exception as e:
    print("bot_reason error:", e)

cur.close()
conn.close()
print("DB migration complete.")
