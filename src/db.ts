import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config(); // Load environment variables from .env file

const uri = process.env.MONGO_URI as string; // Ensure MONGO_URI is defined in your .env file

export async function connectToDatabase() {
    if (mongoose.connection.readyState === 0) { // 0 = disconnected
        try {
            await mongoose.connect(uri, {
            });
            console.log('Connected to MongoDB');
        } catch (error) {
            console.error('Error connecting to MongoDB', error);
            process.exit(1);
        }
    } else {
        console.log('Already connected to MongoDB');
    }
}


