import os
import re
from fastapi import FastAPI, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from otp_service import generate_otp, verify_otp
from gps_service import verify_gps
from database import store_pod, store_manual_charges
from receipt_verification import extract_receipt_data
from receipt_verification import extract_receipt_data, extract_transaction_id
from database import check_and_store_receipt
from database import generate_invoice
from database import calculate_carrier_payment

# Create uploads folder automatically if not present
os.makedirs("uploads", exist_ok=True)

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def home():
    return {"message": "Agent 2 Running"}

# ---------------- OTP SYSTEM ----------------
@app.post("/generate-otp")
def generate(lr_number: str, receiver_contact: str = None):
    otp = generate_otp(lr_number, receiver_contact)
    return {
        "lr_number": lr_number,
        "generated_otp": otp
    }

@app.post("/verify-otp")
def verify(lr_number: str, entered_otp: int):
    result = verify_otp(lr_number, entered_otp)
    if result:
        return {"delivery_verification": "SUCCESS"}
    return {"delivery_verification": "FAILED"}

# ---------------- GPS VERIFICATION ----------------
@app.post("/verify-gps")
def gps_check(
    delivery_lat: float,
    delivery_lon: float,
    carrier_lat: float,
    carrier_lon: float
):
    result = verify_gps(
        delivery_lat,
        delivery_lon,
        carrier_lat,
        carrier_lon
    )
    return result

# ---------------- POD STORAGE ----------------
@app.post("/store-pod")
def store_pod_api(
    lr_number: str,
    delivery_date: str,
    delivery_time: str,
    otp_verified: bool,
    gps_verified: bool,
    latitude: float,
    longitude: float
):
    store_pod(
        lr_number,
        delivery_date,
        delivery_time,
        otp_verified,
        gps_verified,
        latitude,
        longitude
    )
    return {
        "message": "POD Stored Successfully"
    }

# ---------------- FUEL RECEIPT OCR ----------------
@app.post("/upload-fuel-receipt")
async def upload_fuel_receipt(lr_number: str, file: UploadFile = File(...)):

    file_location = f"uploads/{file.filename}"

    with open(file_location, "wb") as buffer:
        buffer.write(await file.read())

    data = extract_receipt_data(file_location)

    transaction_id = extract_transaction_id(data["raw_text"])

    result = check_and_store_receipt(
        lr_number,
        "fuel",
        transaction_id,
        data["raw_text"],
        data["amount"],
        data["date"]
    )

    return {
        "receipt_data": data,
        "duplicate_check": result
    }

# ---------------- TOLL RECEIPT OCR ----------------
@app.post("/upload-toll-receipt")
async def upload_toll_receipt(lr_number: str, file: UploadFile = File(...)):

    file_location = f"uploads/{file.filename}"

    with open(file_location, "wb") as buffer:
        buffer.write(await file.read())

    data = extract_receipt_data(file_location)

    transaction_id = extract_transaction_id(data["raw_text"])

    result = check_and_store_receipt(
        lr_number,
        "toll",
        transaction_id,
        data["raw_text"],
        data["amount"],
        data["date"]
    )

    return {
        "receipt_data": data,
        "duplicate_check": result
    }

# ---------------- MANUAL CHARGES ----------------
@app.post("/submit-manual-charges")
def submit_manual_charges(
    lr_number: str,
    waiting_charges: float,
    loading_charges: float,
    unloading_charges: float,
    detention_charges: float
):
    store_manual_charges(
        lr_number,
        waiting_charges,
        loading_charges,
        unloading_charges,
        detention_charges
    )
    return {
        "message": "Manual charges stored successfully"
    }

@app.post("/generate-invoice")
def generate_invoice_api(lr_number: str):

    result = generate_invoice(lr_number)

    return {
        "message": "Invoice generated",
        "data": result
    }

@app.get("/carrier-payment")
def carrier_payment(lr_number: str):

    result = calculate_carrier_payment(lr_number)

    return {
        "lr_number": lr_number,
        "fuel_cost": result["fuel_cost"],
        "toll_cost": result["toll_cost"],
        "waiting_charges": result["waiting_charges"],
        "loading_charges": result["loading_charges"],
        "unloading_charges": result["unloading_charges"],
        "detention_charges": result["detention_charges"],
        "total_manual_charges": result["manual_total"],
        "total_payment_to_carrier": result["carrier_payment"]
    }