from flask import Flask, request, jsonify
from flask_cors import CORS
import re
import os
import uuid
import traceback
import pytesseract
from PIL import Image

if os.name == "nt":  # Windows
    pytesseract.pytesseract.tesseract_cmd = r"C:\Program Files\Tesseract-OCR\tesseract.exe"
else:  # Linux (Render)
    pytesseract.pytesseract.tesseract_cmd = "/usr/bin/tesseract"

app = Flask(__name__)
CORS(app)

# Configuration
UPLOAD_FOLDER = 'uploads'
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

def extract_from_image(image_path):
    """
    Standard OCR extraction using pytesseract.
    """
    try:
        text = pytesseract.image_to_string(Image.open(image_path))
        return text
    except Exception as e:
        print(f"OCR Error: {e}")
        return ""

@app.route('/api/extract-toll', methods=['POST'])
def extract_toll():
    try:
        if 'file' not in request.files:
            return jsonify({'error': 'No file part'}), 400
        
        file = request.files['file']
        if file.filename == '':
            return jsonify({'error': 'No selected file'}), 400

        temp_filename = f"toll_{uuid.uuid4()}.{file.filename.split('.')[-1]}"
        filepath = os.path.join(UPLOAD_FOLDER, temp_filename)
        file.save(filepath)

        raw_text = extract_from_image(filepath)
        
        # Clean up
        if os.path.exists(filepath):
            os.remove(filepath)

        # Extraction logic
        total_match = re.search(r'(?i)(?:total|amount|rs\.?|inr|₹)\s*[:.-]?\s*([\d,]+\.?\d*)', raw_text)
        extracted_total = 0
        if total_match:
            try:
                extracted_val = total_match.group(1).replace(',', '')
                extracted_total = float(extracted_val)
            except ValueError:
                pass

        return jsonify({
            'type': 'toll',
            'amount': extracted_total,
            'rawText': raw_text
        }), 200

    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/extract-fuel', methods=['POST'])
def extract_fuel():
    try:
        if 'file' not in request.files:
            return jsonify({'error': 'No file part'}), 400
        
        file = request.files['file']
        if file.filename == '':
            return jsonify({'error': 'No selected file'}), 400

        temp_filename = f"fuel_{uuid.uuid4()}.{file.filename.split('.')[-1]}"
        filepath = os.path.join(UPLOAD_FOLDER, temp_filename)
        file.save(filepath)

        raw_text = extract_from_image(filepath)
        
        # Clean up
        if os.path.exists(filepath):
            os.remove(filepath)

        # Extraction logic
        total_match = re.search(r'(?i)(?:total|amount|rs\.?|inr|₹)\s*[:.-]?\s*([\d,]+\.?\d*)', raw_text)
        extracted_total = 0
        if total_match:
            try:
                extracted_val = total_match.group(1).replace(',', '')
                extracted_total = float(extracted_val)
            except ValueError:
                pass

        return jsonify({
            'type': 'fuel',
            'amount': extracted_total,
            'rawText': raw_text
        }), 200

    except Exception as e:
        return jsonify({'error': str(e)}), 500

from risk_engine import FraudRiskEngine

@app.route('/api/detect-fraud', methods=['POST'])
def detect_fraud():
    try:
        req_data = request.get_json()
        requested_total = float(req_data.get('requested_total', 0))
        expected_total = float(req_data.get('expected_total', 0))
        
        # Also allow passing breakdown for better logs/reasons
        waiting = float(req_data.get('waiting_charges', 0))
        loading = float(req_data.get('loading_charges', 0))
        detention = float(req_data.get('detention_charges', 0))
        toll = float(req_data.get('toll_amount', 0))
        fuel = float(req_data.get('fuel_amount', 0))

        engine = FraudRiskEngine(expected_total, requested_total)
        # Pass extra info to engine if needed
        engine.extra_info = {
            "waiting": waiting,
            "loading": loading,
            "detention": detention,
            "toll": toll,
            "fuel": fuel
        }
        
        result = engine.run()
        return jsonify(result), 200

    except Exception as e:
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    app.run(port=8002, debug=True)
