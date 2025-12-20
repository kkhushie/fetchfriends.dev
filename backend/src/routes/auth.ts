import express from 'express';
import passport from 'passport';
import { Strategy as GitHubStrategy } from 'passport-github2';
import { Strategy as LinkedInStrategy } from 'passport-linkedin-oauth2';
import { User } from '../models/User';
import { generateToken } from '../middleware/auth';
import { VerificationService } from '../services/verification';
import { authenticate } from '../middleware/auth';
import { authRateLimiter } from '../middleware/rateLimiter';
import { createError } from '../middleware/errorHandler';

const router = express.Router();

// GitHub OAuth Strategy
passport.use(
  new GitHubStrategy(
    {
      clientID: process.env.GITHUB_CLIENT_ID || '',
      clientSecret: process.env.GITHUB_CLIENT_SECRET || '',
      callbackURL: '/api/auth/github/callback',
    },
    async (accessToken: string, refreshToken: string, profile: any, done: any) => {
      try {
        const githubData = profile._json;
        const repos = await VerificationService.fetchGitHubRepos(
          profile.username,
          accessToken
        );

        const githubScore = await VerificationService.calculateGitHubScore(
          githubData,
          repos,
          accessToken
        );

        // Find or create user
        let user = await User.findOne({ 'profile.email': profile.emails?.[0]?.value });

        if (!user) {
          user = await User.findOne({ 'auth.github.id': profile.id });
        }

        if (user) {
          // Update existing user
          user.auth.github = {
            id: profile.id,
            username: profile.username,
            accessToken,
            refreshToken,
          };
          user.profile.name = user.profile.name || profile.displayName;
          user.profile.avatar = user.profile.avatar || profile.photos?.[0]?.value;
          user.profile.github = {
            username: profile.username,
            publicRepos: githubData.public_repos || 0,
            followers: githubData.followers || 0,
            following: githubData.following || 0,
            stars: repos.reduce((sum: number, repo: any) => sum + repo.stargazers_count, 0),
            languages: new Map(),
            topRepos: repos.slice(0, 5).map((repo: any) => ({
              name: repo.name,
              description: repo.description || '',
              language: repo.language || '',
              stars: repo.stargazers_count,
              url: repo.html_url,
            })),
          };
        } else {
          // Create new user
          user = new User({
            auth: {
              github: {
                id: profile.id,
                username: profile.username,
                accessToken,
                refreshToken,
              },
            },
            profile: {
              name: profile.displayName,
              email: profile.emails?.[0]?.value || '',
              avatar: profile.photos?.[0]?.value,
              github: {
                username: profile.username,
                publicRepos: githubData.public_repos || 0,
                followers: githubData.followers || 0,
                following: githubData.following || 0,
                stars: repos.reduce((sum: number, repo: any) => sum + repo.stargazers_count, 0),
                languages: new Map(),
                topRepos: repos.slice(0, 5).map((repo: any) => ({
                  name: repo.name,
                  description: repo.description || '',
                  language: repo.language || '',
                  stars: repo.stargazers_count,
                  url: repo.html_url,
                })),
              },
            },
            verification: {
              status: 'pending',
              score: githubScore,
              methods: [
                {
                  provider: 'github',
                  verifiedAt: new Date(),
                  data: { score: githubScore },
                },
              ],
            },
          });
        }

        await user.save();
        return done(null, user);
      } catch (error: any) {
        return done(error, null);
      }
    }
  )
);

