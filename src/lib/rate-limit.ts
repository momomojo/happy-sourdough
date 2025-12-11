/**
 * Rate Limiting Utility for Next.js API Routes
 *
 * Uses an in-memory store with sliding window algorithm.
 * For production at scale, consider using Redis or Upstash.
 *
 * @example
 * ```ts
 * import { rateLimit, RateLimitResult } from '@/lib/rate-limit';
 *
 * const limiter = rateLimit({
 *   interval: 60 * 1000, // 1 minute
 *   uniqueTokenPerInterval: 500, // Max users per interval
 * });
 *
 * export async function POST(request: NextRequest) {
 *   const result = await limiter.check(request, 10, 'CHECKOUT'); // 10 requests per interval
 *   if (!result.success) {
 *     return NextResponse.json({ error: 'Rate limit exceeded' }, { status: 429 });
 *   }
 *   // ... handle request
 * }
 * ```
 */

import { NextRequest } from 'next/server';

export interface RateLimitResult {
  success: boolean;
  limit: number;
  remaining: number;
  reset: number;
}

interface RateLimitOptions {
  interval: number; // Window size in milliseconds
  uniqueTokenPerInterval: number; // Max unique tokens (IP addresses) per interval
}

interface TokenBucket {
  count: number;
  resetTime: number;
}

/**
 * Creates a rate limiter with configurable options
 */
export function rateLimit(options: RateLimitOptions) {
  const { interval, uniqueTokenPerInterval } = options;

  // In-memory store - cleared on cold start
  // For serverless, each instance has its own store
  const tokenCache = new Map<string, TokenBucket>();

  // Cleanup old entries periodically to prevent memory leaks
  const cleanup = () => {
    const now = Date.now();
    for (const [key, bucket] of tokenCache) {
      if (bucket.resetTime < now) {
        tokenCache.delete(key);
      }
    }
    // Limit total entries to prevent memory exhaustion
    if (tokenCache.size > uniqueTokenPerInterval * 2) {
      const entries = Array.from(tokenCache.entries());
      entries.sort((a, b) => a[1].resetTime - b[1].resetTime);
      const toDelete = entries.slice(0, entries.length - uniqueTokenPerInterval);
      for (const [key] of toDelete) {
        tokenCache.delete(key);
      }
    }
  };

  return {
    /**
     * Check if a request should be rate limited
     * @param request - The incoming request
     * @param limit - Maximum number of requests per interval
     * @param prefix - Optional prefix to namespace rate limits (e.g., 'CHECKOUT', 'DISCOUNT')
     * @returns RateLimitResult with success status and metadata
     */
    check: async (
      request: NextRequest,
      limit: number,
      prefix = 'GLOBAL'
    ): Promise<RateLimitResult> => {
      // Run cleanup occasionally (1% of requests)
      if (Math.random() < 0.01) {
        cleanup();
      }

      // Get client identifier - prefer x-forwarded-for for proxied requests (Vercel)
      const forwarded = request.headers.get('x-forwarded-for');
      const ip = forwarded?.split(',')[0].trim() || request.headers.get('x-real-ip') || 'unknown';
      const token = `${prefix}_${ip}`;

      const now = Date.now();
      const bucket = tokenCache.get(token);

      if (!bucket || bucket.resetTime < now) {
        // New window - create new bucket
        tokenCache.set(token, {
          count: 1,
          resetTime: now + interval,
        });
        return {
          success: true,
          limit,
          remaining: limit - 1,
          reset: now + interval,
        };
      }

      if (bucket.count >= limit) {
        // Rate limited
        return {
          success: false,
          limit,
          remaining: 0,
          reset: bucket.resetTime,
        };
      }

      // Increment count
      bucket.count++;
      tokenCache.set(token, bucket);

      return {
        success: true,
        limit,
        remaining: limit - bucket.count,
        reset: bucket.resetTime,
      };
    },

    /**
     * Get rate limit headers for response
     */
    getHeaders: (result: RateLimitResult): Record<string, string> => ({
      'X-RateLimit-Limit': result.limit.toString(),
      'X-RateLimit-Remaining': result.remaining.toString(),
      'X-RateLimit-Reset': result.reset.toString(),
    }),
  };
}

// Pre-configured rate limiters for different use cases

/**
 * Checkout rate limiter - more permissive for legitimate customers
 * 10 checkouts per minute per IP
 */
export const checkoutLimiter = rateLimit({
  interval: 60 * 1000, // 1 minute
  uniqueTokenPerInterval: 1000,
});

/**
 * Discount validation rate limiter - stricter to prevent brute force
 * 20 validations per minute per IP
 */
export const discountLimiter = rateLimit({
  interval: 60 * 1000, // 1 minute
  uniqueTokenPerInterval: 500,
});

/**
 * General API rate limiter
 * 100 requests per minute per IP
 */
export const apiLimiter = rateLimit({
  interval: 60 * 1000, // 1 minute
  uniqueTokenPerInterval: 2000,
});

/**
 * Strict rate limiter for sensitive operations
 * 5 requests per minute per IP
 */
export const strictLimiter = rateLimit({
  interval: 60 * 1000, // 1 minute
  uniqueTokenPerInterval: 500,
});

/**
 * Helper to create a rate limit error response with proper headers
 */
export function rateLimitResponse(result: RateLimitResult): Response {
  const headers = {
    'Content-Type': 'application/json',
    'X-RateLimit-Limit': result.limit.toString(),
    'X-RateLimit-Remaining': '0',
    'X-RateLimit-Reset': result.reset.toString(),
    'Retry-After': Math.ceil((result.reset - Date.now()) / 1000).toString(),
  };

  return new Response(
    JSON.stringify({
      error: 'Too many requests. Please try again later.',
      retryAfter: Math.ceil((result.reset - Date.now()) / 1000),
    }),
    {
      status: 429,
      headers,
    }
  );
}
