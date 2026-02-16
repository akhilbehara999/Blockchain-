import { useBlockchainStore } from '../stores/useBlockchainStore';
import { useForkStore } from '../stores/useForkStore';

import { Block } from './types';
import { createBlock, mineBlock } from './block';

export class ForkManager {
  private static instance: ForkManager;
  private FORK_PROBABILITY = 0.15;
  private readonly FORK_DELAY_MIN = 2000;
  private readonly FORK_DELAY_MAX = 5000;
  private minerAssignments: Map<string, 'A' | 'B'> = new Map();

  private constructor() {}

  public static getInstance(): ForkManager {
    if (!ForkManager.instance) {
      ForkManager.instance = new ForkManager();
    }
    return ForkManager.instance;
  }

  public setForkProbability(prob: number) {
    this.FORK_PROBABILITY = prob;
  }

  public forceFork(blockData: string, minerName: string, competingMinerName?: string) {
    this.initiateFork(blockData, minerName, competingMinerName);
  }

  public assignMinerToChain(minerName: string, chain: 'A' | 'B') {
    this.minerAssignments.set(minerName, chain);
  }

  public clearMinerAssignments() {
    this.minerAssignments.clear();
  }

  // Called by BackgroundEngine when a block is mined
  public processBlock(blockData: string, minerName: string): void {
    const { activeFork } = useForkStore.getState();
    const { blocks, addBlock } = useBlockchainStore.getState();

    // 1. If Fork is Active, handle concurrently
    if (activeFork && activeFork.status === 'active') {
      this.handleActiveFork(blockData, minerName, activeFork);
      return;
    }

    // 2. If no fork, check if we should start one
    if (blocks.length > 2 && Math.random() < this.FORK_PROBABILITY) {
      this.initiateFork(blockData, minerName);
      return;
    }

    // 3. Normal operation
    addBlock(blockData);
  }

  private handleActiveFork(blockData: string, minerName: string, activeFork: any) {
    // Check assignment
    let targetChain: 'A' | 'B';

    if (this.minerAssignments.has(minerName)) {
      targetChain = this.minerAssignments.get(minerName)!;
    } else {
      // Randomly choose chain to extend (50/50)
      targetChain = Math.random() > 0.5 ? 'A' : 'B';
    }

    if (targetChain === 'A') {
      // Extend Chain A (Main Chain)
      useBlockchainStore.getState().addBlock(blockData);

      // Get the new block
      const currentChain = useBlockchainStore.getState().blocks;
      const newBlock = currentChain[currentChain.length - 1];

      useForkStore.getState().addBlockToFork('A', newBlock);
      this.checkResolution(activeFork.forkPoint);
    } else {
      // Extend Chain B (Competing Chain)
      const chainB = activeFork.chainB;
      const parentBlock = chainB[chainB.length - 1];

      const difficulty = useBlockchainStore.getState().difficulty;

      // Create block manually
      const newBlock = createBlock(parentBlock.index + 1, blockData, parentBlock.hash, difficulty);
      mineBlock(newBlock, difficulty);

      useForkStore.getState().addBlockToFork('B', newBlock);
      this.checkResolution(activeFork.forkPoint);
    }
  }

  private initiateFork(blockData: string, _minerName: string, competingMinerName?: string) {
    const { blocks, addBlock } = useBlockchainStore.getState();
    const parentBlock = blocks[blocks.length - 1];

    // 1. Mine Block A immediately (Main Chain)
    addBlock(blockData);
    const chain = useBlockchainStore.getState().blocks;
    const blockA = chain[chain.length - 1];

    // 2. Schedule Block B (Competing Chain)
    const delay = Math.random() * (this.FORK_DELAY_MAX - this.FORK_DELAY_MIN) + this.FORK_DELAY_MIN;

    setTimeout(() => {
        // Construct Block B
        // We need a different miner name for visual clarity
        const competingMiner = competingMinerName || `Miner_${Math.random().toString(36).substring(7).toUpperCase()}`;

        let blockBData = blockData;
        if (blockBData.includes("Mined by")) {
             blockBData = blockBData.replace(/Mined by [^\n]+/, `Mined by ${competingMiner}`);
        } else {
             blockBData = `Mined by ${competingMiner}\n${blockBData}`;
        }

        const difficulty = useBlockchainStore.getState().difficulty;
        const blockB = createBlock(blockA.index, blockBData, parentBlock.hash, difficulty);
        mineBlock(blockB, difficulty);

        // Start Fork in Store
        useForkStore.getState().startFork(parentBlock.index, blockA, blockB);

    }, delay);
  }

  private checkResolution(forkPoint: number) {
    const { activeFork, resolveFork, triggerReorg } = useForkStore.getState();
    if (!activeFork || activeFork.status !== 'active') return;

    const lenA = activeFork.chainA.length;
    const lenB = activeFork.chainB.length;

    if (lenA > lenB) {
        // A Wins
        resolveFork('A', activeFork.chainB);
        this.returnOrphansToMempool(activeFork.chainB);
    } else if (lenB > lenA) {
        // B Wins -> REORG
        const { blocks, replaceChain } = useBlockchainStore.getState();
        const sharedHistory = blocks.slice(0, forkPoint + 1);
        const newChain = [...sharedHistory, ...activeFork.chainB];

        // Apply Reorg
        replaceChain(newChain);

        // Trigger Alert
        triggerReorg({
            blocksReplaced: lenA,
            txsReturned: this.countTransactions(activeFork.chainA),
            oldChain: activeFork.chainA,
            newChain: activeFork.chainB
        });

        resolveFork('B', activeFork.chainA);
        this.returnOrphansToMempool(activeFork.chainA);
    }
  }

  private returnOrphansToMempool(_orphans: Block[]) {
      // Since we can't fully restore transaction objects from string data in this engine,
      // we primarily rely on the visual alert to inform the user.
      // In a real implementation, we would parse and re-add to mempool.
  }

  private countTransactions(blocks: Block[]): number {
      let count = 0;
      blocks.forEach(b => {
          const lines = b.data.split('\n');
          // Assuming first line is "Mined by...", rest are txs
          if (lines.length > 1) count += lines.length - 1;
      });
      return count;
  }
}

export const forkManager = ForkManager.getInstance();
