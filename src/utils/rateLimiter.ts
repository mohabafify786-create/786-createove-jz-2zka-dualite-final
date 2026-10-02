class RateLimiter {
  private timestamps: number[] = [];
  private maxMessages: number;
  private windowMs: number;

  constructor(maxMessages = 10, windowMs = 60000) {
    this.maxMessages = maxMessages;
    this.windowMs = windowMs;
  }

  canSend(): boolean {
    const now = Date.now();
    this.timestamps = this.timestamps.filter((t) => now - t < this.windowMs);
    return this.timestamps.length < this.maxMessages;
  }

  record(): void {
    this.timestamps.push(Date.now());
  }

  getRemainingAllowance(): number {
    const now = Date.now();
    this.timestamps = this.timestamps.filter((t) => now - t < this.windowMs);
    return Math.max(0, this.maxMessages - this.timestamps.length);
  }

  getResetTimeMs(): number {
    if (this.timestamps.length === 0) return 0;
    const oldest = Math.min(...this.timestamps);
    return Math.max(0, this.windowMs - (Date.now() - oldest));
  }
}

export const messageRateLimiter = new RateLimiter(10, 60000);
