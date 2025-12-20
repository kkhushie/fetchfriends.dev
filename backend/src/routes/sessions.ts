import express from 'express';
import { authenticate, AuthRequest } from '../middleware/auth';
import { Session } from '../models/Session';
import { User } from '../models/User';
import { createError } from '../middleware/errorHandler';
import { body, param, query, validationResult } from 'express-validator';

const router = express.Router();

// Validation middleware
const validateSessionId = [param('id').isMongoId().withMessage('Invalid session ID')];
const validateRoomId = [param('roomId').isString().notEmpty().withMessage('Room ID is required')];

// Get session by ID
router.get('/:id', authenticate, ...validateSessionId, async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const session = await Session.findById(req.params.id)
      .populate('participants.user', 'profile.name profile.avatar stats.reputation stats.ratings');

    if (!session) {
      throw createError('Session not found', 404);
    }

    // Check if user is a participant
    const userId = (req as AuthRequest).user?._id.toString();
    const isParticipant = session.participants.some(
      (p) => p.user.toString() === userId
    );

    if (!isParticipant) {
      throw createError('Not authorized to view this session', 403);
    }

    res.json({ success: true, session });
  } catch (error) {
    next(error);
  }
});

// Get session by roomId
router.get('/room/:roomId', authenticate, ...validateRoomId, async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const session = await Session.findOne({ roomId: req.params.roomId })
      .populate('participants.user', 'profile.name profile.avatar stats.reputation');

    if (!session) {
      throw createError('Session not found', 404);
    }

    // Check if user is a participant
    const userId = (req as AuthRequest).user?._id.toString();
    const isParticipant = session.participants.some(
      (p) => p.user.toString() === userId
    );

    if (!isParticipant) {
      throw createError('Not authorized to view this session', 403);
    }

    res.json({ success: true, session });
  } catch (error) {
    next(error);
  }
});

// Get active sessions for current user
router.get('/active', authenticate, async (req: AuthRequest, res, next) => {
  try {
    const userId = req.user?._id.toString();

    const sessions = await Session.find({
      'participants.user': userId,
      status: { $in: ['waiting', 'active', 'paused'] },
    })
      .populate('participants.user', 'profile.name profile.avatar')
      .sort({ startTime: -1 });

    res.json({ success: true, sessions });
  } catch (error) {
    next(error);
  }
});

// Join session
router.post('/:id/join', authenticate, ...validateSessionId, async (req: AuthRequest, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }
    const session = await Session.findById(req.params.id);
    const userId = req.user?._id.toString();

    if (!session) {
      throw createError('Session not found', 404);
    }

    // Check if user is already a participant
    const isParticipant = session.participants.some(
      (p) => p.user.toString() === userId
    );

    if (!isParticipant) {
      throw createError('Not authorized to join this session', 403);
    }

    // Update participant joined time
    const participant = session.participants.find(
      (p) => p.user.toString() === userId
    );
    if (participant) {
      participant.joinedAt = new Date();
    }

    if (session.status === 'waiting') {
      session.status = 'active';
      session.startTime = new Date();
    }

    await session.save();
    res.json({ success: true, session });
  } catch (error) {
    next(error);
  }
});

// Leave session
router.post('/:id/leave', authenticate, ...validateSessionId, async (req: AuthRequest, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }
    const session = await Session.findById(req.params.id);
    const userId = req.user?._id.toString();

    if (!session) {
      throw createError('Session not found', 404);
    }

    const participant = session.participants.find(
      (p) => p.user.toString() === userId
    );

    if (participant) {
      participant.leftAt = new Date();
    }

    // If all participants left, end session
    if (session.participants.every((p) => p.leftAt)) {
      session.status = 'completed';
      session.endTime = new Date();
      session.duration = Math.floor(
        ((session.endTime.getTime() - (session.startTime?.getTime() || Date.now())) / 1000 / 60)
      );
    }

    await session.save();
    res.json({ success: true, message: 'Left session' });
  } catch (error) {
    next(error);
  }
});

