import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: join(__dirname, '.env') });

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

const mailOptions = {
  from: process.env.EMAIL_USER,
  to: process.env.EMAIL_USER, // Sending to self as test
  subject: 'SMTP Test - Logistics Hackathon',
  text: 'This is a test email to verify SMTP configuration.',
};

console.log(`Starting test for ${process.env.EMAIL_USER}...`);

try {
  const info = await transporter.sendMail(mailOptions);
  console.log('Test Successful!');
  console.log('Response:', info.response);
} catch (error) {
  console.error('Test Failed:', error.message);
  if (error.code === 'EAUTH') {
    console.log('Authentication Error: Check your username and app password.');
  }
}
process.exit();
