import axios from 'axios';
import fs from 'fs';
import FormData from 'form-data';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function testExtract() {
  try {
    const filePath = path.join(__dirname, 'test_receipt.jpg');
    // Create a dummy file for testing if it doesn't exist
    if (!fs.existsSync(filePath)) {
      fs.writeFileSync(filePath, 'dummy content');
    }

    const formData = new FormData();
    formData.append('file', fs.createReadStream(filePath));

    console.log('Sending request to Agent 1 (Port 5000)...');
    const response = await axios.post('http://127.0.0.1:5000/api/extract', formData, {
      headers: {
        ...formData.getHeaders()
      }
    });

    console.log('Response status:', response.status);
    console.log('Response data:', JSON.stringify(response.data, null, 2));
  } catch (error) {
    if (error.response) {
      console.error('Error Status:', error.response.status);
      console.error('Error Data:', error.response.data);
    } else {
      console.error('Error Message:', error.message);
    }
  }
}

testExtract();
