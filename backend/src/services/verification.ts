import axios from 'axios';
import { IUser } from '../models/User';

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

export class VerificationService {
  /**
   * Calculate verification score based on GitHub data
   */
  static async calculateGitHubScore(
    githubData: GitHubData,
    repos: GitHubRepo[],
    accessToken: string
  ): Promise<number> {
    let score = 0;

    // Account age (max 20 points)
    const accountAge = this.getAccountAge(githubData.created_at);
    score += Math.min(accountAge / 3, 20); // 3 months = 20 points

    // Repository count (max 30 points)
    const repoScore = Math.min(githubData.public_repos * 3, 30);
    score += repoScore;

    // Followers (max 15 points)
    const followerScore = Math.min(githubData.followers * 0.5, 15);
    score += followerScore;

    // Stars on repos (max 20 points)
    const totalStars = repos.reduce((sum, repo) => sum + repo.stargazers_count, 0);
    const starScore = Math.min(totalStars * 0.1, 20);
    score += starScore;

    // Language diversity (max 15 points)
    const languages = new Set(repos.map((r) => r.language).filter(Boolean));
    const languageScore = Math.min(languages.size * 3, 15);
    score += languageScore;

    return Math.min(Math.round(score), 100);
  }

  /**
   * Calculate verification score based on LinkedIn data
   */
  static calculateLinkedInScore(linkedinData: LinkedInData): number {
    let score = 0;

    // Profile completeness (max 30 points)
    if (linkedinData.firstName && linkedinData.lastName) score += 10;
    if (linkedinData.headline) score += 10;
    if (linkedinData.positions && linkedinData.positions.length > 0) score += 10;

    // Tech-related keywords in headline (max 30 points)
    const techKeywords = [
      'developer',
      'engineer',
      'programmer',
      'software',
      'tech',
      'coding',
      'javascript',
      'python',
      'react',
      'node',
    ];
    const headlineLower = (linkedinData.headline || '').toLowerCase();
    const keywordMatches = techKeywords.filter((keyword) =>
      headlineLower.includes(keyword)
    ).length;
    score += Math.min(keywordMatches * 5, 30);

    // Current position (max 20 points)
    if (linkedinData.positions && linkedinData.positions.length > 0) {
      const currentPosition = linkedinData.positions[0];
      if (currentPosition.title) score += 10;
      if (currentPosition.companyName) score += 10;
    }

    // Account verification (max 20 points) - would need LinkedIn API
    // For now, assume verified if we have data
    score += 20;

    return Math.min(Math.round(score), 100);
  }

  /**
   * Fetch GitHub repositories
   */
  static async fetchGitHubRepos(
    username: string,
    accessToken: string
  ): Promise<GitHubRepo[]> {
    try {
      const response = await axios.get(
        `https://api.github.com/users/${username}/repos?sort=updated&per_page=10`,
        {
          headers: {
            Authorization: `token ${accessToken}`,
            Accept: 'application/vnd.github.v3+json',
          },
        }
      );
      return response.data;
    } catch (error) {
      console.error('Error fetching GitHub repos:', error);
      return [];
    }
  }

  /**
   * Get account age in months
   */
  private static getAccountAge(createdAt: string): number {
    const created = new Date(createdAt);
    const now = new Date();
    const months = (now.getTime() - created.getTime()) / (1000 * 60 * 60 * 24 * 30);
    return Math.floor(months);
  }

  /**
   * Calculate overall verification score (requires 2+ methods)
   */
  static calculateOverallScore(scores: number[]): number {
    if (scores.length < 2) {
      return 0; // Need at least 2 verification methods
    }

    // Average of all scores
    const average = scores.reduce((sum, score) => sum + score, 0) / scores.length;

    // Bonus for having multiple methods
    const bonus = scores.length > 2 ? 10 : 0;

    return Math.min(Math.round(average + bonus), 100);
  }

  /**
   * Determine verification status based on score
   */
  static getVerificationStatus(score: number): 'pending' | 'verified' | 'rejected' | 'flagged' {
    if (score >= 80) return 'verified';
    if (score >= 60) return 'pending'; // Needs quiz
    if (score >= 40) return 'flagged'; // Needs manual review
    return 'rejected';
  }
}

