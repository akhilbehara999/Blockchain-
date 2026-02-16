export class NetworkSimulator {
  private meanBlockDelay: number = 1000;
  private meanTxDelay: number = 500;
  private lastLatency: number = 0;

  constructor() {}

  /**
   * Generates a random delay using exponential distribution.
   * Clamps the result between min and max.
   * @param mean - Mean delay in ms.
   * @param min - Minimum delay in ms.
   * @param max - Maximum delay in ms.
   */
  private getDelay(mean: number, min: number, max: number): number {
    const rawDelay = -Math.log(Math.random()) * mean;
    return Math.max(min, Math.min(max, rawDelay));
  }

  /**
   * Simulates propagation of a block with random delay (300ms - 3000ms).
   * @param block - The block object (used for logging or simulation, currently unused).
   * @param callback - Function to call after the delay.
   */
  propagateBlock(_block: any, callback: () => void): void {
    const delay = this.getDelay(this.meanBlockDelay, 300, 3000);
    this.lastLatency = delay;
    setTimeout(callback, delay);
  }

  /**
   * Simulates broadcast of a transaction with random delay (200ms - 1500ms).
   * @param tx - The transaction object (used for logging or simulation, currently unused).
   * @param callback - Function to call after the delay.
   */
  broadcastTransaction(_tx: any, callback: () => void): void {
    const delay = this.getDelay(this.meanTxDelay, 200, 1500);
    this.lastLatency = delay;
    setTimeout(callback, delay);
  }

  getLatency(): number {
    return this.lastLatency;
  }

  setMeanBlockDelay(ms: number): void {
    this.meanBlockDelay = ms;
  }

  setMeanTxDelay(ms: number): void {
    this.meanTxDelay = ms;
  }
}
