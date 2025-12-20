import express from 'express';
import { authenticate } from '../middleware/auth';
import { Session } from '../models/Session';
import { User } from '../models/User';
import { createError } from '../middleware/errorHandler';
const router = express.Router();
// Submit feedback for a session
router.post('/:sessionId', authenticate, async (req, res, next) => {
    try {
        const session = await Session.findById(req.params.sessionId);
        const userId = req.user?._id.toString();
        if (!session) {
            throw createError('Session not found', 404);
        }
        const { to, rating, comments, skillsEndorsed, wouldConnectAgain, reported, reportReason } = req.body;
        // Find the other participant
        const otherParticipant = session.participants.find((p) => p.user.toString() !== userId);
        if (!otherParticipant) {
            throw createError('Other participant not found', 404);
        }
        // Check if feedback already exists
        const existingFeedback = session.feedback.find((f) => f.from.toString() === userId && f.to.toString() === otherParticipant.user.toString());
        if (existingFeedback) {
            throw createError('Feedback already submitted', 400);
        }
        // Add feedback
        session.feedback.push({
            from: userId,
            to: otherParticipant.user,
            rating: rating || 5,
            comments,
            skillsEndorsed: skillsEndorsed || [],
            wouldConnectAgain: wouldConnectAgain || false,
            reported: reported || false,
            reportReason,
            createdAt: new Date(),
        });
        await session.save();
        // Update user stats
        const targetUser = await User.findById(otherParticipant.user);
        if (targetUser) {
            const allRatings = targetUser.stats.ratings.count;
            const currentAverage = targetUser.stats.ratings.average;
            const newAverage = (currentAverage * allRatings + rating) / (allRatings + 1);
            targetUser.stats.ratings.average = newAverage;
            targetUser.stats.ratings.count += 1;
            targetUser.stats.ratings.breakdown.technical += rating;
            targetUser.stats.ratings.breakdown.communication += rating;
            targetUser.stats.ratings.breakdown.helpfulness += rating;
            // Update reputation points
            targetUser.stats.reputation.points += 10; // Base points per session
            if (rating >= 4) {
                targetUser.stats.reputation.points += 5; // Bonus for good rating
            }
            // Update reputation level
            if (targetUser.stats.reputation.points >= 2000) {
                targetUser.stats.reputation.level = 'ambassador';
            }
            else if (targetUser.stats.reputation.points >= 500) {
                targetUser.stats.reputation.level = 'trusted';
            }
            else if (targetUser.stats.reputation.points >= 100) {
                targetUser.stats.reputation.level = 'verified';
            }
            await targetUser.save();
        }
        res.json({ success: true, message: 'Feedback submitted' });
    }
    catch (error) {
        next(error);
    }
});
// Get feedback received
router.get('/received', authenticate, async (req, res, next) => {
    try {
        const userId = req.user?._id.toString();
        const { limit = 20, offset = 0 } = req.query;
        const sessions = await Session.find({
            'participants.user': userId,
            'feedback.to': userId,
        })
            .populate('feedback.from', 'profile.name profile.avatar')
            .populate('participants.user', 'profile.name')
            .sort({ 'feedback.createdAt': -1 })
            .limit(Number(limit))
            .skip(Number(offset));
        const feedback = sessions.flatMap((session) => session.feedback
            .filter((f) => f.to.toString() === userId)
            .map((f) => ({
            ...f.toObject(),
            sessionId: session._id,
            sessionTopic: session.topic,
        })));
        res.json({ success: true, feedback });
    }
    catch (error) {
        next(error);
    }
});
// Get feedback given
router.get('/given', authenticate, async (req, res, next) => {
    try {
        const userId = req.user?._id.toString();
        const { limit = 20, offset = 0 } = req.query;
        const sessions = await Session.find({
            'feedback.from': userId,
        })
            .populate('feedback.to', 'profile.name profile.avatar')
            .populate('participants.user', 'profile.name')
            .sort({ 'feedback.createdAt': -1 })
            .limit(Number(limit))
            .skip(Number(offset));
        const feedback = sessions.flatMap((session) => session.feedback
            .filter((f) => f.from.toString() === userId)
            .map((f) => ({
            ...f.toObject(),
            sessionId: session._id,
            sessionTopic: session.topic,
        })));
        res.json({ success: true, feedback });
    }
    catch (error) {
        next(error);
    }
});
export default router;
//# sourceMappingURL=feedback.js.map