import axios from 'axios'

const testOTP = async () => {
  try {
    const res = await axios.post('http://127.0.0.1:8001/generate-otp?lr_number=TEST-LR&receiver_contact=+919999999999', {})
    console.log('Success:', res.data)
  } catch (err) {
    console.error('Error:', err.message)
    if (err.response) console.error('Response:', err.response.data)
  }
}

testOTP()
