import { Queue } from '../models/Queue';
import { Session } from '../models/Session';
import { User } from '../models/User';
import { redisClient } from '../config/redis';
import { randomBytes } from 'crypto';

export class MatchingService {
  /**
   * Find a match for a queue entry
   */
  static async findMatch(queueId: string): Promise<void> {
    const queue = await Queue.findById(queueId);
    if (!queue || queue.status !== 'waiting') {
      return;
    }

    queue.status = 'matching';
    await queue.save();

    try {
      let match: any = null;

      switch (queue.mode) {
        case 'random':
          match = await this.findRandomMatch(queue);
          break;
        case 'skill':
          match = await this.findSkillMatch(queue);
          break;
        case 'goal':
          match = await this.findGoalMatch(queue);
          break;
      }

      if (match) {
        await this.createSession(queue, match);
      } else {
        // No match found, keep in queue
        queue.status = 'waiting';
        await queue.save();
      }
    } catch (error) {
      console.error('Matching error:', error);
      queue.status = 'waiting';
      await queue.save();
    }
  }

  /**
   * Random matching (FIFO)
   */
  private static async findRandomMatch(queue: any): Promise<any> {
    const otherQueues = await Queue.find({
      _id: { $ne: queue._id },
      mode: 'random',
      status: 'waiting',
      'params.maxWaitTime': { $gte: 60 }, // Still have time
    })
      .sort({ waitStart: 1 })
      .limit(1);

    if (otherQueues.length > 0) {
      return {
        queue: otherQueues[0],
        score: 50, // Random match gets base score
      };
    }

    return null;
  }

  /**
   * Skill-based matching
   */
  private static async findSkillMatch(queue: any): Promise<any> {
    const user = await User.findById(queue.user);
    if (!user) return null;

    const userLanguages = queue.params.languages || [];
    const userExperience = queue.params.experience;

    // Find users with similar tech stack
    const candidates = await Queue.find({
      _id: { $ne: queue._id },
      mode: 'skill',
      status: 'waiting',
      'params.languages': { $in: userLanguages },
    }).limit(10);

    let bestMatch: any = null;
    let bestScore = 0;

    for (const candidate of candidates) {
      const candidateUser = await User.findById(candidate.user);
      if (!candidateUser) continue;

      const score = this.calculateSkillSimilarity(user, candidateUser, userLanguages);
      if (score > bestScore && score >= 60) {
        bestScore = score;
        bestMatch = { queue: candidate, score };
      }
    }

    return bestMatch;
  }

  /**
   * Goal-based matching
   */
  private static async findGoalMatch(queue: any): Promise<any> {
    const user = await User.findById(queue.user);
    if (!user) return null;

    const userGoals = queue.params.goals || [];

    // Find reciprocal matches (learner ↔ teacher)
    const candidates = await Queue.find({
      _id: { $ne: queue._id },
      mode: 'goal',
      status: 'waiting',
      'params.goals': { $in: userGoals },
    }).limit(10);

    let bestMatch: any = null;
    let bestScore = 0;

    for (const candidate of candidates) {
      const candidateUser = await User.findById(candidate.user);
      if (!candidateUser) continue;

      const score = this.calculateGoalCompatibility(user, candidateUser, userGoals);
      if (score > bestScore && score >= 60) {
        bestScore = score;
        bestMatch = { queue: candidate, score };
      }
    }

    return bestMatch;
  }

