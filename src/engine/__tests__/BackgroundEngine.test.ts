import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { BackgroundEngine } from '../BackgroundEngine';
import { useWalletStore } from '../../stores/useWalletStore';
import { useBlockchainStore } from '../../stores/useBlockchainStore';

describe('BackgroundEngine', () => {
  let engine: BackgroundEngine;

  beforeEach(() => {
    // Reset stores
    useWalletStore.getState().initializeWallets();
    useBlockchainStore.getState().initializeChain(1);

    // Clear mempool explicitly
    useWalletStore.setState({ mempool: [], minedTransactions: [] });

    engine = new BackgroundEngine();
    vi.useFakeTimers();
  });

  afterEach(() => {
    engine.stop();
    vi.useRealTimers();
  });

  it('should create simulated wallets on start', () => {
    engine.start();
    const wallets = useWalletStore.getState().wallets;
    const simulatedWallets = engine.getPeerWallets();

    expect(simulatedWallets.length).toBeGreaterThan(0);
    expect(wallets.length).toBeGreaterThanOrEqual(simulatedWallets.length);
    expect(simulatedWallets[0].name).toContain('Wallet_');
  });

  it('should generate transactions periodically', () => {
    engine.start();

    // Engine generates one transaction immediately on start
    expect(useWalletStore.getState().mempool.length).toBeGreaterThanOrEqual(1);

    const initialCount = useWalletStore.getState().mempool.length;

    // Fast forward time to trigger transaction loop (10-30s)
    vi.advanceTimersByTime(40000);

    const mempool = useWalletStore.getState().mempool;
    // Should have generated at least one more, unless mining cleared it.
    // If mining cleared it, minedTransactions should have increased.
    // But we are testing transaction generation here.
    // Mining is scheduled for avg 45s. It might have run.

    const minedCount = useWalletStore.getState().minedTransactions.length;
    expect(mempool.length + minedCount).toBeGreaterThan(initialCount);

    if (mempool.length > 0) {
        const tx = mempool[0];
        expect(tx.fee).toBeDefined();
        expect(tx.fee).toBeGreaterThan(0);
    }
  });

  it('should mine blocks periodically', () => {
     const initialChainLength = useBlockchainStore.getState().blocks.length;

     engine.start();

     // Fast forward to trigger mining (avg 45s)
     // Advance enough to likely cover the random delay and generate txs
     vi.advanceTimersByTime(200000); // 200 seconds

     const newChainLength = useBlockchainStore.getState().blocks.length;
     expect(newChainLength).toBeGreaterThan(initialChainLength);

     const latestBlock = useBlockchainStore.getState().blocks[newChainLength - 1];
     expect(latestBlock.data).toContain('Mined by Miner_');
  });
});
