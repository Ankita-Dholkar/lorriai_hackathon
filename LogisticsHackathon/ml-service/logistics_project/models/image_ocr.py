try:
    import pytesseract
    import cv2
    pytesseract.pytesseract.tesseract_cmd = r"C:\Program Files\Tesseract-OCR\tesseract.exe"
    OCRAvailable = True
except ImportError:
    OCRAvailable = False
def extract_from_image(path):
    if not OCRAvailable:
        return "Mock Extracted Text: Consignor: ABC Manufacturing, Consignee: XYZ Retail, Vehicle: MH12AB1234, Freight: 0"
    
    try:
        img = cv2.imread(path)
        if img is None:
            return "Mock Extracted Text: Consignor: ABC Manufacturing, Consignee: XYZ Retail, Vehicle: MH12AB1234, Freight: 0"

        gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
        text = pytesseract.image_to_string(gray)
        return text if text.strip() else "Mock Extracted Text: Consignor: ABC Manufacturing, Consignee: XYZ Retail, Vehicle: MH12AB1234, Freight: 0"
    except Exception as e:
        print(f"OCR Warning: {e}. Returning mock text.")
        return "Mock Extracted Text: Consignor: ABC Manufacturing, Consignee: XYZ Retail, Vehicle: MH12AB1234, Freight: 0"