// Extend session
router.post(
  '/:id/extend',
  authenticate,
  ...validateSessionId,
  body('minutes').optional().isInt({ min: 1, max: 60 }).withMessage('Minutes must be between 1 and 60'),
  async (req: AuthRequest, res, next) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ success: false, errors: errors.array() });
      }

      const session = await Session.findById(req.params.id);
      const userId = req.user?._id.toString();

      if (!session) {
        throw createError('Session not found', 404);
      }

      const isParticipant = session.participants.some(
        (p) => p.user.toString() === userId
      );

      if (!isParticipant) {
        throw createError('Not authorized', 403);
      }

      if (session.status !== 'active') {
        throw createError('Session must be active to extend', 400);
      }

      // Extend session by adding minutes to duration
      const extensionMinutes = req.body.minutes || 15;
      // Note: In a real implementation, you'd track a planned end time
      // For now, we'll just update the duration when session ends

      res.json({
        success: true,
        message: `Session extended by ${extensionMinutes} minutes`,
        extensionMinutes,
      });
    } catch (error) {
      next(error);
    }
  }
);

// Pause session
router.post('/:id/pause', authenticate, ...validateSessionId, async (req: AuthRequest, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const session = await Session.findById(req.params.id);
    const userId = req.user?._id.toString();

    if (!session) {
      throw createError('Session not found', 404);
    }

    const isParticipant = session.participants.some(
      (p) => p.user.toString() === userId
    );

    if (!isParticipant) {
      throw createError('Not authorized', 403);
    }

    if (session.status !== 'active') {
      throw createError('Session must be active to pause', 400);
    }

    session.status = 'paused';
    await session.save();

    res.json({ success: true, message: 'Session paused', session });
  } catch (error) {
    next(error);
  }
});

// Resume session
router.post('/:id/resume', authenticate, ...validateSessionId, async (req: AuthRequest, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const session = await Session.findById(req.params.id);
    const userId = req.user?._id.toString();

    if (!session) {
      throw createError('Session not found', 404);
    }

    const isParticipant = session.participants.some(
      (p) => p.user.toString() === userId
    );

    if (!isParticipant) {
      throw createError('Not authorized', 403);
    }

    if (session.status !== 'paused') {
      throw createError('Session must be paused to resume', 400);
    }

    session.status = 'active';
    await session.save();

    res.json({ success: true, message: 'Session resumed', session });
  } catch (error) {
    next(error);
  }
});

// Update session topic/goals
router.put(
  '/:id',
  authenticate,
  ...validateSessionId,
  body('topic').optional().isString().trim(),
  body('goals').optional().isArray(),
  body('language').optional().isString().trim(),
  async (req: AuthRequest, res, next) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ success: false, errors: errors.array() });
      }

      const session = await Session.findById(req.params.id);
      const userId = req.user?._id.toString();

      if (!session) {
        throw createError('Session not found', 404);
      }

      const isParticipant = session.participants.some(
        (p) => p.user.toString() === userId
      );

      if (!isParticipant) {
        throw createError('Not authorized', 403);
      }

      if (req.body.topic !== undefined) {
        session.topic = req.body.topic;
      }
      if (req.body.goals !== undefined) {
        session.goals = req.body.goals;
      }
      if (req.body.language !== undefined) {
        session.language = req.body.language;
      }

      await session.save();
      res.json({ success: true, session });
    } catch (error) {
      next(error);
    }
  }
);

// Start recording
router.post(
  '/:id/recording/start',
  authenticate,
  ...validateSessionId,
  async (req: AuthRequest, res, next) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ success: false, errors: errors.array() });
      }

      const session = await Session.findById(req.params.id);
      const userId = req.user?._id.toString();

      if (!session) {
        throw createError('Session not found', 404);
      }

      const isParticipant = session.participants.some(
        (p) => p.user.toString() === userId
      );

      if (!isParticipant) {
        throw createError('Not authorized', 403);
      }

      // Check if other participant allows recording
      const otherParticipant = session.participants.find(
        (p) => p.user.toString() !== userId
      );
      if (otherParticipant) {
        const otherUser = await User.findById(otherParticipant.user);
        if (otherUser && !otherUser.settings.privacy.allowRecordings) {
          throw createError('Other participant does not allow recording', 403);
        }
      }

      if (session.recording?.enabled) {
        throw createError('Recording already started', 400);
      }

      session.recording = {
        enabled: true,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
      };

      await session.save();
      res.json({ success: true, message: 'Recording started', session });
    } catch (error) {
      next(error);
    }
  }
);

