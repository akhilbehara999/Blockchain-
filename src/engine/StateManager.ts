import { useBlockchainStore } from '../stores/useBlockchainStore';
import { useWalletStore } from '../stores/useWalletStore';
import { backgroundEngine, Miner } from './BackgroundEngine';
import { eventEngine, NetworkEvent } from './EventEngine';
import { Block, Transaction, Wallet } from './types';

interface SimulationState {
  blocks: Block[];
  wallets: Wallet[];
  mempool: Transaction[];
  backgroundState: { miners: Miner[], peerWallets: string[] };
  events: NetworkEvent[];
  lastActive: number;
}

export class StateManager {
  private static readonly STORAGE_KEYS = {
    BLOCKCHAIN: 'yupp_blockchain',
    WALLETS: 'yupp_wallets',
    MEMPOOL: 'yupp_mempool',
    BACKGROUND: 'yupp_background_state',
    EVENTS: 'yupp_events',
    LAST_ACTIVE: 'yupp_last_active',
  };

  private static readonly STORAGE_QUOTA_THRESHOLD = 4.5 * 1024 * 1024; // 4.5 MB

  public static saveState(): void {
    const blocks = useBlockchainStore.getState().blocks;
    const { wallets, mempool } = useWalletStore.getState();
    const backgroundState = backgroundEngine.getState();
    const events = eventEngine.getEvents();
    const lastActive = Date.now();

    try {
      localStorage.setItem(this.STORAGE_KEYS.BLOCKCHAIN, JSON.stringify(blocks));
      localStorage.setItem(this.STORAGE_KEYS.WALLETS, JSON.stringify(wallets));
      localStorage.setItem(this.STORAGE_KEYS.MEMPOOL, JSON.stringify(mempool));
      localStorage.setItem(this.STORAGE_KEYS.BACKGROUND, JSON.stringify(backgroundState));
      localStorage.setItem(this.STORAGE_KEYS.EVENTS, JSON.stringify(events));
      localStorage.setItem(this.STORAGE_KEYS.LAST_ACTIVE, lastActive.toString());

      this.checkQuota();
    } catch (e) {
      console.error('Failed to save state to localStorage', e);
      // Emergency cleanup
      localStorage.removeItem(this.STORAGE_KEYS.MEMPOOL);
      localStorage.removeItem(this.STORAGE_KEYS.EVENTS);
    }
  }

  public static loadState(): SimulationState | null {
    try {
      const blocksStr = localStorage.getItem(this.STORAGE_KEYS.BLOCKCHAIN);
      const walletsStr = localStorage.getItem(this.STORAGE_KEYS.WALLETS);
      const mempoolStr = localStorage.getItem(this.STORAGE_KEYS.MEMPOOL);
      const backgroundStr = localStorage.getItem(this.STORAGE_KEYS.BACKGROUND);
      const eventsStr = localStorage.getItem(this.STORAGE_KEYS.EVENTS);
      const lastActiveStr = localStorage.getItem(this.STORAGE_KEYS.LAST_ACTIVE);

      if (!blocksStr || !walletsStr) return null;

      return {
        blocks: JSON.parse(blocksStr),
        wallets: JSON.parse(walletsStr),
        mempool: mempoolStr ? JSON.parse(mempoolStr) : [],
        backgroundState: backgroundStr ? JSON.parse(backgroundStr) : { miners: [], peerWallets: [] },
        events: eventsStr ? JSON.parse(eventsStr) : [],
        lastActive: lastActiveStr ? parseInt(lastActiveStr, 10) : Date.now(),
      };
    } catch (e) {
      console.error('Failed to load state', e);
      return null;
    }
  }

  public static restoreState(state: SimulationState): void {
    // 1. Restore Blockchain
    // We use a trick: directly replace the chain if valid, or just load it
    // Since replaceChain validates, and we saved a valid chain, it should work.
    useBlockchainStore.getState().replaceChain(state.blocks);

    // 2. Restore Wallets & Mempool
    useWalletStore.getState().restoreState(state.wallets, state.mempool);

    // 3. Restore Background Engine
    backgroundEngine.restoreState(state.backgroundState);

    // 4. Restore Events
    eventEngine.restoreEvents(state.events);
  }

  public static getTimeSinceLastActive(): number {
    const lastActiveStr = localStorage.getItem(this.STORAGE_KEYS.LAST_ACTIVE);
    if (!lastActiveStr) return 0;
    const lastActive = parseInt(lastActiveStr, 10);
    return (Date.now() - lastActive) / 1000; // Seconds
  }

  public static clearState(): void {
    Object.values(this.STORAGE_KEYS).forEach(key => localStorage.removeItem(key));
  }

  private static checkQuota(): void {
    let total = 0;
    for (const key in localStorage) {
        if (localStorage.hasOwnProperty(key)) {
            const val = localStorage.getItem(key);
            if (val) total += val.length * 2;
        }
    }

    if (total > this.STORAGE_QUOTA_THRESHOLD) {
        console.warn('LocalStorage is near quota. Pruning events and mempool.');
        localStorage.setItem(this.STORAGE_KEYS.EVENTS, '[]');
        localStorage.setItem(this.STORAGE_KEYS.MEMPOOL, '[]');
    }
  }
}
