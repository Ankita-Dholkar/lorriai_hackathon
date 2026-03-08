import sqlite3
import os

# Path to the root database
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
# Note: This script is in logistics_project. Root DB is at lorri-ai-hackathon/database/logistics.db
DB_PATH = os.path.abspath(os.path.join(BASE_DIR, "..", "database", "logistics.db"))

print(f"Inspecting DB at: {DB_PATH}")

try:
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    
    # Check table existence
    cursor.execute("SELECT name FROM sqlite_master WHERE type='table' AND name='lorry_receipts'")
    if not cursor.fetchone():
        print("Table 'lorry_receipts' DOES NOT EXIST in this database.")
    else:
        # Get columns
        cursor.execute("PRAGMA table_info(lorry_receipts)")
        columns = cursor.fetchall()
        print(f"Table 'lorry_receipts' exists with {len(columns)} columns:")
        for col in columns:
            print(f" - {col[1]} ({col[2]})")
            
    conn.close()
except Exception as e:
    print(f"Error: {e}")
