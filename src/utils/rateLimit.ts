export class RateLimiter {
  private timestamps: number[] = [];
  constructor(private maxAttempts: number, private windowMs: number) {}
  canProceed(): boolean {
    const now = Date.now();
    this.timestamps = this.timestamps.filter(t => now - t < this.windowMs);
    if (this.timestamps.length >= this.maxAttempts) return false;
    this.timestamps.push(now);
    return true;
  }
}
