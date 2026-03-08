import { v2 as cloudinary } from 'cloudinary';
import fs from 'fs';
import dotenv from 'dotenv';

dotenv.config();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const uploadOnCloudinary = async (filePath) => {
  try {
    if (!filePath) return null;

    const uploadResult = await cloudinary.uploader.upload(filePath, {
      resource_type: 'auto',
    });

    fs.unlinkSync(filePath); // Delete temp file AFTER upload succeeds
    return uploadResult.secure_url;

  } catch (error) {
    fs.unlinkSync(filePath); // Delete temp file if upload fails
    console.log(error);
    return null;
  }
};

export default uploadOnCloudinary;
