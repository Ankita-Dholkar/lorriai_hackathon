from flask import Flask, request, jsonify
from flask_cors import CORS
import os
import uuid
import traceback

# Import local modules
from models.image_ocr import extract_from_image
from database.db import insert_data

app = Flask(__name__)
CORS(app)

# Use absolute path for upload folder
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
UPLOAD_FOLDER = os.path.join(BASE_DIR, 'uploads')
if not os.path.exists(UPLOAD_FOLDER):
    os.makedirs(UPLOAD_FOLDER, exist_ok=True)

app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER

def parse_extracted_text(raw_text):
    import re
    
    # Extract total dynamically if available, else fallback
    total_match = re.search(r'(?i)(?:total|amount|rs\.?|inr|₹)\s*[:.-]?\s*([\d,]+\.?\d*)', raw_text)
    extracted_total = 0 
    if total_match:
        try:
            extracted_val = total_match.group(1).replace(',', '')
            extracted_total = float(extracted_val)
        except ValueError:
            pass

    # Mock parser - returning dummy data for the rest of the form
    data = {
        "transporter_name": "FastTrack Logistics",
        "transporter_address": "45 Highway Road, Mumbai",
        "transporter_contact": "9988776655",
        "consignor_name": "ABC Manufacturing Pvt. Ltd.",
        "consignor_address": "Industrial Area, Pune, MH",
        "consignor_contact": "9876543210",
        "consignor_gstin": "27AAACD1234E1Z1",
        "consignee_name": "XYZ Retail Warehouse",
        "consignee_address": "Sector 12, Noida, UP",
        "consignee_contact": "8765432109",
        "consignee_gstin": "07BCCCD5678F2Z2"
    }

    transport = {
        "vehicle_number": "MH12AB1234",
        "driver_name": "Rahul Sharma",
        "driver_contact": "9988776655",
        "destination": "Noida",
        "freight_charges": "0",
        "other_charges": "0",
        "total_charges": str(extracted_total), # Mix of dummy data but dynamic totals
        "freight_type": "To Pay",
        "special_instructions": "Handle with care. Fragile electronic items.",
        "goods_type": "Electronics",
        "goods_description": "LED TVs 55 inch",
        "weight": "500",
        "quantity": "20",
        "goods_value": "1500000"
    }
    return data, transport

@app.route('/api/extract', methods=['POST'])
def extract_receipt():
    try:
        if 'file' not in request.files:
            return jsonify({'error': 'No file part'}), 400
        
        file = request.files['file']
        if file.filename == '':
            return jsonify({'error': 'No selected file'}), 400

        # Save file temporarily
        ext = file.filename.rsplit('.', 1)[1].lower() if '.' in file.filename else 'jpg'
        temp_filename = f"{uuid.uuid4()}.{ext}"
        filepath = os.path.join(app.config['UPLOAD_FOLDER'], temp_filename)
        file.save(filepath)

        # 1. OCR Extraction
        raw_text = extract_from_image(filepath)

        # 2. Parsing text
        data, transport = parse_extracted_text(raw_text)

        # 3. Save to ML database
        lr_number = insert_data(file.filename, data, transport, raw_text)

        # Clean up
        if os.path.exists(filepath):
            os.remove(filepath)

        # 4. Return structured data
        response_payload = {
            'lrNumber': lr_number,
            'transporterName': data.get('transporter_name', ''),
            'transporterAddress': data.get('transporter_address', ''),
            'transporterContact': data.get('transporter_contact', ''),
            'consignorName': data.get('consignor_name', ''),
            'consignorAddress': data.get('consignor_address', ''),
            'consignorContact': data.get('consignor_contact', ''),
            'consignorGSTIN': data.get('consignor_gstin', ''),
            'consigneeName': data.get('consignee_name', ''),
            'consigneeAddress': data.get('consignee_address', ''),
            'consigneeContact': data.get('consignee_contact', ''),
            'consigneeGSTIN': data.get('consignee_gstin', ''),
            'vehicleNumber': transport.get('vehicle_number', ''),
            'driverName': transport.get('driver_name', ''),
            'driverContact': transport.get('driver_contact', ''),
            'destination': transport.get('destination', ''),
            'freightCharges': float(transport.get('freight_charges', 0) or 0),
            'otherCharges': float(transport.get('other_charges', 0) or 0),
            'totalCharges': float(transport.get('total_charges', 0) or 0),
            'freightType': transport.get('freight_type', 'To Pay'),
            'specialInstructions': transport.get('special_instructions', ''),
            'goodsDescription': transport.get('goods_description', ''),
            'weight': float(transport.get('weight', 0) or 0),
            'quantity': int(transport.get('quantity', 0) or 0),
            'goodsValue': float(transport.get('goods_value', 0) or 0),
            'goodsType': transport.get('goods_type', 'Other'),
            'rawText': raw_text
        }
        return jsonify(response_payload), 200

    except Exception as e:
        error_info = traceback.format_exc()
        # Log to file in the root directory for easy access
        log_path = os.path.join(os.path.dirname(BASE_DIR), 'extraction_error.log')
        with open(log_path, 'a') as f:
            f.write(f"\n--- ERROR at {uuid.uuid4()} ---\n{error_info}\n")
        print(f"Extraction Error: {str(e)}")
        return jsonify({'error': str(e), 'trace': error_info}), 500

