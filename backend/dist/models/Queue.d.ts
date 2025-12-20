import mongoose, { Document } from 'mongoose';
export interface IQueue extends Document {
    user: mongoose.Types.ObjectId;
    mode: 'random' | 'skill' | 'goal';
    params: {
        languages: string[];
        experience?: string;
        goals: string[];
        maxWaitTime: number;
    };
    status: 'waiting' | 'matching' | 'matched' | 'cancelled' | 'timeout';
    match?: {
        sessionId: mongoose.Types.ObjectId;
        matchedWith: mongoose.Types.ObjectId[];
        score: number;
        matchedAt: Date;
    };
    position: number;
    waitStart: Date;
    estimatedWait: number;
    socketId: string;
    heartbeat: Date;
    createdAt: Date;
    updatedAt: Date;
}
export declare const Queue: any;
//# sourceMappingURL=Queue.d.ts.map