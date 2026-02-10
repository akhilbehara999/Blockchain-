import { describe, it, expect, beforeEach } from 'vitest';
import { useBlockchainStore } from '../useBlockchainStore';

describe('useBlockchainStore', () => {
  beforeEach(() => {
    useBlockchainStore.getState().resetChain();
    useBlockchainStore.getState().initializeChain(1);
  });

  it('should initialize with genesis block', () => {
    const { blocks } = useBlockchainStore.getState();
    expect(blocks).toHaveLength(1);
    expect(blocks[0].index).toBe(0);
    expect(blocks[0].data).toBe('Genesis Block');
  });

  it('should add a block', () => {
    useBlockchainStore.getState().addBlock('Test Data');
    const { blocks } = useBlockchainStore.getState();
    expect(blocks).toHaveLength(2);
    expect(blocks[1].data).toBe('Test Data');
    expect(blocks[1].previousHash).toBe(blocks[0].hash);
  });

  it('should edit a block and invalidate chain', () => {
    useBlockchainStore.getState().addBlock('Block 1');
    const { blocks: initialBlocks } = useBlockchainStore.getState();
    const originalHash = initialBlocks[1].hash;

    useBlockchainStore.getState().editBlock(1, 'Tampered Data');
    const { blocks: tamperedBlocks } = useBlockchainStore.getState();

    expect(tamperedBlocks[1].data).toBe('Tampered Data');
    expect(tamperedBlocks[1].hash).not.toBe(originalHash);
    // Hash should be recalculated but invalid (likely)
  });

  it('should mine a block', () => {
    useBlockchainStore.getState().addBlock('Block 1');
    useBlockchainStore.getState().editBlock(1, 'Tampered Data');

    // Mining should find a valid nonce
    useBlockchainStore.getState().mineBlock(1);
    const { blocks } = useBlockchainStore.getState();
    const minedBlock = blocks[1];

    expect(minedBlock.hash.startsWith('00')).toBe(true); // Assuming difficulty 2
  });

  it('should cascade invalidation', () => {
     useBlockchainStore.getState().addBlock('Block 1');
     useBlockchainStore.getState().addBlock('Block 2');

     // Edit Block 1
     useBlockchainStore.getState().editBlock(1, 'Tampered');

     const { blocks } = useBlockchainStore.getState();
     // Block 2 previous hash should still point to old hash of Block 1?
     // Actually, Block 2 previousHash is stored in Block 2.
     // Block 1 hash changed. So Block 2 previousHash != Block 1 hash.
     expect(blocks[2].previousHash).not.toBe(blocks[1].hash);
  });
});
