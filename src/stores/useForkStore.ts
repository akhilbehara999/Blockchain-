import { create } from 'zustand';
import { Block } from '../engine/types';

export interface ForkData {
  forkPoint: number;
  chainA: Block[]; // The main chain currently
  chainB: Block[]; // The competing chain
  status: 'active' | 'resolved';
  winner: 'A' | 'B' | null;
  orphanedBlocks: Block[];
}

export interface ReorgEvent {
  blocksReplaced: number;
  txsReturned: number;
  oldChain: Block[];
  newChain: Block[];
}

interface ForkState {
  activeFork: ForkData | null;
  reorgEvent: ReorgEvent | null;

  startFork: (forkPoint: number, blockA: Block, blockB: Block) => void;
  addBlockToFork: (chain: 'A' | 'B', block: Block) => void;
  resolveFork: (winner: 'A' | 'B', orphans: Block[]) => void;
  triggerReorg: (event: ReorgEvent) => void;
  dismissReorg: () => void;
  reset: () => void;
}

export const useForkStore = create<ForkState>((set, get) => ({
  activeFork: null,
  reorgEvent: null,

  startFork: (forkPoint, blockA, blockB) => {
    set({
      activeFork: {
        forkPoint,
        chainA: [blockA],
        chainB: [blockB],
        status: 'active',
        winner: null,
        orphanedBlocks: []
      }
    });
  },

  addBlockToFork: (chain, block) => {
    const { activeFork } = get();
    if (!activeFork || activeFork.status !== 'active') return;

    if (chain === 'A') {
      set({
        activeFork: {
          ...activeFork,
          chainA: [...activeFork.chainA, block]
        }
      });
    } else {
      set({
        activeFork: {
          ...activeFork,
          chainB: [...activeFork.chainB, block]
        }
      });
    }
  },

  resolveFork: (winner, orphans) => {
    const { activeFork } = get();
    if (!activeFork) return;

    set({
      activeFork: {
        ...activeFork,
        status: 'resolved',
        winner,
        orphanedBlocks: orphans
      }
    });

    // Auto-clear resolved fork visualization after 10s so it doesn't persist forever
    setTimeout(() => {
        // Only clear if it's still the same fork instance (simple check)
        const current = get().activeFork;
        if (current && current.status === 'resolved' && current.forkPoint === activeFork.forkPoint) {
             set({ activeFork: null });
        }
    }, 10000);
  },

  triggerReorg: (event) => {
    set({ reorgEvent: event });
  },

  dismissReorg: () => {
    set({ reorgEvent: null });
  },

  reset: () => {
    set({ activeFork: null, reorgEvent: null });
  }
}));
