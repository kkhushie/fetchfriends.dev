import jwt from 'jsonwebtoken';
import { User } from '../models/User';
import { Session } from '../models/Session';
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';
export function setupSocketIO(io) {
    // Authentication middleware
    io.use(async (socket, next) => {
        try {
            const token = socket.handshake.auth.token || socket.handshake.headers.authorization?.replace('Bearer ', '');
            if (!token) {
                return next(new Error('Authentication error'));
            }
            const decoded = jwt.verify(token, JWT_SECRET);
            const user = await User.findById(decoded.userId);
            if (!user) {
                return next(new Error('User not found'));
            }
            socket.userId = decoded.userId;
            next();
        }
        catch (error) {
            next(new Error('Authentication error'));
        }
    });
    io.on('connection', (socket) => {
        console.log(`User connected: ${socket.userId}`);
        // Update user availability
        socket.on('user:online', async () => {
            if (socket.userId) {
                await User.findByIdAndUpdate(socket.userId, {
                    'availability.status': 'online',
                    lastActive: new Date(),
                });
                socket.broadcast.emit('user:status', {
                    userId: socket.userId,
                    status: 'online',
                });
            }
        });
        // Join session room
        socket.on('session:join', async (sessionId) => {
            try {
                const session = await Session.findById(sessionId);
                if (!session) {
                    socket.emit('error', { message: 'Session not found' });
                    return;
                }
                const isParticipant = session.participants.some((p) => p.user.toString() === socket.userId);
                if (!isParticipant) {
                    socket.emit('error', { message: 'Not authorized' });
                    return;
                }
                socket.join(`session:${sessionId}`);
                socket.sessionId = sessionId;
                socket.to(`session:${sessionId}`).emit('session:user-joined', {
                    userId: socket.userId,
                });
            }
            catch (error) {
                socket.emit('error', { message: 'Failed to join session' });
            }
        });
        // Leave session room
        socket.on('session:leave', async (sessionId) => {
            socket.leave(`session:${sessionId}`);
            socket.to(`session:${sessionId}`).emit('session:user-left', {
                userId: socket.userId,
            });
            socket.sessionId = undefined;
        });
        // Code collaboration events
        socket.on('code:change', (data) => {
            socket.to(`session:${data.sessionId}`).emit('code:change', {
                ...data,
                userId: socket.userId,
            });
        });
        socket.on('code:save', (data) => {
            socket.to(`session:${data.sessionId}`).emit('code:save', {
                ...data,
                userId: socket.userId,
            });
        });
        // Terminal events
        socket.on('terminal:command', (data) => {
            socket.to(`session:${data.sessionId}`).emit('terminal:command', {
                ...data,
                userId: socket.userId,
            });
        });
        socket.on('terminal:output', (data) => {
            socket.to(`session:${data.sessionId}`).emit('terminal:output', {
                ...data,
                userId: socket.userId,
            });
        });
        // Whiteboard events
        socket.on('whiteboard:draw', (data) => {
            socket.to(`session:${data.sessionId}`).emit('whiteboard:draw', {
                ...data,
                userId: socket.userId,
            });
        });
        socket.on('whiteboard:clear', (data) => {
            socket.to(`session:${data.sessionId}`).emit('whiteboard:clear', {
                userId: socket.userId,
            });
        });
        // Chat events
        socket.on('chat:message', (data) => {
            socket.to(`session:${data.sessionId}`).emit('chat:message', {
                ...data,
                userId: socket.userId,
                timestamp: new Date(),
            });
        });
        socket.on('chat:typing', (data) => {
            socket.to(`session:${data.sessionId}`).emit('chat:typing', {
                ...data,
                userId: socket.userId,
            });
        });
        // WebRTC signaling
        socket.on('webrtc:offer', (data) => {
            socket.to(`session:${data.sessionId}`).to(data.to).emit('webrtc:offer', {
                ...data,
                from: socket.userId,
            });
        });
        socket.on('webrtc:answer', (data) => {
            socket.to(`session:${data.sessionId}`).to(data.to).emit('webrtc:answer', {
                ...data,
                from: socket.userId,
            });
        });
        socket.on('webrtc:ice-candidate', (data) => {
            socket.to(`session:${data.sessionId}`).to(data.to).emit('webrtc:ice-candidate', {
                ...data,
                from: socket.userId,
            });
        });
        // Queue status updates
        socket.on('queue:subscribe', async (queueId) => {
            socket.join(`queue:${queueId}`);
        });
        socket.on('queue:unsubscribe', (queueId) => {
            socket.leave(`queue:${queueId}`);
        });
        // Disconnect
        socket.on('disconnect', async () => {
            console.log(`User disconnected: ${socket.userId}`);
            if (socket.userId) {
                await User.findByIdAndUpdate(socket.userId, {
                    'availability.status': 'offline',
                });
                socket.broadcast.emit('user:status', {
                    userId: socket.userId,
                    status: 'offline',
                });
            }
        });
    });
}
//# sourceMappingURL=socketHandler.js.map