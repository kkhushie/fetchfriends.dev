import jwt from 'jsonwebtoken';
import { createError } from './errorHandler';
import { User } from '../models/User';
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';
export async function authenticate(req, res, next) {
    try {
        const token = req.headers.authorization?.replace('Bearer ', '');
        if (!token) {
            throw createError('Authentication required', 401);
        }
        const decoded = jwt.verify(token, JWT_SECRET);
        const user = await User.findById(decoded.userId).select('-auth.accessToken -auth.refreshToken');
        if (!user) {
            throw createError('User not found', 404);
        }
        req.user = user;
        next();
    }
    catch (error) {
        if (error.name === 'JsonWebTokenError') {
            return next(createError('Invalid token', 401));
        }
        if (error.name === 'TokenExpiredError') {
            return next(createError('Token expired', 401));
        }
        next(error);
    }
}
export function generateToken(userId) {
    return jwt.sign({ userId }, JWT_SECRET, { expiresIn: '7d' });
}
export function generateRefreshToken(userId) {
    return jwt.sign({ userId }, JWT_SECRET, { expiresIn: '30d' });
}
//# sourceMappingURL=auth.js.map