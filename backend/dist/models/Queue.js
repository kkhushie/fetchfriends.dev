import mongoose, { Schema } from 'mongoose';
const QueueSchema = new Schema({
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    mode: {
        type: String,
        enum: ['random', 'skill', 'goal'],
        required: true,
    },
    params: {
        languages: [String],
        experience: String,
        goals: [String],
        maxWaitTime: { type: Number, default: 180 },
    },
    status: {
        type: String,
        enum: ['waiting', 'matching', 'matched', 'cancelled', 'timeout'],
        default: 'waiting',
    },
    match: {
        sessionId: { type: Schema.Types.ObjectId, ref: 'Session' },
        matchedWith: [{ type: Schema.Types.ObjectId, ref: 'User' }],
        score: Number,
        matchedAt: Date,
    },
    position: { type: Number, default: 0 },
    waitStart: { type: Date, default: Date.now },
    estimatedWait: { type: Number, default: 0 },
    socketId: String,
    heartbeat: { type: Date, default: Date.now },
}, {
    timestamps: true,
});
// Indexes
QueueSchema.index({ user: 1, status: 1 });
QueueSchema.index({ status: 1, mode: 1 });
QueueSchema.index({ waitStart: 1 });
export const Queue = mongoose.model('Queue', QueueSchema);
//# sourceMappingURL=Queue.js.map