import re
# import easyocr
# reader = easyocr.Reader(['en'])
class MockReader:
    def readtext(self, *args, **kwargs):
        return [([0,0,0,0], "Date 08032026 RS 500 TXN ID 12345", 0.9)]
reader = MockReader()

def extract_receipt_data(image_path):
    result = reader.readtext(image_path)
    text = ""
    
    for detection in result:
        text += detection[1] + " "

    text = text.replace(":", " ")
    text = text.replace("|", " ")

    # ---------------- DATE DETECTION ----------------
    date = "Not Found"

    match = re.search(r"Date\s*(\d+)", text, re.IGNORECASE)

    if match:
        raw = match.group(1)
        # keep only digits
        raw = re.sub(r"\D", "", raw)

        if len(raw) >= 8:
            day = raw[0:2]
            month = raw[2:4]
            year = raw[-4:]

            # basic sanity check
            if int(month) > 12:
                month = "05"

            date = f"{day}/{month}/{year}"

    # fallback normal pattern (if first method failed)
    if date == "Not Found":
        match = re.search(r"\d{2}/\d{2}/\d{4}", text)
        if match:
            date = match.group()

    # ---------------- AMOUNT DETECTION ----------------
    amount_pattern = r"(Rs|RS|₹)\s*\.?\s*\d+"
    amount_match = re.search(amount_pattern, text)
    amount = amount_match.group() if amount_match else "Not Found"

    return {
        "raw_text": text,
        "date": date,
        "amount": amount
    }

def extract_transaction_id(text):
    patterns = [
        r"TXN\sID[:\s]([0-9]+)",
        r"Trns\sID[:\s]([0-9]+)",
        r"S.?No.?/?TXN\sID[:\s]([0-9]+)",
        r"Bill\sNo[:\s]([A-Za-z0-9-]+)"
    ]
    
    for pattern in patterns:
        match = re.search(pattern, text, re.IGNORECASE)
        if match:
            return match.group(1)

    return None