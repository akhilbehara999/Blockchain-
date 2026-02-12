import { describe, it, expect, vi } from 'vitest';
import { NetworkSimulator } from '../NetworkSimulator';

describe('NetworkSimulator', () => {
  it('should propagate block with delay', () => {
    vi.useFakeTimers();
    const simulator = new NetworkSimulator();
    const callback = vi.fn();
    const block = { data: 'test' };

    simulator.propagateBlock(block, callback);

    expect(callback).not.toHaveBeenCalled();

    // Fast forward enough time
    vi.advanceTimersByTime(3000);

    expect(callback).toHaveBeenCalled();
    expect(simulator.getLatency()).toBeGreaterThan(0);
  }, 5000);

  it('should broadcast transaction with delay', () => {
    vi.useFakeTimers();
    const simulator = new NetworkSimulator();
    const callback = vi.fn();
    const tx = { from: 'Alice', to: 'Bob', amount: 10 };

    simulator.broadcastTransaction(tx, callback);

    expect(callback).not.toHaveBeenCalled();

    vi.advanceTimersByTime(1500);

    expect(callback).toHaveBeenCalled();
    expect(simulator.getLatency()).toBeGreaterThan(0);
  }, 5000);
});
