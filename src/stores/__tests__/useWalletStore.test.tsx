import { describe, it, expect, beforeEach } from 'vitest';
import { useWalletStore } from '../useWalletStore';

describe('useWalletStore', () => {
  beforeEach(() => {
    // Reset store
    useWalletStore.getState().initializeWallets();
  });

  it('should initialize wallets', () => {
    const { wallets } = useWalletStore.getState();
    expect(wallets).toHaveLength(2); // Alice and Bob
    expect(wallets.find(w => w.name === 'Alice')).toBeDefined();
    expect(wallets.find(w => w.name === 'Bob')).toBeDefined();
  });

  it('should create a wallet', () => {
    useWalletStore.getState().createWallet('Charlie', 100);
    const { wallets } = useWalletStore.getState();
    expect(wallets).toHaveLength(3);
    expect(wallets.find(w => w.name === 'Charlie')).toBeDefined();
  });

  it('should send transaction', () => {
    useWalletStore.getState().sendTransaction('Alice', 'Bob', 10);
    const { mempool } = useWalletStore.getState();
    expect(mempool).toHaveLength(1);
    expect(mempool[0].amount).toBe(10);
  });

  it('should not send transaction with insufficient funds', () => {
    useWalletStore.getState().sendTransaction('Bob', 'Alice', 1000); // Bob has 50
    const { mempool } = useWalletStore.getState();
    expect(mempool).toHaveLength(0);
  });

  it('should mine mempool', () => {
    useWalletStore.getState().sendTransaction('Alice', 'Bob', 10);
    useWalletStore.getState().mineMempool();

    const { wallets, mempool, minedTransactions } = useWalletStore.getState();

    expect(mempool).toHaveLength(0);
    expect(minedTransactions).toHaveLength(1);

    const alice = wallets.find(w => w.name === 'Alice');
    const bob = wallets.find(w => w.name === 'Bob');

    expect(alice?.balance).toBe(90);
    expect(bob?.balance).toBe(60);
  });
});
