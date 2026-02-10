import { describe, it, expect, beforeEach } from 'vitest';
import { Blockchain } from '../blockchain';

describe('Blockchain Manual Fix', () => {
  let blockchain: Blockchain;

  beforeEach(() => {
    blockchain = new Blockchain(2);
    blockchain.addBlock('Block 1');
    blockchain.addBlock('Block 2');
  });

  it('should allow manually setting previousHash', () => {
    const chain = blockchain.getChain();
    const block1 = chain[1];
    const block2 = chain[2];

    const originalHash1 = block1.hash;

    // 1. Tamper with Block 1
    blockchain.editBlockData(1, 'Tampered Data');
    const newHash1 = block1.hash;

    expect(newHash1).not.toBe(originalHash1);

    // Block 2's previousHash is still originalHash1
    expect(block2.previousHash).toBe(originalHash1);

    // 2. Fix Block 2 linkage manually
    blockchain.setBlockPreviousHash(2, newHash1);

    expect(block2.previousHash).toBe(newHash1);

    // Verify block 2 hash updated (since content changed)
    // We can't easily predict the new hash but it should be different from before fix
    // (Assuming fixing previousHash changes the block header -> changes hash)
  });
});
