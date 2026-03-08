import random
import os
import requests
import re
from dotenv import load_dotenv

load_dotenv()

# memory store
otp_storage = {}

def generate_otp(lr_number, receiver_contact=None):
    otp = random.randint(1000, 9999)
    otp_storage[lr_number] = otp

    print(f"[AGENT 2] OTP {otp} generated for {lr_number}. Sending is handled by Node Backend.")

    return otp

def verify_otp(lr_number, entered_otp):
    print(f"[AGENT 2 DEBUG] Verifying OTP for {lr_number}. Entered: {entered_otp} (Type: {type(entered_otp)})")
    if lr_number in otp_storage:
        print(f"[AGENT 2 DEBUG] Stored OTP: {otp_storage[lr_number]} (Type: {type(otp_storage[lr_number])})")
        # Use string comparison to avoid int/string mismatch issues
        if str(otp_storage[lr_number]) == str(entered_otp):
            print("[AGENT 2 DEBUG] Verification SUCCESS")
            return True
        else:
            print("[AGENT 2 DEBUG] Verification FAILED: mismatch")
    else:
        print(f"[AGENT 2 DEBUG] LR Number not found in storage: {lr_number}")
    return False