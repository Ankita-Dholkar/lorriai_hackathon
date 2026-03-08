import sys
import os
import sqlite3

# ---------------- PROJECT ROOT KO PATH ME ADD KARO ----------------
# __file__ use kiya hai path nikalne ke liye
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from risk_engine import FraudRiskEngine
from dashboard.graphs import fraud_probability_graph, freight_comparison, risk_reason_graph

# ---------------- DATABASE PATH ----------------
DB_PATH = "../../database/logistics.db"

# ---------------- LOAD LR DATA ----------------
def load_lr_data(lr_number):
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()

    cursor.execute("""
    SELECT lr_number,
           freight_charges
    FROM lorry_receipts
    WHERE lr_number=?
    """, (lr_number,))

    row = cursor.fetchone()
    conn.close()

    if not row:
        raise Exception("LR not found")

    return {
        "lr_number": row[0],
        "freight": float(row[1])
    }

# ---------------- LOAD INVOICE DATA ----------------
def load_invoice_data(lr_number):
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()

    cursor.execute("""
    SELECT waiting_charges,
           loading_charges,
           unloading_charges,
           detention_charges
    FROM manual_charges
    WHERE lr_number=?
    """, (lr_number,))

    row = cursor.fetchone()
    conn.close()

    if not row:
        raise Exception("Manual charges not found")

    # None values ko zero se replace karke sum kiya gaya hai
    manual_total = sum([x if x else 0 for x in row])

    return {
        "lr_number": lr_number,
        "manual_total": manual_total  # 'freight' ki jagah 'manual_total' rakha hai clarity ke liye
    }

# ---------------- RUN FRAUD ENGINE ----------------
def run_agent3(lr_number):
    try:
        lr = load_lr_data(lr_number)
        invoice = load_invoice_data(lr_number)

        # Engine ko input data pass kar rahe hain
        engine = FraudRiskEngine(lr, invoice)
        result = engine.run()

        print("\n" + "="*30)
        print("Fraud Probability:", result["fraud_probability"], "%")
        print("Risk Level:", result["risk_level"])

        print("\nReasons:")
        for r in result["reasons"]:
            print("-", r)
        print("="*30)

        # Graphs trigger karna
        fraud_probability_graph(result["fraud_probability"])
        freight_comparison(lr["freight"], invoice["manual_total"])
        risk_reason_graph(result["reasons"])
        
    except Exception as e:
        print(f"Error: {e}")

# ---------------- MAIN ----------------
if __name__ == "__main__":
    lr_number = input("Enter LR Number: ")
    run_agent3(lr_number)