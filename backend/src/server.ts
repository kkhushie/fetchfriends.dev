import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import { createServer } from 'http';
import { Server } from 'socket.io';
import { connectDB } from './config/database';
import { connectRedis } from './config/redis';
import { errorHandler } from './middleware/errorHandler';
import { rateLimiter } from './middleware/rateLimiter';
import authRoutes from './routes/auth';
import userRoutes from './routes/users';
import matchRoutes from './routes/match';
import sessionRoutes from './routes/sessions';
import feedbackRoutes from './routes/feedback';
import { setupSocketIO } from './socket/socketHandler';
import { logger } from './utils/logger';


const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    methods: ['GET', 'POST'],
    credentials: true,
  },
});

const PORT = process.env.PORT || 4000;

// Middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'", "'unsafe-eval'"],
      connectSrc: ["'self'", "wss:", "ws:", process.env.FRONTEND_URL || 'http://localhost:3000'],
    },
  },
}));

app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true,
}));

app.use(compression());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Rate limiting
app.use('/api/', rateLimiter);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/match', matchRoutes);
app.use('/api/sessions', sessionRoutes);
app.use('/api/feedback', feedbackRoutes);
app.get("/privacy", (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>FetchFriends Privacy Policy</title>
      <meta name="viewport" content="width=device-width, initial-scale=1">
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; max-width: 800px; margin: 0 auto; padding: 20px; }
        h1 { color: #333; }
        h2 { color: #555; margin-top: 30px; }
      </style>
    </head>
    <body>
      <h1>Privacy Policy for FetchFriends</h1>
      <p><strong>Last Updated:</strong> ${new Date().toLocaleDateString()}</p>
      
      <h2>1. Information We Collect</h2>
      <p>When you use FetchFriends, we collect information you provide directly to us:</p>
      <ul>
        <li><strong>GitHub/LinkedIn Profile Data:</strong> Basic profile information from your GitHub/LinkedIn account</li>
        <li><strong>Technical Information:</strong> Your programming languages, frameworks, and experience level</li>
        <li><strong>Session Data:</strong> Information about your video sessions and connections</li>
      </ul>
      
      <h2>2. How We Use Your Information</h2>
      <p>We use the information we collect to:</p>
      <ul>
        <li>Connect you with other developers for pair programming</li>
        <li>Verify your developer credentials</li>
        <li>Improve our matching algorithms</li>
        <li>Ensure platform safety and quality</li>
      </ul>
      
      <h2>3. Data Sharing</h2>
      <p>We do not sell your personal information. We only share:</p>
      <ul>
        <li>Basic profile information with other developers during matching</li>
        <li>Anonymous, aggregated data for analytics</li>
      </ul>
      
      <h2>4. Contact Us</h2>
      <p>If you have questions about this Privacy Policy, contact: privacy@fetchfriends.dev</p>
      
      <p><em>This is a development version of our privacy policy for LinkedIn OAuth integration.</em></p>
    </body>
    </html>
  `);
});

// Socket.io setup
setupSocketIO(io);

// Error handling
app.use(errorHandler);

// Start server
async function startServer() {
  try {
    await connectDB();
    await connectRedis();
    
    httpServer.listen(PORT, () => {
      logger.info(`🚀 Server running on port ${PORT}`);
      logger.info(`📡 Socket.io ready for connections`);
    });
  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
}

startServer();

export { app, io };

