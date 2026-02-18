import { describe, it, expect, beforeEach } from 'vitest';
import { useWalletStore } from '../useWalletStore';

describe('useWalletStore', () => {
  beforeEach(() => {
    useWalletStore.getState().initializeWallets();
  });

  it('should initialize with default state', () => {
    const state = useWalletStore.getState();
    expect(state.wallets).toHaveLength(2);
    expect(state.mempool).toEqual([]);
  });

  it('should create a wallet', () => {
    useWalletStore.getState().createWallet('Charlie', 100);
    const state = useWalletStore.getState();
    expect(state.wallets).toHaveLength(3);
    expect(state.wallets.find(w => w.name === 'Charlie')).toBeDefined();
  });

  it('should send transaction', () => {
    // We send from 'Alice' (existing) to 'Bob' (existing)
    useWalletStore.getState().sendTransaction('Alice', 'Bob', 10);

    const state = useWalletStore.getState();
    expect(state.mempool).toHaveLength(1);
    expect(state.mempool[0].amount).toBe(10);

    const aliceW = state.wallets.find(w => w.name === 'Alice');
    expect(state.mempool[0].from).toBe(aliceW?.publicKey);
  });

  it('should mine mempool', () => {
    // Send tx
    useWalletStore.getState().sendTransaction('Alice', 'Bob', 10);

    useWalletStore.getState().mineMempool();

    const state = useWalletStore.getState();
    expect(state.mempool).toHaveLength(0);
    expect(state.minedTransactions).toHaveLength(1);
  });
});
