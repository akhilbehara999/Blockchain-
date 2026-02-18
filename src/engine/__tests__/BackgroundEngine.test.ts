import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { BackgroundEngine } from '../BackgroundEngine';
import { useWalletStore } from '../../stores/useWalletStore';

const mockWallets: any[] = [];
const mockMempool: any[] = [];

const randomHex = (len: number) => {
    let s = '';
    for(let i=0; i<len; i++) s += Math.floor(Math.random()*16).toString(16);
    return s;
};

// Persistent mocks
const mockMineMempool = vi.fn();
const mockAddTransaction = vi.fn();

// Mock dependencies
vi.mock('../ForkManager', () => ({
    forkManager: {
        processBlock: vi.fn(),
    }
}));

vi.mock('../../stores/useWalletStore', () => ({
  useWalletStore: {
    getState: vi.fn(() => ({
      mineMempool: mockMineMempool,
      addTransaction: mockAddTransaction,
      createWallet: vi.fn((name, balance) => {
          const pk = '0x' + randomHex(40);
          mockWallets.push({ name, balance, publicKey: pk, privateKey: 'priv' });
      }),
      wallets: mockWallets,
      mempool: mockMempool,
    })),
    setState: vi.fn((newState) => {
        if (newState.mempool) {
            mockMempool.length = 0;
            mockMempool.push(...newState.mempool);
        }
    })
  },
}));

vi.mock('../../stores/useBlockchainStore', () => ({
  useBlockchainStore: {
    getState: vi.fn(() => ({
      addBlock: vi.fn(),
      blocks: [],
    })),
  },
}));

describe('BackgroundEngine', () => {
  let engine: BackgroundEngine;

  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
    mockWallets.length = 0;
    mockMempool.length = 0;
    engine = new BackgroundEngine();
  });

  afterEach(() => {
    engine.stop();
    vi.useRealTimers();
  });

  it('should create simulated wallets on start', () => {
    engine.start();
    const peers = engine.getPeerWallets();
    expect(peers.length).toBeGreaterThan(0);
    expect(peers[0].name).toContain('Wallet');
  });

  it('should generate transactions periodically', () => {
    engine.start();
    vi.advanceTimersByTime(60000);
    const setState = useWalletStore.setState as unknown as ReturnType<typeof vi.fn>;
    expect(setState).toHaveBeenCalled();
  });

  it('should mine blocks periodically', () => {
    mockMempool.push({ from: '0x1', to: '0x2', amount: 1, fee: 0.1, signature: 'sig' });

    engine.start();
    vi.advanceTimersByTime(3600000);

    expect(mockMineMempool).toHaveBeenCalled();
  });
});
