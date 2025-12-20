import mongoose, { Schema, Document } from 'mongoose';

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

const UserSchema = new Schema<IUser>(
  {
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
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Indexes
UserSchema.index({ 'profile.email': 1 });
UserSchema.index({ 'verification.status': 1 });
UserSchema.index({ 'availability.status': 1 });
UserSchema.index({ 'stats.reputation.points': -1 });

export const User = mongoose.model<IUser>('User', UserSchema);

