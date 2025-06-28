import express from 'express';
import dotenv from 'dotenv';

import { connectDB } from './lib/db.js'; 
import authRoutes from './routes/auth.route.js';

dotenv.config(); // Load environment variables from .env file
const app=express();

const PORT=process.env.PORT

app.use(express.json()); // Middleware to parse JSON requests or allow us to retrive json data from the request body

app.use("/api/auth", authRoutes)

app.listen(PORT, () => {
    console.log('Server is running on PORT:'+ PORT);
    connectDB(); // Call the connectDB function to connect to MongoDB
})