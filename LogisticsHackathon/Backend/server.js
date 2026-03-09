import express from "express"
import cors from "cors"
import dotenv from "dotenv"
import cookieParser from "cookie-parser"
import receiptRoutes from "./routes/receiptRoutes.js"
import authRoutes from "./routes/authRoutes.js"
import shipmentRoutes from "./routes/shipmentRoutes.js"
import connectDb from "./config/connectDb.js"

dotenv.config()

const port = process.env.PORT
const app = express();
app.use(express.json())
app.use(cookieParser())

const allowedOrigins = [
    "http://localhost:5173",
    "http://localhost:5174",
    "https://cargointellogistics-nine.vercel.app"
];

app.use((req, res, next) => {
    const origin = req.headers.origin;
    if (origin && allowedOrigins.includes(origin)) {
        res.header("Access-Control-Allow-Origin", origin);
        res.header("Access-Control-Allow-Credentials", "true");
    } else {
        res.header("Access-Control-Allow-Origin", "*");
    }
    next();
});

app.use(cors({
    origin: true,
    credentials: true
}))


app.use("/api/receipts", receiptRoutes)
app.use("/api/auth", authRoutes)
app.use("/api/shipments", shipmentRoutes)

app.get("/",(req,res) => {
    res.send("Hello from Server");
})

app.listen(port,() => {
    console.log(`Server running on port ${port}`);
    connectDb();
})
