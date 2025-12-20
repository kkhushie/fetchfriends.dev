export declare class MatchingService {
    /**
     * Find a match for a queue entry
     */
    static findMatch(queueId: string): Promise<void>;
    /**
     * Random matching (FIFO)
     */
    private static findRandomMatch;
    /**
     * Skill-based matching
     */
    private static findSkillMatch;
    /**
     * Goal-based matching
     */
    private static findGoalMatch;
    /**
     * Calculate skill similarity score
     */
    private static calculateSkillSimilarity;
    /**
     * Calculate goal compatibility
     */
    private static calculateGoalCompatibility;
    /**
     * Get average experience level (0-3)
     */
    private static getAverageExperience;
    /**
     * Create a session from matched queues
     */
    private static createSession;
    /**
     * Estimate wait time for a queue mode
     */
    static estimateWaitTime(mode: string): Promise<number>;
}
//# sourceMappingURL=matching.d.ts.map