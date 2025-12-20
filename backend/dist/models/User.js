import mongoose, { Schema } from 'mongoose';
const UserSchema = new Schema({
    auth: {
        github: {
            id: String,
            username: String,
            accessToken: String,
            refreshToken: String,
        },
        linkedin: {
            id: String,
            accessToken: String,
            refreshToken: String,
        },
        gitlab: {
            id: String,
            accessToken: String,
        },
    },
    verification: {
        status: {
            type: String,
            enum: ['pending', 'verified', 'rejected', 'flagged'],
            default: 'pending',
        },
        score: { type: Number, min: 0, max: 100, default: 0 },
        methods: [
            {
                provider: String,
                verifiedAt: Date,
                data: Schema.Types.Mixed,
            },
        ],
        quizScore: Number,
        reviewedBy: { type: Schema.Types.ObjectId, ref: 'User' },
    },
    profile: {
        name: String,
        email: { type: String, unique: true, sparse: true },
        avatar: String,
        headline: String,
        bio: String,
        location: String,
        timezone: String,
        github: {
            username: String,
            publicRepos: Number,
            followers: Number,
            following: Number,
            stars: Number,
            languages: Map,
            topRepos: [
                {
                    name: String,
                    description: String,
                    language: String,
                    stars: Number,
                    url: String,
                },
            ],
        },
        linkedin: {
            profileUrl: String,
            currentRole: String,
            company: String,
            skills: [String],
            endorsements: Number,
        },
    },
    techStack: [
        {
            language: String,
            frameworks: [String],
            experience: {
                years: Number,
                level: { type: String, enum: ['beginner', 'intermediate', 'expert'] },
            },
            confidence: Number,
            lastUsed: Date,
            verifiedBy: [{ type: Schema.Types.ObjectId, ref: 'User' }],
        },
    ],
    stats: {
        sessions: {
            total: { type: Number, default: 0 },
            completed: { type: Number, default: 0 },
            averageDuration: { type: Number, default: 0 },
            totalTime: { type: Number, default: 0 },
        },
        ratings: {
            average: { type: Number, default: 0 },
            count: { type: Number, default: 0 },
            breakdown: {
                technical: { type: Number, default: 0 },
                communication: { type: Number, default: 0 },
                helpfulness: { type: Number, default: 0 },
            },
        },
        reputation: {
            points: { type: Number, default: 0 },
            level: {
                type: String,
                enum: ['new', 'verified', 'trusted', 'ambassador'],
                default: 'new',
            },
            badges: [String],
        },
    },
    availability: {
        status: {
            type: String,
            enum: ['online', 'busy', 'away', 'offline'],
            default: 'offline',
        },
        lookingFor: [String],
        hours: {
            timezone: String,
            preferredTimes: [
                {
                    day: String,
                    start: String,
                    end: String,
                },
            ],
        },
    },
    limits: {
        dailySessions: { type: Number, default: 2 },
        sessionsUsed: { type: Number, default: 0 },
        resetDate: { type: Date, default: Date.now },
        maxSessionDuration: { type: Number, default: 60 },
    },
    settings: {
        notifications: {
            email: { type: Boolean, default: true },
            push: { type: Boolean, default: true },
            matchFound: { type: Boolean, default: true },
            sessionReminders: { type: Boolean, default: true },
        },
        privacy: {
            showGitHubStats: { type: Boolean, default: true },
            showLinkedInProfile: { type: Boolean, default: true },
            appearAnonymous: { type: Boolean, default: false },
            allowRecordings: { type: Boolean, default: false },
        },
        editor: {
            theme: { type: String, default: 'vs-dark' },
            fontSize: { type: Number, default: 14 },
            fontFamily: String,
            formatOnSave: { type: Boolean, default: true },
        },
    },
    lastActive: { type: Date, default: Date.now },
}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
});
// Indexes
UserSchema.index({ 'profile.email': 1 });
UserSchema.index({ 'verification.status': 1 });
UserSchema.index({ 'availability.status': 1 });
UserSchema.index({ 'stats.reputation.points': -1 });
export const User = mongoose.model('User', UserSchema);
//# sourceMappingURL=User.js.map