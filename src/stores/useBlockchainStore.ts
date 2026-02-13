import { create } from 'zustand';
import { Blockchain } from '../engine/blockchain';
import { Block } from '../engine/types';

interface BlockchainState {
  blocks: Block[];
  difficulty: number;
  selectedBlockIndex: number | null;

  initializeChain: (blockCount: number) => void;
  initializeWithData: (data: string[]) => void;
  addBlock: (data: string) => void;
  editBlock: (index: number, newData: string) => void;
  mineBlock: (index: number) => void;
  resetChain: () => void;
  setDifficulty: (d: number) => void;
  selectBlock: (index: number | null) => void;
  replaceChain: (newChain: Block[]) => void;
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

  initializeWithData: (data: string[]) => {
    const difficulty = get().difficulty;
    blockchain = new Blockchain(difficulty);

    // Handle Genesis Block (index 0)
    if (data.length > 0 && data[0] !== "Genesis Block") {
       blockchain.editBlockData(0, data[0]);
       blockchain.mineBlock(0);
    }

    for (let i = 1; i < data.length; i++) {
      blockchain.addBlock(data[i]);
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
    const chain = blockchain.getChain();
    if (index > 0) {
      const prevBlock = chain[index - 1];
      const currBlock = chain[index];
      // Auto-fix linkage if broken
      if (currBlock.previousHash !== prevBlock.hash) {
        blockchain.setBlockPreviousHash(index, prevBlock.hash);
      }
    }
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

  replaceChain: (newChain: Block[]) => {
    const success = blockchain.replaceChain(newChain);
    if (success) {
      set({ blocks: [...blockchain.getChain()] });
    }
  },
}));
