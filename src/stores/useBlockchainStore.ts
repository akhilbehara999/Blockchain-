import { create } from 'zustand';
import { Blockchain } from '../engine/blockchain';
import { Block } from '../engine/types';

interface BlockchainState {
  blocks: Block[];
  difficulty: number;
  selectedBlockIndex: number | null;

  initializeChain: (blockCount: number) => void;
  addBlock: (data: string) => void;
  editBlock: (index: number, newData: string) => void;
  mineBlock: (index: number) => void;
  resetChain: () => void;
  setDifficulty: (d: number) => void;
  selectBlock: (index: number | null) => void;
}

// Internal singleton instance to maintain state logic
let blockchain = new Blockchain(2);

export const useBlockchainStore = create<BlockchainState>((set, get) => ({
  blocks: blockchain.getChain(),
  difficulty: 2,
  selectedBlockIndex: null,

  initializeChain: (blockCount: number) => {
    const difficulty = get().difficulty;
    blockchain = new Blockchain(difficulty);
    // Add additional blocks if requested (genesis is index 0)
    for (let i = 1; i < blockCount; i++) {
      blockchain.addBlock(`Block #${i} Data`);
    }
    set({ blocks: [...blockchain.getChain()] });
  },

  addBlock: (data: string) => {
    blockchain.addBlock(data);
    set({ blocks: [...blockchain.getChain()] });
  },

  editBlock: (index: number, newData: string) => {
    blockchain.editBlockData(index, newData);
    // Create a new array to trigger React updates
    set({ blocks: [...blockchain.getChain()] });
  },

  mineBlock: (index: number) => {
    blockchain.mineBlock(index);
    set({ blocks: [...blockchain.getChain()] });
  },

  resetChain: () => {
    const difficulty = get().difficulty;
    blockchain = new Blockchain(difficulty);
    set({ blocks: [...blockchain.getChain()], selectedBlockIndex: null });
  },

  setDifficulty: (d: number) => {
    blockchain.setDifficulty(d);
    set({ difficulty: d });
  },

  selectBlock: (index: number | null) => {
    set({ selectedBlockIndex: index });
  },
}));
