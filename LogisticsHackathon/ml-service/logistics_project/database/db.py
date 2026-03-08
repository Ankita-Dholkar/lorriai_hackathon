import sqlite3
import os
from datetime import datetime

# DATABASE CONNECTION
# This file is in: lorri-ai-hackathon/logistics_project/database/db.py
# We want to use: lorri-ai-hackathon/database/logistics.db
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
# Two levels up to reach lorri-ai-hackathon root
DB_PATH = os.path.abspath(os.path.join(BASE_DIR, "..", "..", "database", "logistics.db"))

print(f"DEBUG: Using database at {DB_PATH}")

conn = sqlite3.connect(DB_PATH, check_same_thread=False)
cursor = conn.cursor()

# LR TABLE
cursor.execute("""
CREATE TABLE IF NOT EXISTS lorry_receipts (
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
""")
conn.commit()

# GENERATE LR NUMBER
def generate_lr():
    now = datetime.now()
    lr = "LR" + now.strftime("%Y%m%d%H%M%S")
    date = now.strftime("%Y-%m-%d")
    time = now.strftime("%H:%M:%S")
    return lr, date, time

# INSERT LR DATA
def insert_data(file_name, data, transport, text):
    try:
        lr, date, time = generate_lr()
        waiting = "0"
        loading = "0"
        detention = "0"

        columns = [
            "file_name", "transporter_name", "transporter_address", "transporter_contact",
            "consignor_name", "consignor_address", "consignor_gstin", "consignor_contact",
            "consignee_name", "consignee_address", "consignee_gstin", "consignee_contact",
            "vehicle_number", "driver_name", "driver_contact", "destination",
            "freight_charges", "other_charges", "total_charges", "freight_type",
            "special_instructions", "goods_type", "goods_description", "weight",
            "quantity", "goods_value", "lr_number", "date", "time",
            "waiting_charges", "loading_charges", "detention_charges", "raw_text"
        ]
        
        values = (
            file_name,
            data.get("transporter_name"), data.get("transporter_address"), data.get("transporter_contact"),
            data.get("consignor_name"), data.get("consignor_address"), data.get("consignor_gstin"), data.get("consignor_contact"),
            data.get("consignee_name"), data.get("consignee_address"), data.get("consignee_gstin"), data.get("consignee_contact"),
            transport.get("vehicle_number"), transport.get("driver_name"), transport.get("driver_contact"), transport.get("destination"),
            str(transport.get("freight_charges", "0")), str(transport.get("other_charges", "0")), str(transport.get("total_charges", "0")),
            transport.get("freight_type"), transport.get("special_instructions"),
            transport.get("goods_type"), transport.get("goods_description"),
            str(transport.get("weight", "0")), str(transport.get("quantity", "0")), str(transport.get("goods_value", "0")),
            lr, date, time,
            waiting, loading, detention,
            text
        )

        placeholders = ", ".join(["?" for _ in columns])
        query = f"INSERT INTO lorry_receipts ({', '.join(columns)}) VALUES ({placeholders})"
        
        cursor.execute(query, values)
        conn.commit()
        return lr
    except Exception as e:
        print(f"DB Error: {str(e)}")
        raise e