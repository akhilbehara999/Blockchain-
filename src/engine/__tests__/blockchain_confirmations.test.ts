import { describe, it, expect, beforeEach } from 'vitest';
import { Blockchain } from '../blockchain';

describe('Blockchain Confirmations', () => {
  let blockchain: Blockchain;

  beforeEach(() => {
    blockchain = new Blockchain(1); // Difficulty 1 for speed
  });

  it('should initialize genesis block with 0 confirmations (chain length 1)', () => {
    const chain = blockchain.getChain();
    expect(chain.length).toBe(1);
    // Chain length 1. Block index 0. Confirmations = 1 - 1 - 0 = 0.
    expect(chain[0].confirmations).toBe(0);
  });

  it('should update confirmations when adding blocks', () => {
    blockchain.addBlock('Block 1');
    // Chain length 2.
    // Genesis (index 0): 2 - 1 - 0 = 1.
    // Block 1 (index 1): 2 - 1 - 1 = 0.
    let chain = blockchain.getChain();
    expect(chain[0].confirmations).toBe(1);
    expect(chain[1].confirmations).toBe(0);

    blockchain.addBlock('Block 2');
    // Chain length 3.
    // Genesis (0): 3 - 1 - 0 = 2.
    // Block 1 (1): 3 - 1 - 1 = 1.
    // Block 2 (2): 3 - 1 - 2 = 0.
    chain = blockchain.getChain();
    expect(chain[0].confirmations).toBe(2);
    expect(chain[1].confirmations).toBe(1);
    expect(chain[2].confirmations).toBe(0);
  });

  it('should calculate confirmations correctly for deeper chains', () => {
    for (let i = 0; i < 6; i++) {
        blockchain.addBlock(`Block ${i+1}`);
    }
    // Chain length: 1 (genesis) + 6 = 7.
    const chain = blockchain.getChain();

    // Genesis (index 0): 7 - 1 - 0 = 6. (Finalized)
    expect(chain[0].confirmations).toBe(6);

    // Block 1 (index 1): 7 - 1 - 1 = 5. (Confirmed)
    expect(chain[1].confirmations).toBe(5);

    // Tip (index 6): 7 - 1 - 6 = 0.
    expect(chain[6].confirmations).toBe(0);
  });

  it('should prevent editing finalized blocks', () => {
    for (let i = 0; i < 7; i++) {
        blockchain.addBlock(`Block ${i+1}`);
    }
    // Chain length 8.
    // Genesis (0): 8-1-0 = 7 (Finalized).
    // Block 1 (1): 8-1-1 = 6 (Finalized).

    const genesisData = blockchain.getChain()[0].data;
    blockchain.editBlockData(0, 'Tampered Data');

    // Should remain unchanged
    expect(blockchain.getChain()[0].data).toBe(genesisData);

    const block1Data = blockchain.getChain()[1].data;
    blockchain.editBlockData(1, 'Tampered Data');
    expect(blockchain.getChain()[1].data).toBe(block1Data);

    // Block 2 (2): 8-1-2 = 5 (Not finalized).
    const block2Data = blockchain.getChain()[2].data;
    blockchain.editBlockData(2, 'Tampered Data');
    // Should change (assuming editBlockData works for non-finalized)
    expect(blockchain.getChain()[2].data).toBe('Tampered Data');
  });

  it('should prevent mining finalized blocks', () => {
    // Note: mining changes nonce and hash.
    for (let i = 0; i < 7; i++) {
        blockchain.addBlock(`Block ${i+1}`);
    }
    const genesisNonce = blockchain.getChain()[0].nonce;
    blockchain.mineBlock(0);
    expect(blockchain.getChain()[0].nonce).toBe(genesisNonce);
  });
});
