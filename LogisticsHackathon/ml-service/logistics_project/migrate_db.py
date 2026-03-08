import sqlite3
import os

# Base path: lorri-ai-hackathon/logistics_project/migrate_db.py
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
# Root DB: lorri-ai-hackathon/database/logistics.db
DB_PATH = os.path.abspath(os.path.join(BASE_DIR, "..", "database", "logistics.db"))

print(f"Migrating DB at: {DB_PATH}")

schema = """
CREATE TABLE lorry_receipts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    file_name TEXT,
    transporter_name TEXT,
    transporter_address TEXT,
    transporter_contact TEXT,
    consignor_name TEXT,
    consignor_address TEXT,
    consignor_gstin TEXT,
    consignor_contact TEXT,
    consignee_name TEXT,
    consignee_address TEXT,
    consignee_gstin TEXT,
    consignee_contact TEXT,
    vehicle_number TEXT,
    driver_name TEXT,
    driver_contact TEXT,
    destination TEXT,
    freight_charges TEXT,
    other_charges TEXT,
    total_charges TEXT,
    freight_type TEXT,
    special_instructions TEXT,
    goods_type TEXT,
    goods_description TEXT,
    weight TEXT,
    quantity TEXT,
    goods_value TEXT,
    lr_number TEXT UNIQUE,
    date TEXT,
    time TEXT,
    waiting_charges TEXT,
    loading_charges TEXT,
    detention_charges TEXT,
    raw_text TEXT
)
"""

try:
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    
    print("Dropping old table 'lorry_receipts'...")
    cursor.execute("DROP TABLE IF EXISTS lorry_receipts")
    
    print("Creating new table with 34 columns...")
    cursor.execute(schema)
    
    conn.commit()
    print("Migration SUCCESSFUL!")
    conn.close()
except Exception as e:
    print(f"Migration FAILED: {e}")
