import sqlite3

conn = sqlite3.connect("logistics.db")
cursor = conn.cursor()

# LORRY RECEIPTS TABLE (Unified)
cursor.execute("""
CREATE TABLE IF NOT EXISTS lorry_receipts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    lr_number TEXT UNIQUE,
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
    date TEXT,
    time TEXT,
    waiting_charges TEXT,
    loading_charges TEXT,
    detention_charges TEXT,
    raw_text TEXT
)
""")

# POD TABLE
cursor.execute("""
CREATE TABLE IF NOT EXISTS pod (
    pod_id INTEGER PRIMARY KEY AUTOINCREMENT,
    lr_number TEXT,
    delivery_date TEXT,
    delivery_time TEXT,
    otp_verified BOOLEAN,
    gps_verified BOOLEAN,
    verification_status TEXT,
    latitude REAL,
    longitude REAL
)
""")

# RECEIPTS TABLE
cursor.execute("""
CREATE TABLE IF NOT EXISTS receipts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    lr_number TEXT,
    receipt_type TEXT,
    transaction_id TEXT,
    receipt_hash TEXT,
    amount TEXT,
    date TEXT
)
""")

# MANUAL CHARGES TABLE
cursor.execute("""
CREATE TABLE IF NOT EXISTS manual_charges (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    lr_number TEXT,
    waiting_charges REAL,
    loading_charges REAL,
    unloading_charges REAL,
    detention_charges REAL
)
""")

# INVOICE TABLE
cursor.execute("""
CREATE TABLE IF NOT EXISTS invoice (
    invoice_id INTEGER PRIMARY KEY AUTOINCREMENT,
    lr_number TEXT,
    fuel_total REAL,
    toll_total REAL,
    manual_total REAL,
    final_amount REAL
)
""")

conn.commit()
conn.close()

print("Tables created successfully")