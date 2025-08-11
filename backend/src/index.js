import express from 'express';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';
import cors from 'cors';

import path from "path";

import { connectDB } from './lib/db.js'; 

import authRoutes from './routes/auth.route.js';
import messageRoutes from './routes/message.route.js';
import { app, server } from "./lib/socket.js";

dotenv.config(); // Load environment variables from .env file

const PORT=process.env.PORT
const __dirname = path.resolve(); // Get the current directory name

app.use(express.json()); // Middleware to parse JSON requests or allow us to retrive json data from the request body
app.use(cookieParser()); // Middleware to parse cookies from the request
app.use(cors({
    origin: "http://localhost:5173", // Allow requests from the frontend running on this origin
    credentials: true, // Allow cookies to be sent with requests
}));

app.use("/api/auth", authRoutes)
app.use("/api/messages", messageRoutes);  // Use the message routes for handling message-related requests

if (process.env.NODE_ENV === "production") {
    app.use(express.static(path.join(__dirname, "../frontend/build")));
  
    app.get("*", (req, res) => {
      res.sendFile(path.join(__dirname, "../frontend", "build", "index.html"));
    });
}

server.listen(PORT, () => {
    console.log('Server is running on PORT:'+ PORT);
    connectDB(); // Call the connectDB function to connect to MongoDB
})