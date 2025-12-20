import mongoose, { Schema, Document } from 'mongoose';

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

const SessionSchema = new Schema<ISession>(
  {
    roomId: { type: String, unique: true, required: true },
    matchType: {
      type: String,
      enum: ['random', 'skill', 'goal', 'invite'],
      required: true,
    },
    participants: [
      {
        user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
        joinedAt: { type: Date, default: Date.now },
        leftAt: Date,
        role: {
          type: String,
          enum: ['learner', 'teacher', 'collaborator'],
          default: 'collaborator',
        },
      },
    ],
    status: {
      type: String,
      enum: ['waiting', 'active', 'paused', 'completed', 'ended_early', 'reported'],
      default: 'waiting',
    },
    startTime: Date,
    endTime: Date,
    duration: { type: Number, default: 0 },
    topic: String,
    goals: [String],
    language: String,
    collaboration: {
      editor: {
        files: [
          {
            name: String,
            language: String,
            content: String,
            changes: [
              {
                user: { type: Schema.Types.ObjectId, ref: 'User' },
                change: Schema.Types.Mixed,
                timestamp: { type: Date, default: Date.now },
              },
            ],
          },
        ],
      },
      terminal: {
        commands: [
          {
            user: { type: Schema.Types.ObjectId, ref: 'User' },
            command: String,
            output: String,
            timestamp: { type: Date, default: Date.now },
          },
        ],
      },
      whiteboard: {
        elements: [
          {
            type: String,
            data: Schema.Types.Mixed,
            createdBy: { type: Schema.Types.ObjectId, ref: 'User' },
            timestamp: { type: Date, default: Date.now },
          },
        ],
      },
      chat: [
        {
          user: { type: Schema.Types.ObjectId, ref: 'User' },
          message: String,
          type: {
            type: String,
            enum: ['text', 'code', 'link', 'file'],
            default: 'text',
          },
          metadata: Schema.Types.Mixed,
          timestamp: { type: Date, default: Date.now },
        },
      ],
      resources: [
        {
          type: {
            type: String,
            enum: ['gist', 'file', 'link', 'snippet'],
          },
          url: String,
          title: String,
          description: String,
          sharedBy: { type: Schema.Types.ObjectId, ref: 'User' },
          timestamp: { type: Date, default: Date.now },
        },
      ],
    },
    recording: {
      enabled: { type: Boolean, default: false },
      url: String,
      storageKey: String,
      expiresAt: Date,
    },
    feedback: [
      {
        from: { type: Schema.Types.ObjectId, ref: 'User' },
        to: { type: Schema.Types.ObjectId, ref: 'User' },
        rating: { type: Number, min: 1, max: 5 },
        comments: String,
        skillsEndorsed: [String],
        wouldConnectAgain: { type: Boolean, default: false },
        reported: { type: Boolean, default: false },
        reportReason: String,
        createdAt: { type: Date, default: Date.now },
      },
    ],
    analytics: {
      totalCodeChanges: { type: Number, default: 0 },
      chatMessages: { type: Number, default: 0 },
      resourcesShared: { type: Number, default: 0 },
      engagementScore: { type: Number, default: 0 },
    },
    metadata: {
      ipAddresses: [String],
      userAgents: [String],
      region: String,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
SessionSchema.index({ roomId: 1 });
SessionSchema.index({ 'participants.user': 1 });
SessionSchema.index({ status: 1 });
SessionSchema.index({ createdAt: -1 });

export const Session = mongoose.model<ISession>('Session', SessionSchema);

