import sys
import os

# Add relevant paths
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

try:
    from app import parse_extracted_text
    from database.db import insert_data
    from models.image_ocr import extract_from_image

    print("--- Starting Extraction Test ---")
    
    # Use the sample receipt if it exists
    sample_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), "sample_receipt.jpg")
    if not os.path.exists(sample_path):
        # Create a dummy
        with open(sample_path, "wb") as f:
            f.write(b"dummy image data")
        print(f"Created dummy sample at {sample_path}")

    # 1. OCR
    print("Testing OCR...")
    raw_text = extract_from_image(sample_path)
    print(f"Raw Text Extracted: {raw_text[:50]}...")

    # 2. Parsing
    print("Testing Parsing...")
    data, transport = parse_extracted_text(raw_text)
    print(f"Parsed Data Keys: {list(data.keys())}")

    # 3. Database
    print("Testing Database Insertion...")
    lr_number = insert_data("test_receipt.jpg", data, transport, raw_text)
    print(f"Success! Generated LR: {lr_number}")

except Exception as e:
    import traceback
    print("--- ERROR DETECTED ---")
    print(traceback.format_exc())
    sys.exit(1)
