import dotenv from "dotenv";
dotenv.config();

import express from "express";
import cors from "cors";
import path from "path";
import {fileURLToPath} from "url";
import connectDB from "./config/db.js";
import errorHandler from './middleware/errorHandler.js';
import authRoutes from './routes/authRoutes.js';

//ES6 module __dirname alternative 
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

//Intialize express app
const app = express();

//connect to mongoDB
connectDB();

//middlewares to handle CORS
app.use(
    cors({
        origin: "*",
        methods: ["GET", "POST", "PUT", "DELETE"],
        allowedHeaders: ["Content-Type", "Authorization"],
        credentials: true,
    })
);

//Middleware to parse JSON request body
app.use(express.json());

//Middleware to parse URL encoded request body
app.use(express.urlencoded({ extended: true }));

//Middleware to handle file uploads
//static folder for uploads

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

//Routes
app.use('/api/auth', authRoutes);


app.use(errorHandler);

//404 handler
app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: "Route not found here",
        statuscode: 404
    });
});


//start server
const PORT = process.env.PORT || 8000;

app.listen(PORT, () => {
    console.log(`Server is running in ${process.env.NODE_ENV} mode on port ${PORT}`);
});


process.on('unhandledRejection', (err) => {
    console.log(`Error: ${err.message}`);
    process.exit(1);
});









