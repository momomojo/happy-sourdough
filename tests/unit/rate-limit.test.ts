import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { rateLimit, rateLimitResponse, type RateLimitResult } from '@/lib/rate-limit';

// Mock NextRequest
class MockNextRequest {
  private headersMap: Map<string, string>;

  constructor(headers: Record<string, string> = {}) {
    this.headersMap = new Map(Object.entries(headers));
  }

  get headers() {
    return {
      get: (key: string) => this.headersMap.get(key) || null,
    };
  }
}

describe('Rate Limiting', () => {
  describe('rateLimit', () => {
    let limiter: ReturnType<typeof rateLimit>;

    beforeEach(() => {
      limiter = rateLimit({
        interval: 60 * 1000, // 1 minute
        uniqueTokenPerInterval: 100,
      });
    });

    it('allows requests within the limit', async () => {
      const request = new MockNextRequest({
        'x-forwarded-for': '192.168.1.1',
      });

      const result = await limiter.check(request as any, 5, 'TEST');

      expect(result.success).toBe(true);
      expect(result.limit).toBe(5);
      expect(result.remaining).toBe(4);
    });

    it('tracks requests per IP address', async () => {
      const request = new MockNextRequest({
        'x-forwarded-for': '192.168.1.2',
      });

      // Make 3 requests
      const result1 = await limiter.check(request as any, 5, 'TEST');
      const result2 = await limiter.check(request as any, 5, 'TEST');
      const result3 = await limiter.check(request as any, 5, 'TEST');

      expect(result1.remaining).toBe(4);
      expect(result2.remaining).toBe(3);
      expect(result3.remaining).toBe(2);
    });

    it('blocks requests when limit is exceeded', async () => {
      const request = new MockNextRequest({
        'x-forwarded-for': '192.168.1.3',
      });

      // Make requests up to the limit
      await limiter.check(request as any, 3, 'TEST');
      await limiter.check(request as any, 3, 'TEST');
      await limiter.check(request as any, 3, 'TEST');

      // This should be blocked
      const result = await limiter.check(request as any, 3, 'TEST');

      expect(result.success).toBe(false);
      expect(result.remaining).toBe(0);
    });

    it('uses different counters for different prefixes', async () => {
      const request = new MockNextRequest({
        'x-forwarded-for': '192.168.1.4',
      });

      const result1 = await limiter.check(request as any, 3, 'PREFIX_A');
      const result2 = await limiter.check(request as any, 3, 'PREFIX_B');

      // Both should have full remaining since they use different prefixes
      expect(result1.remaining).toBe(2);
      expect(result2.remaining).toBe(2);
    });

    it('tracks different IPs separately', async () => {
      const request1 = new MockNextRequest({
        'x-forwarded-for': '192.168.1.5',
      });
      const request2 = new MockNextRequest({
        'x-forwarded-for': '192.168.1.6',
      });

      // Use up all requests for IP 1
      await limiter.check(request1 as any, 2, 'TEST');
      await limiter.check(request1 as any, 2, 'TEST');
      const blockedResult = await limiter.check(request1 as any, 2, 'TEST');

      // IP 2 should still have full limit
      const ip2Result = await limiter.check(request2 as any, 2, 'TEST');

      expect(blockedResult.success).toBe(false);
      expect(ip2Result.success).toBe(true);
      expect(ip2Result.remaining).toBe(1);
    });

    it('uses x-real-ip as fallback', async () => {
      const request = new MockNextRequest({
        'x-real-ip': '10.0.0.1',
      });

      const result = await limiter.check(request as any, 5, 'TEST');

      expect(result.success).toBe(true);
    });

    it('handles missing IP headers', async () => {
      const request = new MockNextRequest({});

      const result = await limiter.check(request as any, 5, 'TEST');

      expect(result.success).toBe(true);
    });

    it('extracts first IP from x-forwarded-for with multiple IPs', async () => {
      const request = new MockNextRequest({
        'x-forwarded-for': '192.168.1.10, 10.0.0.1, 172.16.0.1',
      });

      const result = await limiter.check(request as any, 5, 'MULTI');

      expect(result.success).toBe(true);
    });
  });

  describe('rateLimit.getHeaders', () => {
    it('returns correct rate limit headers', () => {
      const limiter = rateLimit({
        interval: 60 * 1000,
        uniqueTokenPerInterval: 100,
      });

      const result: RateLimitResult = {
        success: true,
        limit: 10,
        remaining: 7,
        reset: Date.now() + 30000,
      };

      const headers = limiter.getHeaders(result);

      expect(headers['X-RateLimit-Limit']).toBe('10');
      expect(headers['X-RateLimit-Remaining']).toBe('7');
      expect(headers['X-RateLimit-Reset']).toBeDefined();
    });
  });

  describe('rateLimitResponse', () => {
    it('returns 429 response with correct headers', () => {
      const result: RateLimitResult = {
        success: false,
        limit: 10,
        remaining: 0,
        reset: Date.now() + 30000,
      };

      const response = rateLimitResponse(result);

      expect(response.status).toBe(429);
      expect(response.headers.get('Content-Type')).toBe('application/json');
      expect(response.headers.get('X-RateLimit-Limit')).toBe('10');
      expect(response.headers.get('X-RateLimit-Remaining')).toBe('0');
      expect(response.headers.get('Retry-After')).toBeDefined();
    });

    it('includes error message in body', async () => {
      const result: RateLimitResult = {
        success: false,
        limit: 10,
        remaining: 0,
        reset: Date.now() + 60000,
      };

      const response = rateLimitResponse(result);
      const body = await response.json();

      expect(body.error).toBe('Too many requests. Please try again later.');
      expect(body.retryAfter).toBeGreaterThan(0);
    });
  });

  describe('Window reset behavior', () => {
    beforeEach(() => {
      vi.useFakeTimers();
    });

    afterEach(() => {
      vi.useRealTimers();
    });

    it('resets counter after interval expires', async () => {
      const limiter = rateLimit({
        interval: 1000, // 1 second
        uniqueTokenPerInterval: 100,
      });

      const request = new MockNextRequest({
        'x-forwarded-for': '192.168.1.20',
      });

      // Use up all requests
      await limiter.check(request as any, 2, 'RESET_TEST');
      await limiter.check(request as any, 2, 'RESET_TEST');
      const blocked = await limiter.check(request as any, 2, 'RESET_TEST');

      expect(blocked.success).toBe(false);

      // Advance time past the interval
      vi.advanceTimersByTime(1100);

      // Should be allowed again
      const result = await limiter.check(request as any, 2, 'RESET_TEST');

      expect(result.success).toBe(true);
      expect(result.remaining).toBe(1);
    });
  });
});