// Stop recording
router.post(
  '/:id/recording/stop',
  authenticate,
  ...validateSessionId,
  async (req: AuthRequest, res, next) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ success: false, errors: errors.array() });
      }

      const session = await Session.findById(req.params.id);
      const userId = req.user?._id.toString();

      if (!session) {
        throw createError('Session not found', 404);
      }

      const isParticipant = session.participants.some(
        (p) => p.user.toString() === userId
      );

      if (!isParticipant) {
        throw createError('Not authorized', 403);
      }

      if (!session.recording?.enabled) {
        throw createError('Recording is not active', 400);
      }

      // In production, you would upload the recording to storage here
      // For now, we'll just mark it as stopped
      if (session.recording) {
        session.recording.enabled = false;
        // session.recording.url = uploadedUrl;
        // session.recording.storageKey = storageKey;
      }

      await session.save();
      res.json({ success: true, message: 'Recording stopped', session });
    } catch (error) {
      next(error);
    }
  }
);

// Save collaboration data (code, terminal, etc.)
router.post(
  '/:id/collaboration',
  authenticate,
  ...validateSessionId,
  body('type').isIn(['editor', 'terminal', 'whiteboard', 'chat', 'resource']).withMessage('Invalid collaboration type'),
  body('data').isObject().withMessage('Data is required'),
  async (req: AuthRequest, res, next) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ success: false, errors: errors.array() });
      }

      const session = await Session.findById(req.params.id);
      const userId = req.user?._id.toString();

      if (!session) {
        throw createError('Session not found', 404);
      }

      const isParticipant = session.participants.some(
        (p) => p.user.toString() === userId
      );

      if (!isParticipant) {
        throw createError('Not authorized', 403);
      }

      const { type, data } = req.body;

      switch (type) {
        case 'editor': {
          // Save code file
          const { file, content, change } = data;
          let fileEntry = session.collaboration.editor.files.find(
            (f) => f.name === file.name
          );

          if (fileEntry) {
            fileEntry.content = content || fileEntry.content;
            fileEntry.language = file.language || fileEntry.language;
            if (change) {
              fileEntry.changes.push({
                user: userId as any,
                change,
                timestamp: new Date(),
              });
              session.analytics.totalCodeChanges += 1;
            }
          } else {
            session.collaboration.editor.files.push({
              name: file.name,
              language: file.language || 'text',
              content: content || '',
              changes: change
                ? [
                    {
                      user: userId as any,
                      change,
                      timestamp: new Date(),
                    },
                  ]
                : [],
            });
          }
          break;
        }

        case 'terminal': {
          // Save terminal command
          const { command, output } = data;
          session.collaboration.terminal.commands.push({
            user: userId as any,
            command,
            output: output || '',
            timestamp: new Date(),
          });
          break;
        }

        case 'whiteboard': {
          // Save whiteboard element
          const { element } = data;
          session.collaboration.whiteboard.elements.push({
            type: element.type,
            data: element.data,
            createdBy: userId as any,
            timestamp: new Date(),
          });
          break;
        }

        case 'chat': {
          // Save chat message
          const { message, messageType, metadata } = data;
          session.collaboration.chat.push({
            user: userId as any,
            message,
            type: messageType || 'text',
            metadata: metadata || {},
            timestamp: new Date(),
          });
          session.analytics.chatMessages += 1;
          break;
        }

        case 'resource': {
          // Save shared resource
          const { resourceType, url, title, description } = data;
          session.collaboration.resources.push({
            type: resourceType,
            url,
            title,
            description,
            sharedBy: userId as any,
            timestamp: new Date(),
          });
          session.analytics.resourcesShared += 1;
          break;
        }
      }

      // Calculate engagement score
      const engagementScore =
        session.analytics.totalCodeChanges * 2 +
        session.analytics.chatMessages * 1 +
        session.analytics.resourcesShared * 3;
      session.analytics.engagementScore = engagementScore;

      await session.save();
      res.json({ success: true, message: 'Collaboration data saved' });
    } catch (error) {
      next(error);
    }
  }
);