// LinkedIn OAuth Strategy
passport.use(
  new LinkedInStrategy(
    {
      clientID: process.env.LINKEDIN_CLIENT_ID || '',
      clientSecret: process.env.LINKEDIN_CLIENT_SECRET || '',
      callbackURL: '/api/auth/linkedin/callback',
      scope: ['r_liteprofile', 'r_emailaddress'],
    },
    async (accessToken: string, refreshToken: string, profile: any, done: any) => {
      try {
        const linkedinData = profile._json;
        const linkedinScore = VerificationService.calculateLinkedInScore(linkedinData);

        let user = await User.findOne({ 'profile.email': profile.emails?.[0]?.value });

        if (!user) {
          user = await User.findOne({ 'auth.linkedin.id': profile.id });
        }

        if (user) {
          user.auth.linkedin = {
            id: profile.id,
            accessToken,
            refreshToken,
          };
          user.profile.name = user.profile.name || `${linkedinData.firstName} ${linkedinData.lastName}`;
          user.profile.linkedin = {
            profileUrl: profile.profileUrl,
            currentRole: linkedinData.headline,
            company: linkedinData.positions?.[0]?.companyName,
            skills: [],
            endorsements: 0,
          };

          // Add to verification methods
          const existingMethod = user.verification.methods.find(
            (m) => m.provider === 'linkedin'
          );
          if (!existingMethod) {
            user.verification.methods.push({
              provider: 'linkedin',
              verifiedAt: new Date(),
              data: { score: linkedinScore },
            });
          }
        } else {
          user = new User({
            auth: {
              linkedin: {
                id: profile.id,
                accessToken,
                refreshToken,
              },
            },
            profile: {
              name: `${linkedinData.firstName} ${linkedinData.lastName}`,
              email: profile.emails?.[0]?.value || '',
              linkedin: {
                profileUrl: profile.profileUrl,
                currentRole: linkedinData.headline,
                company: linkedinData.positions?.[0]?.companyName,
                skills: [],
                endorsements: 0,
              },
            },
            verification: {
              status: 'pending',
              score: linkedinScore,
              methods: [
                {
                  provider: 'linkedin',
                  verifiedAt: new Date(),
                  data: { score: linkedinScore },
                },
              ],
            },
          });
        }

        // Recalculate overall score
        const scores = user.verification.methods.map((m: any) => m.data?.score || 0);
        const overallScore = VerificationService.calculateOverallScore(scores);
        user.verification.score = overallScore;
        user.verification.status = VerificationService.getVerificationStatus(overallScore);

        await user.save();
        return done(null, user);
      } catch (error: any) {
        return done(error, null);
      }
    }
  )
);

passport.serializeUser((user: any, done) => {
  done(null, user._id);
});

passport.deserializeUser(async (id: string, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (error) {
    done(error, null);
  }
});

// GitHub OAuth routes
router.get('/github', authRateLimiter, passport.authenticate('github', { scope: ['user:email', 'repo'] }));

router.get(
  '/github/callback',
  passport.authenticate('github', { session: false, failureRedirect: '/login?error=github' }),
  (req, res) => {
    const user = req.user as any;
    const token = generateToken(user._id.toString());
    res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:3000'}/auth/callback?token=${token}`);
  }
);

// LinkedIn OAuth routes
router.get('/linkedin', authRateLimiter, passport.authenticate('linkedin'));

router.get(
  '/linkedin/callback',
  passport.authenticate('linkedin', { session: false, failureRedirect: '/login?error=linkedin' }),
  (req, res) => {
    const user = req.user as any;
    const token = generateToken(user._id.toString());
    res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:3000'}/auth/callback?token=${token}`);
  }
);

// Get current user
router.get('/me', authenticate, async (req: any, res, next) => {
  try {
    const user = await User.findById(req.user._id).select('-auth.accessToken -auth.refreshToken');
    res.json({ success: true, user });
  } catch (error) {
    next(error);
  }
});

// Logout
router.post('/logout', authenticate, (req, res) => {
  res.json({ success: true, message: 'Logged out successfully' });
});

// Verify status
router.get('/verify/status', authenticate, async (req: any, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      throw createError('User not found', 404);
    }

    res.json({
      success: true,
      verification: {
        status: user.verification.status,
        score: user.verification.score,
        methods: user.verification.methods.map((m) => ({
          provider: m.provider,
          verifiedAt: m.verifiedAt,
        })),
      },
    });
  } catch (error) {
    next(error);
  }
});

export default router;

