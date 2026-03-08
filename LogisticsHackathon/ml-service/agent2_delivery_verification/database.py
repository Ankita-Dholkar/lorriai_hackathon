import sqlite3
import hashlib
import os

# ---------------- DATABASE INITIALIZATION ----------------
os.makedirs("database", exist_ok=True)

def get_conn():
    return sqlite3.connect("../database/logistics.db")

def init_db():
    conn = get_conn()
    cursor = conn.cursor()
    
    # POD TABLE
    cursor.execute("""
CREATE TABLE IF NOT EXISTS pod (
    pod_id INTEGER PRIMARY KEY AUTOINCREMENT,
    lr_number TEXT,
    transporter_name TEXT,
    vehicle_number TEXT,
    driver_name TEXT,
    delivery_address TEXT,
    contact_number TEXT,
    delivery_date TEXT,
    delivery_time TEXT,
    otp_verified BOOLEAN,
    gps_verified BOOLEAN,
    verification_status TEXT,
    latitude REAL,
    longitude REAL
)
""")

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

    conn.commit()
    conn.close()

# Database setup run karein
init_db()

# ---------------- FETCH LR DETAILS ----------------
def fetch_lr_details(lr_number):
    # Database se connect karein
    conn = sqlite3.connect("../database/logistics.db")
    cursor = conn.cursor()

    # Query execute karein
    try:
        cursor.execute("""
        SELECT transporter_name,
               vehicle_number,
               driver_name,
               destination,
               consignor_contact
        FROM lorry_receipts
        WHERE lr_number = ?
        """, (lr_number,))
        data = cursor.fetchone()
    except sqlite3.OperationalError:
        print("Table 'lorry_receipts' not found. Ensure DB is initialized.")
        data = None
    print("LR DATA FROM DB:", data)   # ← debugging

    # Connection close karna zaroori hai
    conn.close()

    # Agar data milta hai toh dictionary return karein
    if data:
        return {
            "transporter": data[0],
            "vehicle": data[1],
            "driver": data[2],
            "address": data[3],
            "phone": data[4]
        }

    # Agar record nahi milta toh None return karein
    return None


# ---------------- STORE POD ----------------
def store_pod(lr_number, delivery_date, delivery_time, otp_verified, gps_verified, latitude, longitude):
    lr_data = fetch_lr_details(lr_number)
    print("LR DATA:", lr_data)

    if not lr_data:
        return {"error": "LR not found"}

    conn = get_conn()
    cursor = conn.cursor()

    status = "VERIFIED" if (otp_verified and gps_verified) else "FAILED"

    cursor.execute("""
    INSERT INTO pod (
        lr_number, transporter_name, vehicle_number, driver_name,
        delivery_address, contact_number, delivery_date, delivery_time,
        otp_verified, gps_verified, verification_status, latitude, longitude
    )
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    """, (
        lr_number,
        lr_data["transporter"],
        lr_data["vehicle"],
        lr_data["driver"],
        lr_data["address"],
        lr_data["phone"],
        delivery_date,
        delivery_time,
        otp_verified,
        gps_verified,
        status,
        latitude,
        longitude
    ))

    conn.commit()
    conn.close()
    return {"message": "POD stored successfully"}

# ---------------- STORE MANUAL CHARGES ----------------
def store_manual_charges(lr_number, waiting_charges, loading_charges, unloading_charges, detention_charges):
    conn = sqlite3.connect("../database/logistics.db")
    cursor = conn.cursor()

    cursor.execute("""
    INSERT INTO manual_charges (
        lr_number, waiting_charges, loading_charges, unloading_charges, detention_charges
    )
    VALUES (?, ?, ?, ?, ?)
    """, (lr_number, waiting_charges, loading_charges, unloading_charges, detention_charges))

    conn.commit()
    conn.close()
    return {"message": "Manual charges stored successfully"}

