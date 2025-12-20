import rateLimit from 'express-rate-limit';
export const rateLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // limit each IP to 100 requests per windowMs
    message: 'Too many requests from this IP, please try again later.',
    standardHeaders: true,
    legacyHeaders: false,
});
export const authRateLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 5, // stricter limit for auth endpoints
    message: 'Too many authentication attempts, please try again later.',
});
export const matchRateLimiter = rateLimit({
    windowMs: 60 * 1000, // 1 minute
    max: 10, // limit match requests
    message: 'Too many match requests, please wait a moment.',
});
//# sourceMappingURL=rateLimiter.js.map