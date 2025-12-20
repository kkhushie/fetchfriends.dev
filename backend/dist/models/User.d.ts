import mongoose, { Document } from 'mongoose';
export interface IUser extends Document {
    auth: {
        github?: {
            id: string;
            username: string;
            accessToken: string;
            refreshToken?: string;
        };
        linkedin?: {
            id: string;
            accessToken: string;
            refreshToken?: string;
        };
        gitlab?: {
            id: string;
            accessToken: string;
        };
    };
    verification: {
        status: 'pending' | 'verified' | 'rejected' | 'flagged';
        score: number;
        methods: Array<{
            provider: string;
            verifiedAt: Date;
            data: any;
        }>;
        quizScore?: number;
        reviewedBy?: mongoose.Types.ObjectId;
    };
    profile: {
        name: string;
        email: string;
        avatar?: string;
        headline?: string;
        bio?: string;
        location?: string;
        timezone?: string;
        github?: {
            username: string;
            publicRepos: number;
            followers: number;
            following: number;
            stars: number;
            languages: Map<string, number>;
            topRepos: Array<{
                name: string;
                description: string;
                language: string;
                stars: number;
                url: string;
            }>;
        };
        linkedin?: {
            profileUrl: string;
            currentRole?: string;
            company?: string;
            skills: string[];
            endorsements: number;
        };
    };
    techStack: Array<{
        language: string;
        frameworks: string[];
        experience: {
            years: number;
            level: 'beginner' | 'intermediate' | 'expert';
        };
        confidence: number;
        lastUsed: Date;
        verifiedBy: mongoose.Types.ObjectId[];
    }>;
    stats: {
        sessions: {
            total: number;
            completed: number;
            averageDuration: number;
            totalTime: number;
        };
        ratings: {
            average: number;
            count: number;
            breakdown: {
                technical: number;
                communication: number;
                helpfulness: number;
            };
        };
        reputation: {
            points: number;
            level: 'new' | 'verified' | 'trusted' | 'ambassador';
            badges: string[];
        };
    };
    availability: {
        status: 'online' | 'busy' | 'away' | 'offline';
        lookingFor: string[];
        hours: {
            timezone: string;
            preferredTimes: Array<{
                day: string;
                start: string;
                end: string;
            }>;
        };
    };
    limits: {
        dailySessions: number;
        sessionsUsed: number;
        resetDate: Date;
        maxSessionDuration: number;
    };
    settings: {
        notifications: {
            email: boolean;
            push: boolean;
            matchFound: boolean;
            sessionReminders: boolean;
        };
        privacy: {
            showGitHubStats: boolean;
            showLinkedInProfile: boolean;
            appearAnonymous: boolean;
            allowRecordings: boolean;
        };
        editor: {
            theme: string;
            fontSize: number;
            fontFamily?: string;
            formatOnSave: boolean;
        };
    };
    lastActive: Date;
    createdAt: Date;
    updatedAt: Date;
}
export declare const User: any;
//# sourceMappingURL=User.d.ts.map