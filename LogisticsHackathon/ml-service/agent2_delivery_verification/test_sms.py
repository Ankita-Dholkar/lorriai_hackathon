import requests
import os
from dotenv import load_dotenv

load_dotenv()

api_key = os.getenv('FAST2SMS_API_KEY')
numbers = "9876543210" # Standard 10-digit dummy
otp = "1234"

url = "https://www.fast2sms.com/dev/bulkV2"
import re
digits = re.sub(r"\D", "", numbers)
if len(digits) >= 10:
    phone_number = digits[-10:]
else:
    phone_number = digits

payload = {
    "message": f"Your Logistics Delivery OTP is: {otp}. Valid for 10 minutes.",
    "route": "q",
    "numbers": phone_number
}
headers = {
    "authorization": api_key
}

try:
    response = requests.post(url, data=payload, headers=headers)
    print(f"Status: {response.status_code}")
    print(f"Response: {response.text}")
except Exception as e:
    print(f"Error: {e}")
