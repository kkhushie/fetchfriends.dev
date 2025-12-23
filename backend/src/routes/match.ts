import express from 'express';
import { authenticate, AuthRequest } from '../middleware/auth';
import { matchRateLimiter } from '../middleware/rateLimiter';
import { Queue } from '../models/Queue';
import { Session } from '../models/Session';
import { User } from '../models/User';
import { MatchingService } from '../services/matching';
import { createError } from '../middleware/errorHandler';
import { redisClient, safeRedisOperation } from '../config/redis';

const router = express.Router();

// Join matching queue
router.post('/join', authenticate, matchRateLimiter, async (req: AuthRequest, res, next) => {
  try {
    const userId = req.user?._id.toString();
    if (!userId) {
      throw createError('User not found', 404);
    }

    const { mode, params } = req.body;

    // Check if user is already in queue
    const existingQueue = await Queue.findOne({
      user: userId,
      status: { $in: ['waiting', 'matching'] },
    });

    if (existingQueue) {
      return res.json({
        success: true,
        queue: existingQueue,
        message: 'Already in queue',
      });
    }

    // Create queue entry
    const queue = new Queue({
      user: userId,
      mode: mode || 'random',
      params: {
        languages: params?.languages || [],
        experience: params?.experience,
        goals: params?.goals || [],
        maxWaitTime: params?.maxWaitTime || 180,
      },
      status: 'waiting',
      waitStart: new Date(),
    });

    await queue.save();

    // Add to Redis queue for fast matching
    await safeRedisOperation(
      () => redisClient.lPush(`queue:${mode}`, queue._id.toString()),
      0,
      'lPush queue'
    );

    // Start matching process
    MatchingService.findMatch(queue._id.toString()).catch((error) => {
      console.error('Matching error:', error);
    });

    res.json({ success: true, queue });
  } catch (error) {
    next(error);
  }
});

// Leave queue
router.delete('/leave', authenticate, async (req: AuthRequest, res, next) => {
  try {
    const userId = req.user?._id.toString();
    if (!userId) {
      throw createError('User not found', 404);
    }

    const queue = await Queue.findOne({
      user: userId,
      status: { $in: ['waiting', 'matching'] },
    });

    if (queue) {
      queue.status = 'cancelled';
      await queue.save();

      // Remove from Redis queue
      await safeRedisOperation(
        () => redisClient.lRem(`queue:${queue.mode}`, 0, queue._id.toString()),
        0,
        'lRem queue'
      );
    }

    res.json({ success: true, message: 'Left queue' });
  } catch (error) {
    next(error);
  }
});

// Get queue status
router.get('/status', authenticate, async (req: AuthRequest, res, next) => {
  try {
    const userId = req.user?._id.toString();
    if (!userId) {
      throw createError('User not found', 404);
    }

    const queue = await Queue.findOne({
      user: userId,
      status: { $in: ['waiting', 'matching'] },
    }).populate('match.matchedWith', 'profile.name profile.avatar');

    if (!queue) {
      return res.json({ success: true, inQueue: false });
    }

    // Calculate position
    const position = await safeRedisOperation(
      () => redisClient.lPos(`queue:${queue.mode}`, queue._id.toString(), {
        RANK: 1,
      }),
      null,
      'lPos queue'
    );

    // Estimate wait time
    const estimatedWait = MatchingService.estimateWaitTime(queue.mode);

    res.json({
      success: true,
      inQueue: true,
      queue: {
        ...queue.toObject(),
        position: position !== null ? position + 1 : 0,
        estimatedWait,
      },
    });
  } catch (error) {
    next(error);
  }
});

// Accept match
router.post('/accept/:sessionId', authenticate, async (req: AuthRequest, res, next) => {
  try {
    const userId = req.user?._id.toString();
    const { sessionId } = req.params;

    const session = await Session.findById(sessionId);
    if (!session) {
      throw createError('Session not found', 404);
    }

    // Check if user is a participant
    const participant = session.participants.find(
      (p) => p.user.toString() === userId
    );

    if (!participant) {
      throw createError('Not a participant in this session', 403);
    }

    // Update session status
    if (session.status === 'waiting') {
      session.status = 'active';
      session.startTime = new Date();
      await session.save();
    }

    res.json({ success: true, session });
  } catch (error) {
    next(error);
  }
});

// Decline match
router.post('/decline/:sessionId', authenticate, async (req: AuthRequest, res, next) => {
  try {
    const userId = req.user?._id.toString();
    const { sessionId } = req.params;

    const session = await Session.findById(sessionId);
    if (!session) {
      throw createError('Session not found', 404);
    }

    // Remove user from session
    session.participants = session.participants.filter(
      (p) => p.user.toString() !== userId
    );

    if (session.participants.length === 0) {
      session.status = 'ended_early';
      session.endTime = new Date();
    }

    await session.save();

    // Re-add user to queue if they want
    if (req.body.rejoinQueue) {
      // Trigger rejoin logic
    }

    res.json({ success: true, message: 'Match declined' });
  } catch (error) {
    next(error);
  }
});

// Get match history
router.get('/history', authenticate, async (req: AuthRequest, res, next) => {
  try {
    const userId = req.user?._id.toString();
    const { limit = 20, offset = 0 } = req.query;

    const sessions = await Session.find({
      'participants.user': userId,
      status: { $in: ['completed', 'ended_early'] },
    })
      .populate('participants.user', 'profile.name profile.avatar')
      .sort({ createdAt: -1 })
      .limit(Number(limit))
      .skip(Number(offset));

    res.json({ success: true, sessions });
  } catch (error) {
    next(error);
  }
});

export default router;

