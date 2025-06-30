import express from 'express';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';
import cors from 'cors';

import { connectDB } from './lib/db.js'; 

import authRoutes from './routes/auth.route.js';
import messageRoutes from './routes/message.route.js';

dotenv.config(); // Load environment variables from .env file
const app=express();

const PORT=process.env.PORT

app.use(express.json()); // Middleware to parse JSON requests or allow us to retrive json data from the request body
app.use(cookieParser()); // Middleware to parse cookies from the request
app.use(cors({
    origin: "http://localhost:5173", // Allow requests from the frontend running on this origin
    credentials: true, // Allow cookies to be sent with requests
}));

app.use("/api/auth", authRoutes)
app.use("/api/message", messageRoutes);  // Use the message routes for handling message-related requests

app.listen(PORT, () => {
    console.log('Server is running on PORT:'+ PORT);
    connectDB(); // Call the connectDB function to connect to MongoDB
})