import { Request, Response, NextFunction } from "express";
import { StatusCodes } from "http-status-codes";
import { AppError } from "../../global/errors";
import {
  rateLimitConfigs,
  botDetectionConfig,
  RateLimitConfig,
} from "./rate-limiter.config";
import { rateLimiterStore } from "./rate-limiter.store";
import crypto from "crypto";

// get identity from request (user id > session > ip)
function getIdentity(req: Request): string {
  // primary: authenticated user id
  if (req.user?.id) {
    return `user:${req.user.id}`;
  }

  // secondary: session token or api key
  if (req.headers.authorization) {
    const token = req.headers.authorization.split(" ")[1];
    if (token) {
      const hash = crypto.createHash("sha256").update(token).digest("hex").substring(0, 16);
      return `session:${hash}`;
    }
  }

  // fallback: ip address (with forwarded-for support)
  const ip =
    (req.headers["x-forwarded-for"] as string)?.split(",")[0]?.trim() ||
    (req.headers["x-real-ip"] as string) ||
    req.ip ||
    req.socket.remoteAddress ||
    "unknown";

  return `ip:${ip}`;
}

// hash request payload for similarity detection
function hashPayload(req: Request): string | undefined {
  if (req.body && Object.keys(req.body).length > 0) {
    const payload = JSON.stringify(req.body);
    return crypto.createHash("sha256").update(payload).digest("hex").substring(0, 16);
  }
  return undefined;
}

// calculate request interval
function getRequestInterval(identity: string): number | undefined {
  const data = rateLimiterStore.getIdentityData(identity);
  if (data.requests.length === 0) {
    return undefined;
  }
  const lastRequest = data.requests[data.requests.length - 1];
  return Date.now() - lastRequest.timestamp;
}

// create rate limiter middleware with config
export function createRateLimiter(
  endpointConfig?: RateLimitConfig
) {
  return async (req: Request, res: Response, next: NextFunction) => {
    const identity = getIdentity(req);
    // use originalUrl or path to match endpoint configs
    const endpoint = req.originalUrl || req.path;
    // try exact match first, then try path-only match, then default
    const config =
      endpointConfig ||
      rateLimitConfigs[endpoint] ||
      rateLimitConfigs[req.path] ||
      rateLimitConfigs.default;

    // check if currently blocked
    if (rateLimiterStore.isBlocked(identity)) {
      const cooldown = rateLimiterStore.getCooldownRemaining(identity);
      throw AppError.tooManyRequests({
        message: "rate limit exceeded. please try again later.",
        details: {
          retryAfter: Math.ceil(cooldown / 1000),
          reason: "blocked",
        },
      });
    }

    // get request metadata
    const payloadHash = hashPayload(req);
    const requestInterval = getRequestInterval(identity);
    const cost = 1 * config.costMultiplier;

    // add request to store
    rateLimiterStore.addRequest(identity, cost, payloadHash, requestInterval);

    // get window statistics
    const stats = rateLimiterStore.getWindowStats(identity, config.windowMs);
    const behaviorFlags = rateLimiterStore.getBehaviorFlags(identity);

    // calculate usage percentage
    const usagePercent = stats.cost / (config.maxRequests * config.costMultiplier);

    // progressive friction logic
    let shouldBlock = false;
    let shouldSlowdown = false;
    let shouldWarn = false;
    let retryAfter = 0;

    // check risk score from bot detection
    if (stats.riskScore >= botDetectionConfig.riskScoreBlock) {
      shouldBlock = true;
      retryAfter = config.windowMs;
    } else if (stats.riskScore >= botDetectionConfig.riskScoreWarning) {
      shouldWarn = true;
    }

    // check usage thresholds
    if (usagePercent >= config.blockThreshold) {
      shouldBlock = true;
      retryAfter = config.windowMs;
    } else if (usagePercent >= config.slowdownThreshold) {
      shouldSlowdown = true;
      retryAfter = Math.ceil((config.windowMs * (1 - usagePercent)) / 1000);
    } else if (usagePercent >= config.warningThreshold) {
      shouldWarn = true;
    }

    // apply progressive friction
    if (shouldBlock) {
      rateLimiterStore.setBlock(identity, Date.now() + retryAfter);
      throw AppError.tooManyRequests({
        message: "rate limit exceeded. too many requests.",
        details: {
          retryAfter: Math.ceil(retryAfter / 1000),
          reason: "limit_exceeded",
          usage: Math.round(usagePercent * 100),
        },
      });
    }

    if (shouldSlowdown) {
      // add cooldown delay
      const cooldownMs = Math.min(2000, retryAfter * 100); // max 2 seconds
      rateLimiterStore.setCooldown(identity, Date.now() + cooldownMs);
      
      // add delay before processing
      await new Promise((resolve) => setTimeout(resolve, cooldownMs));

      // add warning headers
      res.setHeader("X-RateLimit-Warning", "approaching limit");
      res.setHeader("X-RateLimit-Retry-After", retryAfter.toString());
    }

    if (shouldWarn) {
      res.setHeader("X-RateLimit-Warning", "high usage detected");
    }

    // add rate limit headers
    res.setHeader("X-RateLimit-Limit", (config.maxRequests * config.costMultiplier).toString());
    res.setHeader("X-RateLimit-Remaining", Math.max(0, Math.floor((config.maxRequests * config.costMultiplier) - stats.cost)).toString());
    res.setHeader("X-RateLimit-Reset", new Date(Date.now() + config.windowMs).toISOString());

    // add behavior detection headers (for debugging)
    if (stats.riskScore > 0) {
      res.setHeader("X-RateLimit-Risk-Score", stats.riskScore.toString());
    }

    next();
  };
}

// convenience middleware for specific endpoints
export const rateLimiter = createRateLimiter();

