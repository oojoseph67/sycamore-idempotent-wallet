// in-memory rate limiter store with automatic cleanup

interface RequestRecord {
  timestamp: number;
  count: number;
  cost: number; // weighted cost
  payloadHash?: string; // for detecting identical payloads
  riskScore: number;
  lastRequestTime: number;
}

interface IdentityData {
  requests: RequestRecord[];
  blockedUntil?: number;
  cooldownUntil?: number;
  behaviorFlags: {
    tooFast: number; // count of requests that were too fast
    identicalPayloads: number;
    burstCount: number;
  };
}

class RateLimiterStore {
  private store: Map<string, IdentityData> = new Map();
  private cleanupInterval: NodeJS.Timeout;

  constructor() {
    // cleanup old entries every 5 minutes
    this.cleanupInterval = setInterval(() => {
      this.cleanup();
    }, 5 * 60 * 1000);
  }

  // get or create identity data
  getIdentityData(identity: string): IdentityData {
    if (!this.store.has(identity)) {
      this.store.set(identity, {
        requests: [],
        behaviorFlags: {
          tooFast: 0,
          identicalPayloads: 0,
          burstCount: 0,
        },
      });
    }
    return this.store.get(identity)!;
  }

  // add request record
  addRequest(
    identity: string,
    cost: number,
    payloadHash?: string,
    requestInterval?: number
  ): void {
    const data = this.getIdentityData(identity);
    const now = Date.now();

    // track behavior
    if (requestInterval && requestInterval < 50) {
      data.behaviorFlags.tooFast++;
    }

    if (payloadHash) {
      const recentIdentical = data.requests
        .filter((r) => r.payloadHash === payloadHash)
        .slice(-3).length;
      if (recentIdentical >= 2) {
        data.behaviorFlags.identicalPayloads++;
      }
    }

    // check burst
    const recentRequests = data.requests.filter(
      (r) => now - r.timestamp < 5000
    );
    if (recentRequests.length >= 10) {
      data.behaviorFlags.burstCount++;
    }

    // calculate risk score
    const riskScore = this.calculateRiskScore(data);

    data.requests.push({
      timestamp: now,
      count: 1,
      cost,
      payloadHash,
      riskScore,
      lastRequestTime: now,
    });

    // cleanup old requests (keep last hour)
    this.cleanupIdentity(identity);
  }

  // calculate risk score based on behavior
  private calculateRiskScore(data: IdentityData): number {
    let score = 0;

    // too fast requests
    score += data.behaviorFlags.tooFast * 10;

    // identical payloads
    score += data.behaviorFlags.identicalPayloads * 15;

    // burst patterns
    score += data.behaviorFlags.burstCount * 20;

    // request cadence analysis
    if (data.requests.length >= 2) {
      const intervals = [];
      for (let i = 1; i < data.requests.length; i++) {
        intervals.push(
          data.requests[i].timestamp - data.requests[i - 1].timestamp
        );
      }
      // if intervals are too consistent (bot pattern)
      if (intervals.length >= 3) {
        const avg = intervals.reduce((a, b) => a + b, 0) / intervals.length;
        const variance = intervals.reduce(
          (sum, val) => sum + Math.pow(val - avg, 2),
          0
        ) / intervals.length;
        if (variance < 100) {
          // very consistent timing
          score += 25;
        }
      }
    }

    return Math.min(score, 100); // cap at 100
  }

  // get current count and cost for a window
  getWindowStats(
    identity: string,
    windowMs: number
  ): { count: number; cost: number; riskScore: number } {
    const data = this.getIdentityData(identity);
    const now = Date.now();
    const windowStart = now - windowMs;

    const windowRequests = data.requests.filter(
      (r) => r.timestamp >= windowStart
    );

    const count = windowRequests.length;
    const cost = windowRequests.reduce((sum, r) => sum + r.cost, 0);
    const riskScore =
      windowRequests.length > 0
        ? windowRequests[windowRequests.length - 1].riskScore
        : 0;

    return { count, cost, riskScore };
  }

  // set block/cooldown
  setBlock(identity: string, until: number): void {
    const data = this.getIdentityData(identity);
    data.blockedUntil = until;
  }

  setCooldown(identity: string, until: number): void {
    const data = this.getIdentityData(identity);
    data.cooldownUntil = until;
  }

  // check if blocked or in cooldown
  isBlocked(identity: string): boolean {
    const data = this.getIdentityData(identity);
    if (data.blockedUntil && Date.now() < data.blockedUntil) {
      return true;
    }
    if (data.cooldownUntil && Date.now() < data.cooldownUntil) {
      return true;
    }
    return false;
  }

  getCooldownRemaining(identity: string): number {
    const data = this.getIdentityData(identity);
    if (data.cooldownUntil && Date.now() < data.cooldownUntil) {
      return data.cooldownUntil - Date.now();
    }
    return 0;
  }

  // cleanup old data
  private cleanupIdentity(identity: string): void {
    const data = this.getIdentityData(identity);
    const oneHourAgo = Date.now() - 60 * 60 * 1000;
    data.requests = data.requests.filter((r) => r.timestamp >= oneHourAgo);
  }

  private cleanup(): void {
    const oneHourAgo = Date.now() - 60 * 60 * 1000;
    for (const [identity, data] of this.store.entries()) {
      // remove identities with no recent activity
      if (
        data.requests.length === 0 ||
        data.requests[data.requests.length - 1].timestamp < oneHourAgo
      ) {
        this.store.delete(identity);
      } else {
        this.cleanupIdentity(identity);
      }
    }
  }

  // get behavior flags for an identity
  getBehaviorFlags(identity: string) {
    const data = this.getIdentityData(identity);
    return data.behaviorFlags;
  }

  // destroy store (for testing/cleanup)
  destroy(): void {
    clearInterval(this.cleanupInterval);
    this.store.clear();
  }
}

export const rateLimiterStore = new RateLimiterStore();

