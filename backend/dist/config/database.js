import mongoose from 'mongoose';
import { logger } from '../utils/logger';
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/fetchfriends';
export async function connectDB() {
    try {
        await mongoose.connect(MONGODB_URI);
        logger.info('✅ MongoDB connected');
    }
    catch (error) {
        logger.error('❌ MongoDB connection error:', error);
        throw error;
    }
}
export async function disconnectDB() {
    await mongoose.disconnect();
    logger.info('MongoDB disconnected');
}
//# sourceMappingURL=database.js.map