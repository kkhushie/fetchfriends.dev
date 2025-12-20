interface GitHubData {
    public_repos: number;
    followers: number;
    created_at: string;
    login: string;
}
interface GitHubRepo {
    name: string;
    description: string;
    language: string;
    stargazers_count: number;
    html_url: string;
}
interface LinkedInData {
    firstName: string;
    lastName: string;
    headline?: string;
    positions?: Array<{
        title: string;
        companyName: string;
    }>;
}
export declare class VerificationService {
    /**
     * Calculate verification score based on GitHub data
     */
    static calculateGitHubScore(githubData: GitHubData, repos: GitHubRepo[], accessToken: string): Promise<number>;
    /**
     * Calculate verification score based on LinkedIn data
     */
    static calculateLinkedInScore(linkedinData: LinkedInData): number;
    /**
     * Fetch GitHub repositories
     */
    static fetchGitHubRepos(username: string, accessToken: string): Promise<GitHubRepo[]>;
    /**
     * Get account age in months
     */
    private static getAccountAge;
    /**
     * Calculate overall verification score (requires 2+ methods)
     */
    static calculateOverallScore(scores: number[]): number;
    /**
     * Determine verification status based on score
     */
    static getVerificationStatus(score: number): 'pending' | 'verified' | 'rejected' | 'flagged';
}
export {};
//# sourceMappingURL=verification.d.ts.map