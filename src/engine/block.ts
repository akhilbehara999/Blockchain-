import { Block } from './types';
import { sha256 } from './hash';

export function createBlock(index: number, data: string, previousHash: string, _difficulty: number): Block {
  const timestamp = Date.now();
  const nonce = 0;

  const block: Block = {
    index,
    timestamp,
    data,
    previousHash,
    nonce,
    hash: '',
  };

  block.hash = calculateHash(block);

  return block;
}

export function calculateHash(block: Block): string {
  const { index, timestamp, data, previousHash, nonce } = block;
  return sha256(index.toString() + previousHash + timestamp.toString() + data + nonce.toString());
}

export function isBlockValid(block: Block, difficulty: number): boolean {
  const target = '0'.repeat(difficulty);
  return block.hash.startsWith(target);
}

export function mineBlock(block: Block, difficulty: number): Block {
  const target = '0'.repeat(difficulty);
  while (!block.hash.startsWith(target)) {
    block.nonce++;
    block.hash = calculateHash(block);
  }
  return block;
}

export function calculateConfirmations(blockIndex: number, chainLength: number): number {
  return Math.max(0, chainLength - 1 - blockIndex);
}
