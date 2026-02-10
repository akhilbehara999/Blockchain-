import { create } from 'zustand';
import { Block } from '../engine/types';

interface Miner {
  name: string;
  hashRate: number;
  progress: number;
}

interface MiningState {
  isMining: boolean;
  nonceTried: number;
  currentHash: string;
  difficulty: number;
  miners: Miner[];

  startMining: (blockData: Block) => void;
  stopMining: () => void;
  setDifficulty: (d: number) => void;
  updateProgress: (nonce: number, hash: string) => void;
}

export const useMiningStore = create<MiningState>((set) => ({
  isMining: false,
  nonceTried: 0,
  currentHash: '',
  difficulty: 2,
  miners: [
    { name: 'You', hashRate: 0, progress: 0 },
  ],

  startMining: (_blockData: Block) => {
    set({ isMining: true, nonceTried: 0, currentHash: '' });
  },

  stopMining: () => {
    set({ isMining: false });
  },

  setDifficulty: (d: number) => {
    set({ difficulty: d });
  },

  updateProgress: (nonce: number, hash: string) => {
    set({ nonceTried: nonce, currentHash: hash });
  },
}));
