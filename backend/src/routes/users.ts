import express from 'express';
import { authenticate, AuthRequest } from '../middleware/auth';
import { User } from '../models/User';
import { createError } from '../middleware/errorHandler';

const router = express.Router();

// Get current user profile
router.get('/me', authenticate, async (req: AuthRequest, res, next) => {
  try {
    const user = await User.findById(req.user?._id).select('-auth.accessToken -auth.refreshToken');
    if (!user) {
      throw createError('User not found', 404);
    }
    res.json({ success: true, user });
  } catch (error) {
    next(error);
  }
});

// Update user profile
router.put('/profile', authenticate, async (req: AuthRequest, res, next) => {
  try {
    const user = await User.findById(req.user?._id);
    if (!user) {
      throw createError('User not found', 404);
    }

    const { name, bio, headline, location, timezone, techStack, availability } = req.body;

    if (name) user.profile.name = name;
    if (bio) user.profile.bio = bio;
    if (headline) user.profile.headline = headline;
    if (location) user.profile.location = location;
    if (timezone) user.profile.timezone = timezone;
    if (techStack) user.techStack = techStack;
    if (availability) {
      if (availability.status) user.availability.status = availability.status;
      if (availability.lookingFor) user.availability.lookingFor = availability.lookingFor;
    }

    await user.save();
    res.json({ success: true, user });
  } catch (error) {
    next(error);
  }
});

// Get user by ID
router.get('/:id', authenticate, async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id)
      .select('-auth.accessToken -auth.refreshToken')
      .select('profile stats reputation availability techStack');
    
    if (!user) {
      throw createError('User not found', 404);
    }

    res.json({ success: true, user });
  } catch (error) {
    next(error);
  }
});

// Search users
router.get('/search', authenticate, async (req, res, next) => {
  try {
    const { q, languages, experience, limit = 20 } = req.query;

    const query: any = {
      'verification.status': 'verified',
      'availability.status': { $in: ['online', 'busy'] },
    };

    if (q) {
      query.$or = [
        { 'profile.name': { $regex: q, $options: 'i' } },
        { 'profile.github.username': { $regex: q, $options: 'i' } },
      ];
    }

    if (languages) {
      const langArray = Array.isArray(languages) ? languages : [languages];
      query['techStack.language'] = { $in: langArray };
    }

    if (experience) {
      query['techStack.experience.level'] = experience;
    }

    const users = await User.find(query)
      .select('profile stats reputation availability techStack')
      .limit(Number(limit));

    res.json({ success: true, users });
  } catch (error) {
    next(error);
  }
});

// Update availability
router.post('/availability', authenticate, async (req: AuthRequest, res, next) => {
  try {
    const user = await User.findById(req.user?._id);
    if (!user) {
      throw createError('User not found', 404);
    }

    const { status, lookingFor } = req.body;
    if (status) user.availability.status = status;
    if (lookingFor) user.availability.lookingFor = lookingFor;

    user.lastActive = new Date();
    await user.save();

    res.json({ success: true, availability: user.availability });
  } catch (error) {
    next(error);
  }
});

// Get user stats
router.get('/:id/stats', authenticate, async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id).select('stats');
    if (!user) {
      throw createError('User not found', 404);
    }

    res.json({ success: true, stats: user.stats });
  } catch (error) {
    next(error);
  }
});

// Update settings
router.put('/settings', authenticate, async (req: AuthRequest, res, next) => {
  try {
    const user = await User.findById(req.user?._id);
    if (!user) {
      throw createError('User not found', 404);
    }

    if (req.body.settings) {
      user.settings = { ...user.settings, ...req.body.settings };
    }

    await user.save();
    res.json({ success: true, settings: user.settings });
  } catch (error) {
    next(error);
  }
});

export default router;

