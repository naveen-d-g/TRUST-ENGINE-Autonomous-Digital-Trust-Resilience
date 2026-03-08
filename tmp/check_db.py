import sqlite3
import os

db_path = r"e:\project\backend\instance\trust_engine.db"
if os.path.exists(db_path):
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()
    cursor.execute("SELECT id, hash, prev_hash FROM audit_logs ORDER BY created_at DESC LIMIT 5;")
    rows = cursor.fetchall()
    for row in rows:
        print(f"ID: {row[0]} | Hash: {row[1][:10]}... | Prev: {row[2][:10]}...")
    conn.close()
else:
    print("DB not found")