// Get collaboration data
router.get('/:id/collaboration', authenticate, ...validateSessionId, async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const session = await Session.findById(req.params.id).select('collaboration');
    const userId = (req as AuthRequest).user?._id.toString();

    if (!session) {
      throw createError('Session not found', 404);
    }

    const isParticipant = session.participants.some(
      (p) => p.user.toString() === userId
    );

    if (!isParticipant) {
      throw createError('Not authorized', 403);
    }

    const { type } = req.query;

    if (type) {
      // Return specific collaboration type
      const collaborationData = {
        editor: session.collaboration.editor,
        terminal: session.collaboration.terminal,
        whiteboard: session.collaboration.whiteboard,
        chat: session.collaboration.chat,
        resources: session.collaboration.resources,
      }[type as string];

      if (!collaborationData) {
        throw createError('Invalid collaboration type', 400);
      }

      return res.json({ success: true, type, data: collaborationData });
    }

    // Return all collaboration data
    res.json({ success: true, collaboration: session.collaboration });
  } catch (error) {
    next(error);
  }
});

// Get session analytics
router.get('/:id/analytics', authenticate, ...validateSessionId, async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const session = await Session.findById(req.params.id).select('analytics metadata duration');
    const userId = (req as AuthRequest).user?._id.toString();

    if (!session) {
      throw createError('Session not found', 404);
    }

    const isParticipant = session.participants.some(
      (p) => p.user.toString() === userId
    );

    if (!isParticipant) {
      throw createError('Not authorized', 403);
    }

    res.json({
      success: true,
      analytics: session.analytics,
      duration: session.duration,
      metadata: session.metadata,
    });
  } catch (error) {
    next(error);
  }
});

// Get session history
router.get(
  '/history',
  authenticate,
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
  query('offset').optional().isInt({ min: 0 }).withMessage('Offset must be non-negative'),
  query('status').optional().isIn(['completed', 'ended_early', 'reported']).withMessage('Invalid status'),
  async (req: AuthRequest, res, next) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ success: false, errors: errors.array() });
      }

      const userId = req.user?._id.toString();
      const { limit = 20, offset = 0, status } = req.query;

      const query: any = {
        'participants.user': userId,
      };

      if (status) {
        query.status = status;
      } else {
        query.status = { $in: ['completed', 'ended_early', 'reported'] };
      }

      const sessions = await Session.find(query)
        .populate('participants.user', 'profile.name profile.avatar')
        .select('roomId matchType status startTime endTime duration topic goals language feedback analytics')
        .sort({ createdAt: -1 })
        .limit(Number(limit))
        .skip(Number(offset));

      const total = await Session.countDocuments(query);

      res.json({
        success: true,
        sessions,
        pagination: {
          total,
          limit: Number(limit),
          offset: Number(offset),
          hasMore: Number(offset) + sessions.length < total,
        },
      });
    } catch (error) {
      next(error);
    }
  }
);

// Delete session (only for own sessions or admin)
router.delete('/:id', authenticate, ...validateSessionId, async (req: AuthRequest, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const session = await Session.findById(req.params.id);
    const userId = req.user?._id.toString();

    if (!session) {
      throw createError('Session not found', 404);
    }

    const isParticipant = session.participants.some(
      (p) => p.user.toString() === userId
    );

    if (!isParticipant) {
      throw createError('Not authorized', 403);
    }

    // Only allow deletion if session is completed or ended early
    if (!['completed', 'ended_early', 'reported'].includes(session.status)) {
      throw createError('Cannot delete active session', 400);
    }

    await Session.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Session deleted' });
  } catch (error) {
    next(error);
  }
});

export default router;

