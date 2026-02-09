import { Block } from './types';

export function simulateSoftFork(
  chain: Block[],
  forkPoint: number,
  newRule: string
): { chain: Block[]; forkPoint: number; rule: string } {
  // Soft fork: tighter rules.
  // In a simulation, we just mark the point and rule.
  // The chain history remains valid for old nodes.
  return {
    chain: [...chain],
    forkPoint,
    rule: newRule,
  };
}

export function simulateHardFork(
  chain: Block[],
  forkPoint: number
): { chainA: Block[]; chainB: Block[] } {
  // Hard fork: split in the chain.
  // Both chains share history up to forkPoint.

  if (forkPoint < 0 || forkPoint >= chain.length) {
    throw new Error('Fork point out of bounds');
  }

  const sharedHistory = chain.slice(0, forkPoint + 1);
  const divergentBlocks = chain.slice(forkPoint + 1);

  // Chain A: Original chain (continues with existing blocks)
  const chainA = [...chain];

  // Chain B: New chain (diverges)
  // We simulate divergence by modifying the data of the blocks after the fork point.
  // In a real scenario, these would be completely different blocks mined by different nodes.
  const chainB = [...sharedHistory];

  divergentBlocks.forEach((block) => {
    const newBlock = { ...block };
    newBlock.data = `[Forked] ${block.data}`;
    newBlock.hash = `forked-${block.hash}`; // Simplified hash change
    chainB.push(newBlock);
  });

  return { chainA, chainB };
}