  /**
   * Calculate skill similarity score
   */
  private static calculateSkillSimilarity(
    user1: any,
    user2: any,
    languages: string[]
  ): number {
    let score = 0;

    // Language overlap (40%)
    const user1Langs = new Set(user1.techStack.map((t: any) => t.language));
    const user2Langs = new Set(user2.techStack.map((t: any) => t.language));
    const overlap = [...user1Langs].filter((lang) => user2Langs.has(lang));
    const languageScore = (overlap.length / Math.max(user1Langs.size, user2Langs.size)) * 40;
    score += languageScore;

    // Experience level (30%)
    const user1AvgExp = this.getAverageExperience(user1);
    const user2AvgExp = this.getAverageExperience(user2);
    const expDiff = Math.abs(user1AvgExp - user2AvgExp);
    const expScore = Math.max(0, 30 - expDiff * 10);
    score += expScore;

    // GitHub activity (20%)
    const user1Activity = user1.profile.github?.stars || 0;
    const user2Activity = user2.profile.github?.stars || 0;
    const activityScore = Math.min(20, (Math.min(user1Activity, user2Activity) / 100) * 20);
    score += activityScore;

    // Timezone proximity (10%)
    const tzScore = 10; // Simplified
    score += tzScore;

    return Math.round(score);
  }

  /**
   * Calculate goal compatibility
   */
  private static calculateGoalCompatibility(
    user1: any,
    user2: any,
    goals: string[]
  ): number {
    let score = 0;

    // Reciprocal matching (learner ↔ teacher)
    const user1LookingFor = user1.availability.lookingFor || [];
    const user2LookingFor = user2.availability.lookingFor || [];

    const hasReciprocal = 
      (user1LookingFor.includes('learn') && user2LookingFor.includes('teach')) ||
      (user1LookingFor.includes('teach') && user2LookingFor.includes('learn'));

    if (hasReciprocal) {
      score += 50;
    }

    // Shared goals
    const sharedGoals = goals.filter((g) => user2LookingFor.includes(g));
    score += sharedGoals.length * 10;

    // Tech stack overlap
    const user1Langs = new Set(user1.techStack.map((t: any) => t.language));
    const user2Langs = new Set(user2.techStack.map((t: any) => t.language));
    const overlap = [...user1Langs].filter((lang) => user2Langs.has(lang));
    score += Math.min(30, overlap.length * 10);

    return Math.min(100, Math.round(score));
  }

  /**
   * Get average experience level (0-3)
   */
  private static getAverageExperience(user: any): number {
    if (!user.techStack || user.techStack.length === 0) return 1;

    const levels = { beginner: 1, intermediate: 2, expert: 3 };
    const avg = user.techStack.reduce((sum: number, tech: any) => {
      return sum + (levels[tech.experience?.level as keyof typeof levels] || 1);
    }, 0) / user.techStack.length;

    return avg;
  }

  /**
   * Create a session from matched queues
   */
  private static async createSession(queue1: any, match: any): Promise<void> {
    const queue2 = match.queue;

    const roomId = randomBytes(16).toString('hex');
    const session = new Session({
      roomId,
      matchType: queue1.mode,
      participants: [
        {
          user: queue1.user,
          joinedAt: new Date(),
          role: 'collaborator',
        },
        {
          user: queue2.user,
          joinedAt: new Date(),
          role: 'collaborator',
        },
      ],
      status: 'waiting',
      goals: queue1.params.goals || [],
      language: queue1.params.languages?.[0],
    });

    await session.save();

    // Update queues
    queue1.status = 'matched';
    queue1.match = {
      sessionId: session._id,
      matchedWith: [queue2.user],
      score: match.score,
      matchedAt: new Date(),
    };
    await queue1.save();

    queue2.status = 'matched';
    queue2.match = {
      sessionId: session._id,
      matchedWith: [queue1.user],
      score: match.score,
      matchedAt: new Date(),
    };
    await queue2.save();

    // Remove from Redis queues
    await redisClient.lRem(`queue:${queue1.mode}`, 0, queue1._id.toString());
    await redisClient.lRem(`queue:${queue2.mode}`, 0, queue2._id.toString());
  }

  /**
   * Estimate wait time for a queue mode
   */
  static async estimateWaitTime(mode: string): Promise<number> {
    const queueLength = await redisClient.lLen(`queue:${mode}`);
    // Rough estimate: 30 seconds per person in queue
    return queueLength * 30;
  }
}

