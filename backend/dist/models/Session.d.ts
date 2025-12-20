import mongoose, { Document } from 'mongoose';
export interface ISession extends Document {
    roomId: string;
    matchType: 'random' | 'skill' | 'goal' | 'invite';
    participants: Array<{
        user: mongoose.Types.ObjectId;
        joinedAt: Date;
        leftAt?: Date;
        role: 'learner' | 'teacher' | 'collaborator';
    }>;
    status: 'waiting' | 'active' | 'paused' | 'completed' | 'ended_early' | 'reported';
    startTime?: Date;
    endTime?: Date;
    duration: number;
    topic?: string;
    goals: string[];
    language?: string;
    collaboration: {
        editor: {
            files: Array<{
                name: string;
                language: string;
                content: string;
                changes: Array<{
                    user: mongoose.Types.ObjectId;
                    change: any;
                    timestamp: Date;
                }>;
            }>;
        };
        terminal: {
            commands: Array<{
                user: mongoose.Types.ObjectId;
                command: string;
                output: string;
                timestamp: Date;
            }>;
        };
        whiteboard: {
            elements: Array<{
                type: string;
                data: any;
                createdBy: mongoose.Types.ObjectId;
                timestamp: Date;
            }>;
        };
        chat: Array<{
            user: mongoose.Types.ObjectId;
            message: string;
            type: 'text' | 'code' | 'link' | 'file';
            metadata?: any;
            timestamp: Date;
        }>;
        resources: Array<{
            type: 'gist' | 'file' | 'link' | 'snippet';
            url: string;
            title: string;
            description?: string;
            sharedBy: mongoose.Types.ObjectId;
            timestamp: Date;
        }>;
    };
    recording?: {
        enabled: boolean;
        url?: string;
        storageKey?: string;
        expiresAt?: Date;
    };
    feedback: Array<{
        from: mongoose.Types.ObjectId;
        to: mongoose.Types.ObjectId;
        rating: number;
        comments?: string;
        skillsEndorsed: string[];
        wouldConnectAgain: boolean;
        reported: boolean;
        reportReason?: string;
        createdAt: Date;
    }>;
    analytics: {
        totalCodeChanges: number;
        chatMessages: number;
        resourcesShared: number;
        engagementScore: number;
    };
    metadata: {
        ipAddresses: string[];
        userAgents: string[];
        region?: string;
    };
    createdAt: Date;
    updatedAt: Date;
}
export declare const Session: any;
//# sourceMappingURL=Session.d.ts.map