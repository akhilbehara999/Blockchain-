import { Block } from './types';
import { sha256 } from './hash';

/**
 * Creates a new block instance.
 *
 * @param index - The index of the block in the chain
 * @param data - Data to be stored in the block (e.g., transactions)
 * @param previousHash - Hash of the previous block
 * @param _difficulty - Mining difficulty (unused in creation, used in mining)
 * @returns A new Block object
 */
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

/**
 * Calculates the SHA-256 hash of a block.
 *
 * @param block - The block to hash
 * @returns The hexadecimal hash string
 */
export function calculateHash(block: Block): string {
  const { index, timestamp, data, previousHash, nonce } = block;
  // Note: Using a simplified concatenation for demonstration
  return sha256(index.toString() + previousHash + timestamp.toString() + data + nonce.toString());
}

/**
 * Validates if a block meets the difficulty requirement.
 *
 * @param block - The block to validate
 * @param difficulty - Number of required leading zeros
 * @returns True if valid, false otherwise
 */
export function isBlockValid(block: Block, difficulty: number): boolean {
  const target = '0'.repeat(difficulty);
  return block.hash.startsWith(target);
}

/**
 * Mines a block by finding a nonce that satisfies the difficulty.
 * **Warning: Blocking operation.** Should be run in a web worker in production.
 *
 * @param block - The block to mine
 * @param difficulty - Number of required leading zeros
 * @returns The mined block with valid nonce and hash
 */
export function mineBlock(block: Block, difficulty: number): Block {
  const target = '0'.repeat(difficulty);
  while (!block.hash.startsWith(target)) {
    block.nonce++;
    block.hash = calculateHash(block);
  }
  return block;
}

/**
 * Calculates the number of confirmations for a block.
 *
 * @param blockIndex - Index of the block
 * @param chainLength - Total length of the chain
 * @returns Number of blocks added after this block
 */
export function calculateConfirmations(blockIndex: number, chainLength: number): number {
  return Math.max(0, chainLength - 1 - blockIndex);
}
