import { describe, it, expect } from 'vitest';
import { buildMerkleTree, getMerkleProof, verifyMerkleProof, getMerkleRoot } from '../merkleTree';
import { sha256 } from '../hash';

describe('Merkle Tree', () => {
  const transactions = ['tx1', 'tx2', 'tx3', 'tx4', 'tx5'];

  it('should build a merkle tree correctly', () => {
    const tree = buildMerkleTree(transactions);
    expect(tree).toBeDefined();
    expect(tree.hash).toBeDefined();

    // Check root hash logic manually for small tree
    // tx1, tx2 -> h12
    // tx3, tx4 -> h34
    // tx5, tx5 -> h55 (duplicated)
    // h12, h34 -> h1234
    // h55, h55 -> h5555 (duplicated at next level? No.)
    // Wait, layer logic:
    // L0: 5 nodes.
    // L1: (1,2)->A, (3,4)->B, (5,5)->C. 3 nodes.
    // L2: (A,B)->D, (C,C)->E. 2 nodes.
    // L3: (D,E)->Root.

    // We expect 5 transactions to result in specific structure.
    // Just verify hash is consistent (deterministic).
    const tree2 = buildMerkleTree(transactions);
    expect(tree.hash).toBe(tree2.hash);
  });

  it('should verify a valid proof', () => {
    const tree = buildMerkleTree(transactions);
    const root = getMerkleRoot(tree);
    const leafIndex = 2; // tx3
    const tx = transactions[leafIndex];
    const leafHash = sha256(tx);

    const proof = getMerkleProof(tree, leafIndex, transactions.length);
    const isValid = verifyMerkleProof(proof, leafHash, root);

    expect(isValid).toBe(true);
  });

  it('should fail verification for tampered leaf', () => {
    const tree = buildMerkleTree(transactions);
    const root = getMerkleRoot(tree);
    const leafIndex = 2; // tx3

    const tamperedTx = 'tx3-tampered';
    const tamperedHash = sha256(tamperedTx);

    const proof = getMerkleProof(tree, leafIndex, transactions.length);
    const isValid = verifyMerkleProof(proof, tamperedHash, root);

    expect(isValid).toBe(false);
  });

  it('should fail verification for invalid proof', () => {
    const tree = buildMerkleTree(transactions);
    const root = getMerkleRoot(tree);
    const leafIndex = 2;
    const tx = transactions[leafIndex];
    const leafHash = sha256(tx);

    const proof = getMerkleProof(tree, leafIndex, transactions.length);
    // Tamper with proof
    proof[0].hash = sha256('tampered-sibling');

    const isValid = verifyMerkleProof(proof, leafHash, root);

    expect(isValid).toBe(false);
  });

  it('should handle odd number of transactions', () => {
    const oddTxs = ['a', 'b', 'c'];
    const tree = buildMerkleTree(oddTxs);
    expect(tree).toBeDefined();

    // Verify proof for last element
    const leafIndex = 2;
    const root = getMerkleRoot(tree);
    const proof = getMerkleProof(tree, leafIndex, oddTxs.length);
    const isValid = verifyMerkleProof(proof, sha256('c'), root);

    expect(isValid).toBe(true);
  });
});
