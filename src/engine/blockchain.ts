import { Block } from './types';
import { createBlock, calculateHash, isBlockValid, mineBlock } from './block';

export class Blockchain {
  private chain: Block[];
  private difficulty: number;

  constructor(difficulty: number = 2, genesisBlock?: Block) {
    this.difficulty = difficulty;
    if (genesisBlock) {
      this.chain = [{ ...genesisBlock }];
    } else {
      const genesis = createBlock(0, "Genesis Block", "0", this.difficulty);
      // Determine if genesis block needs to be mined.
      // Usually yes for validity checks to pass uniformly.
      mineBlock(genesis, this.difficulty);
      this.chain = [genesis];
    }
  }

  public getChain(): Block[] {
    return this.chain;
  }

  public getLatestBlock(): Block {
    return this.chain[this.chain.length - 1];
  }

  public addBlock(data: string): Block {
    const previousBlock = this.getLatestBlock();
    const newIndex = previousBlock.index + 1;
    const newBlock = createBlock(newIndex, data, previousBlock.hash, this.difficulty);
    mineBlock(newBlock, this.difficulty);
    this.chain.push(newBlock);
    return newBlock;
  }

  public isChainValid(): boolean {
    for (let i = 1; i < this.chain.length; i++) {
      const currentBlock = this.chain[i];
      const previousBlock = this.chain[i - 1];

      // Check if hash matches content
      if (currentBlock.hash !== calculateHash(currentBlock)) {
        return false;
      }

      // Check if previousHash matches previous block's hash
      if (currentBlock.previousHash !== previousBlock.hash) {
        return false;
      }

      // Check if block meets difficulty
      if (!isBlockValid(currentBlock, this.difficulty)) {
        return false;
      }
    }

    // Optionally check genesis block integrity
    const genesis = this.chain[0];
    if (genesis.index !== 0 || genesis.previousHash !== "0" || genesis.data !== "Genesis Block") {
        return false;
    }
    // Genesis block hash check
    if (genesis.hash !== calculateHash(genesis)) {
        return false;
    }
    if (!isBlockValid(genesis, this.difficulty)) {
        return false;
    }

    return true;
  }

  public replaceChain(newChain: Block[]): boolean {
    // If new chain is not longer, only replace if current chain is invalid
    if (newChain.length <= this.chain.length && this.isChainValid()) {
      return false;
    }

    // Verify the new chain
    if (!this.isValidChain(newChain)) {
      return false;
    }

    this.chain = newChain.map(b => ({ ...b }));
    return true;
  }

  public receiveBlock(block: Block): boolean {
    const latestBlock = this.getLatestBlock();

    // Check linkage
    if (block.previousHash !== latestBlock.hash) {
      return false;
    }
    if (block.index !== latestBlock.index + 1) {
      return false;
    }

    // Check integrity
    if (block.hash !== calculateHash(block)) {
      return false;
    }

    // Check proof of work
    if (!isBlockValid(block, this.difficulty)) {
      return false;
    }

    this.chain.push({ ...block });
    return true;
  }

  // Helper to validate any chain, not just the current one instance
  private isValidChain(chain: Block[]): boolean {
    if (chain.length === 0) return false;

    // Check genesis
    const genesis = chain[0];
    if (genesis.index !== 0 || genesis.previousHash !== "0" || genesis.data !== "Genesis Block") {
        return false;
    }
    if (genesis.hash !== calculateHash(genesis)) {
        return false;
    }
    // We assume the difficulty of the incoming chain matches current difficulty?
    // Or we just check validity. The prompt says "replaceChain only accepts longer valid chains".
    // Valid means blocks are valid.
    if (!isBlockValid(genesis, this.difficulty)) {
        return false;
    }

    for (let i = 1; i < chain.length; i++) {
      const currentBlock = chain[i];
      const previousBlock = chain[i - 1];

      if (currentBlock.index !== previousBlock.index + 1) return false;
      if (currentBlock.hash !== calculateHash(currentBlock)) return false;
      if (currentBlock.previousHash !== previousBlock.hash) return false;
      if (!isBlockValid(currentBlock, this.difficulty)) return false;
    }

    return true;
  }

  public setDifficulty(d: number): void {
    this.difficulty = d;
  }

  public getBlock(index: number): Block | undefined {
    return this.chain.find(b => b.index === index);
  }

  public editBlockData(index: number, newData: string): void {
    const block = this.chain[index];
    if (block) {
      block.data = newData;
      block.hash = calculateHash(block);
      // Do NOT re-mine
    }
  }

  public setBlockPreviousHash(index: number, hash: string): void {
    const block = this.chain[index];
    if (block) {
      block.previousHash = hash;
      block.hash = calculateHash(block);
    }
  }

  public mineBlock(index: number): Block | undefined {
    const block = this.chain[index];
    if (block) {
      mineBlock(block, this.difficulty);
    }
    return block;
  }
}