@app.route('/api/extract-expense', methods=['POST'])
def extract_expense():
    import re
    try:
        if 'file' not in request.files:
            return jsonify({'error': 'No file part'}), 400
        
        file = request.files['file']
        if file.filename == '':
            return jsonify({'error': 'No selected file'}), 400

        # Save file temporarily
        ext = file.filename.rsplit('.', 1)[1].lower() if '.' in file.filename else 'jpg'
        temp_filename = f"{uuid.uuid4()}.{ext}"
        filepath = os.path.join(app.config['UPLOAD_FOLDER'], temp_filename)
        file.save(filepath)

        # 1. OCR Extraction
        raw_text = extract_from_image(filepath)

        # Clean up
        if os.path.exists(filepath):
            os.remove(filepath)

        # 2. Parsing text for total
        total_match = re.search(r'(?i)(?:total|amount|rs\.?|inr|₹)\s*[:.-]?\s*([\d,]+\.?\d*)', raw_text)
        extracted_total = 0
        if total_match:
            try:
                extracted_val = total_match.group(1).replace(',', '')
                extracted_total = float(extracted_val)
            except ValueError:
                pass

        return jsonify({'totalCharges': extracted_total}), 200

    except Exception as e:
        error_info = traceback.format_exc()
        print(f"Expense Extraction Error: {str(e)}")
        return jsonify({'error': str(e), 'trace': error_info}), 500

@app.route('/api/store-manual-lr', methods=['POST'])
def store_manual_lr():
    try:
        req_data = request.get_json()
        data = { "transporter_name": req_data.get("transporterName"), "transporter_address": req_data.get("transporterAddress"), "transporter_contact": req_data.get("transporterContact"), "consignor_name": req_data.get("consignorName"), "consignor_address": req_data.get("consignorAddress"), "consignor_contact": req_data.get("consignorContact"), "consignor_gstin": req_data.get("consignorGSTIN"), "consignee_name": req_data.get("consigneeName"), "consignee_address": req_data.get("consigneeAddress"), "consignee_contact": req_data.get("consigneeContact"), "consignee_gstin": req_data.get("consigneeGSTIN") }
        transport = { "vehicle_number": req_data.get("vehicleNumber"), "driver_name": req_data.get("driverName"), "driver_contact": req_data.get("driverContact"), "destination": req_data.get("destination"), "freight_charges": str(req_data.get("freightCharges", "0")), "other_charges": str(req_data.get("otherCharges", "0")), "total_charges": str(req_data.get("totalCharges", "0")), "freight_type": req_data.get("freightType", "To Pay"), "special_instructions": req_data.get("specialInstructions"), "goods_type": req_data.get("goodsType"), "goods_description": req_data.get("goodsDescription"), "weight": str(req_data.get("weight", "0")), "quantity": str(req_data.get("quantity", "0")), "goods_value": str(req_data.get("goodsValue", "0")) }
        lr_number = insert_data("manual_entry", data, transport, "Manual Entry from Backend")
        return jsonify({"lrNumber": lr_number, "status": "success"}), 200
    except Exception as e:
        print(f"Manual LR Storage Error: {str(e)}")
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    app.run(port=5000, debug=True)
