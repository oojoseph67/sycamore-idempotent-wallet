// rate limiter configuration - adjustable limits per endpoint and action cost

export interface RateLimitConfig {
  // requests per window
  maxRequests: number;
  // window duration in milliseconds
  windowMs: number;
  // action cost multiplier (higher = more expensive)
  costMultiplier: number;
  // progressive friction thresholds
  warningThreshold: number; // percentage of limit to start warnings
  slowdownThreshold: number; // percentage of limit to start slowdowns
  blockThreshold: number; // percentage of limit to hard block
}

export interface EndpointConfig {
  [endpoint: string]: RateLimitConfig;
}

// multi-dimensional rate limits per endpoint
// paths are relative to where middleware is mounted
export const rateLimitConfigs: EndpointConfig = {
  // high-risk endpoints - stricter limits
  "/auth/login": {
    maxRequests: 5,
    windowMs: 15 * 60 * 1000, // 15 minutes
    costMultiplier: 2, // login is expensive
    warningThreshold: 0.6, // warn at 60%
    slowdownThreshold: 0.8, // slow down at 80%
    blockThreshold: 1.0, // block at 100%
  },
  "/auth/signup": {
    maxRequests: 3,
    windowMs: 60 * 60 * 1000, // 1 hour
    costMultiplier: 3, // signup is very expensive
    warningThreshold: 0.5,
    slowdownThreshold: 0.7,
    blockThreshold: 1.0,
  },
  // medium-risk endpoints
  "/auth/whoami": {
    maxRequests: 30,
    windowMs: 60 * 1000, // 1 minute
    costMultiplier: 1,
    warningThreshold: 0.7,
    slowdownThreshold: 0.9,
    blockThreshold: 1.0,
  },
  // default for other endpoints
  default: {
    maxRequests: 100,
    windowMs: 60 * 1000, // 1 minute
    costMultiplier: 1,
    warningThreshold: 0.8,
    slowdownThreshold: 0.9,
    blockThreshold: 1.0,
  },
};

// bot detection thresholds
export const botDetectionConfig = {
  // minimum time between requests (ms) - too fast = bot
  minRequestInterval: 50,
  // maximum identical payloads before flagging
  maxIdenticalPayloads: 3,
  // maximum requests from same identity in short burst
  maxBurstRequests: 10,
  burstWindowMs: 5 * 1000, // 5 seconds
  // risk score thresholds
  riskScoreWarning: 30,
  riskScoreBlock: 70,
};
