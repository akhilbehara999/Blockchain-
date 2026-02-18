import { useBlockchainStore } from '../stores/useBlockchainStore';
import { useWalletStore } from '../stores/useWalletStore';
import { backgroundEngine, Miner } from './BackgroundEngine';
import { eventEngine, NetworkEvent } from './EventEngine';
import { Block, Transaction, Wallet } from './types';
import { Storage } from '../utils/storage';

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

  public static saveState(): void {
    const blocks = useBlockchainStore.getState().blocks;
    const { wallets, mempool } = useWalletStore.getState();
    const backgroundState = backgroundEngine.getState();
    const events = eventEngine.getEvents();
    const lastActive = Date.now();

    Storage.setItem(this.STORAGE_KEYS.BLOCKCHAIN, blocks);
    Storage.setItem(this.STORAGE_KEYS.WALLETS, wallets);
    Storage.setItem(this.STORAGE_KEYS.MEMPOOL, mempool);
    Storage.setItem(this.STORAGE_KEYS.BACKGROUND, backgroundState);
    Storage.setItem(this.STORAGE_KEYS.EVENTS, events);
    Storage.setItem(this.STORAGE_KEYS.LAST_ACTIVE, lastActive);
  }

  public static loadState(): SimulationState | null {
    const blocks = Storage.getItem<Block[]>(this.STORAGE_KEYS.BLOCKCHAIN);
    const wallets = Storage.getItem<Wallet[]>(this.STORAGE_KEYS.WALLETS);
    const mempool = Storage.getItem<Transaction[]>(this.STORAGE_KEYS.MEMPOOL);
    const backgroundState = Storage.getItem<{ miners: Miner[], peerWallets: string[] }>(this.STORAGE_KEYS.BACKGROUND);
    const events = Storage.getItem<NetworkEvent[]>(this.STORAGE_KEYS.EVENTS);
    const lastActive = Storage.getItem<number>(this.STORAGE_KEYS.LAST_ACTIVE);

    if (!blocks || !wallets) return null;

    return {
      blocks,
      wallets,
      mempool: mempool || [],
      backgroundState: backgroundState || { miners: [], peerWallets: [] },
      events: events || [],
      lastActive: lastActive || Date.now(),
    };
  }

  public static restoreState(state: SimulationState): void {
    // 1. Restore Blockchain
    useBlockchainStore.getState().replaceChain(state.blocks);

    // 2. Restore Wallets & Mempool
    useWalletStore.getState().restoreState(state.wallets, state.mempool);

    // 3. Restore Background Engine
    backgroundEngine.restoreState(state.backgroundState);

    // 4. Restore Events
    eventEngine.restoreEvents(state.events);
  }

  public static getTimeSinceLastActive(): number {
    const lastActive = Storage.getItem<number>(this.STORAGE_KEYS.LAST_ACTIVE);
    if (!lastActive) return 0;
    return (Date.now() - lastActive) / 1000; // Seconds
  }

  public static clearState(): void {
    Object.values(this.STORAGE_KEYS).forEach(key => Storage.removeItem(key));
  }
}
