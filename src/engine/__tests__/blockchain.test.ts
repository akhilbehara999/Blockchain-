import { describe, it, expect, beforeEach } from 'vitest';
import { Blockchain } from '../blockchain';
import { createBlock, calculateHash, mineBlock, isBlockValid } from '../block';

describe('Blockchain', () => {
  let blockchain: Blockchain;

  beforeEach(() => {
    blockchain = new Blockchain();
  });

  it('should create a genesis block correctly', () => {
    const chain = blockchain.getChain();
    expect(chain.length).toBe(1);
    const genesis = chain[0];
    expect(genesis.index).toBe(0);
    expect(genesis.data).toBe('Genesis Block');
    expect(genesis.previousHash).toBe('0');
    expect(genesis.hash).toBe(calculateHash(genesis));
    // Check if mined
    expect(isBlockValid(genesis, 2)).toBe(true);
  });

  it('should add blocks and maintain validity', () => {
    blockchain.addBlock('Block 1');
    blockchain.addBlock('Block 2');

    expect(blockchain.getChain().length).toBe(3);
    expect(blockchain.isChainValid()).toBe(true);

    const latest = blockchain.getLatestBlock();
    expect(latest.data).toBe('Block 2');
    expect(latest.index).toBe(2);
  });

  it('should invalidate chain when block data is edited', () => {
    blockchain.addBlock('Block 1');
    const chain = blockchain.getChain();
    const block1 = chain[1];

    // Edit block data
    blockchain.editBlockData(1, 'Tampered Data');

    // Verify hash changed but nonce didn't re-mine, so invalid
    expect(block1.data).toBe('Tampered Data');

    // The block itself should be invalid because hash != calculateHash(block)?
    // editBlockData updates hash to match content.
    // But it doesn't re-mine. So hash won't meet difficulty.
    // AND subsequent block's previousHash won't match this new hash.

    expect(blockchain.isChainValid()).toBe(false);
  });

  it('should verify replaceChain logic', () => {
    const chain1 = new Blockchain();
    chain1.addBlock('Data 1');

    const chain2 = new Blockchain();
    chain2.addBlock('Data 1');
    chain2.addBlock('Data 2');

    // chain2 is longer and valid
    expect(chain1.replaceChain(chain2.getChain())).toBe(true);
    expect(chain1.getChain().length).toBe(3); // Genesis + 2 blocks

    // Try replacing with shorter chain
    const chain3 = new Blockchain();
    expect(chain1.replaceChain(chain3.getChain())).toBe(false);

    // Try replacing with invalid chain (same length but invalid)
    const chain4 = new Blockchain();
    chain4.addBlock('Data 1');
    chain4.addBlock('Data 2');
    chain4.addBlock('Data 3');

    // Tamper with chain4
    chain4.editBlockData(1, 'Bad Data');

    // chain4 is longer than chain1 (now length 3), chain4 is length 4.
    // But chain4 is invalid.
    expect(chain1.replaceChain(chain4.getChain())).toBe(false);
  });
});
