/**
 * A simple rate limiter to prevent API rate limit issues
 */
export class RateLimiter {
  private lastCallTime: number = 0;
  private minInterval: number = 100; // 100ms between calls

  /**
   * Throttles API calls to prevent hitting rate limits
   * @param customInterval Optional custom interval in ms
   * @returns Promise that resolves when it's safe to make the next API call
   */
  async throttle(customInterval?: number): Promise<void> {
    const interval = customInterval || this.minInterval;
    const now = Date.now();
    const timeSinceLastCall = now - this.lastCallTime;
    
    if (timeSinceLastCall < interval) {
      const delay = interval - timeSinceLastCall;
      await new Promise(resolve => setTimeout(resolve, delay));
    }
    
    this.lastCallTime = Date.now();
  }
} 