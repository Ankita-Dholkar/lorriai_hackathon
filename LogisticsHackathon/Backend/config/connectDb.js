import mongoose from "mongoose";

const connectDb = async () => {
    try {
        if (!process.env.MONGO_URL) {
            console.error("MONGO_URL is not defined in environment variables");
        }
        await mongoose.connect(process.env.MONGO_URL)
        console.log("DB Connected Successfully");
        
    } catch(error) {
        console.error("MongoDB Connection Error Details:", error);
        
    }
}

export default connectDb;