# ---------------- DUPLICATE RECEIPT DETECTION ----------------
def check_and_store_receipt(lr_number, receipt_type, transaction_id, raw_text, amount, date):
    conn = sqlite3.connect("../database/logistics.db")
    cursor = conn.cursor()

    receipt_hash = hashlib.md5(raw_text.encode()).hexdigest()

    # check duplicate via transaction id
    if transaction_id:
        cursor.execute("SELECT id FROM receipts WHERE transaction_id=?", (transaction_id,))
        if cursor.fetchone():
            conn.close()
            return {"fraud_alert": "Duplicate receipt detected via Transaction ID"}

    # check duplicate via receipt hash
    cursor.execute("SELECT id FROM receipts WHERE receipt_hash=?", (receipt_hash,))
    if cursor.fetchone():
        conn.close()
        return {"fraud_alert": "Duplicate receipt detected via receipt text"}

    # store receipt
    cursor.execute("""
    INSERT INTO receipts (lr_number, receipt_type, transaction_id, receipt_hash, amount, date)
    VALUES (?, ?, ?, ?, ?, ?)
    """, (lr_number, receipt_type, transaction_id, receipt_hash, amount, date))

    conn.commit()
    conn.close()
    return {"status": "Receipt stored successfully"}


def generate_invoice(lr_number):

    conn = sqlite3.connect("../database/logistics.db")
    cursor = conn.cursor()

    # Fuel total
    cursor.execute("""
    SELECT amount FROM receipts
    WHERE lr_number=? AND LOWER(receipt_type)='fuel'
    """, (lr_number,))

    fuel_rows = cursor.fetchall()

    fuel_total = 0
    for row in fuel_rows:
        value = ''.join(filter(str.isdigit, row[0]))
        if value:
            fuel_total += int(value)

    # Toll total
    cursor.execute("""
    SELECT amount FROM receipts
    WHERE lr_number=? AND LOWER(receipt_type)='toll'
    """, (lr_number,))

    toll_rows = cursor.fetchall()

    toll_total = 0
    for row in toll_rows:
        value = ''.join(filter(str.isdigit, row[0]))
        if value:
            toll_total += int(value)

    # Manual charges
    cursor.execute("""
    SELECT waiting_charges,
           loading_charges,
           unloading_charges,
           detention_charges
    FROM manual_charges
    WHERE lr_number=?
    """, (lr_number,))

    manual_rows = cursor.fetchall()

    manual_total = 0

    for row in manual_rows:
        manual_total += sum([x for x in row if x])

    # Final amount
    final_amount = fuel_total + toll_total + manual_total

    # Store invoice
    cursor.execute("""
    INSERT INTO invoice (
        lr_number,
        fuel_total,
        toll_total,
        manual_total,
        final_amount
    )
    VALUES (?, ?, ?, ?, ?)
    """, (
        lr_number,
        fuel_total,
        toll_total,
        manual_total,
        final_amount
    ))

    conn.commit()
    conn.close()

    return {
        "lr_number": lr_number,
        "fuel_total": fuel_total,
        "toll_total": toll_total,
        "manual_total": manual_total,
        "final_amount": final_amount
    }


def calculate_carrier_payment(lr_number):

    conn = sqlite3.connect("../database/logistics.db")
    cursor = conn.cursor()

    # -------- Fuel --------
    cursor.execute("""
    SELECT amount FROM receipts
    WHERE lr_number=? AND LOWER(receipt_type)='fuel'
    """, (lr_number,))
    
    fuel_rows = cursor.fetchall()

    fuel_total = 0
    for row in fuel_rows:
        try:
            fuel_total += int(''.join(filter(str.isdigit, row[0])))
        except:
            pass

    # -------- Toll --------
    cursor.execute("""
    SELECT amount FROM receipts
    WHERE lr_number=? AND LOWER(receipt_type)='toll'
    """, (lr_number,))
    
    toll_rows = cursor.fetchall()

    toll_total = 0
    for row in toll_rows:
        try:
            toll_total += int(''.join(filter(str.isdigit, row[0])))
        except:
            pass

    # -------- Carrier Manual Charges --------
    cursor.execute("""
    SELECT waiting_charges,
           loading_charges,
           unloading_charges,
           detention_charges
    FROM manual_charges
    WHERE lr_number=?
    """, (lr_number,))

    row = cursor.fetchone()

    manual_total = 0
    waiting = loading = unloading = detention = 0

    if row:
        waiting = row[0] or 0
        loading = row[1] or 0
        unloading = row[2] or 0
        detention = row[3] or 0

        manual_total = waiting + loading + unloading + detention

    # -------- Final Payment --------
    carrier_payment = fuel_total + toll_total + manual_total

    conn.close()

    return {
        "fuel_cost": fuel_total,
        "toll_cost": toll_total,
        "waiting_charges": waiting,
        "loading_charges": loading,
        "unloading_charges": unloading,
        "detention_charges": detention,
        "manual_total": manual_total,
        "carrier_payment": carrier_payment
    }