import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NodeIdentity } from '../NodeIdentity';
import { ec as EC } from 'elliptic';

const ec = new EC('secp256k1');

describe('NodeIdentity', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
  });

  it('should generate a new identity with mathematically linked keys', () => {
    NodeIdentity.getOrCreate();

    // Retrieve the data directly from localStorage to verify private/public key relationship
    // because NodeIdentity doesn't expose the private key publicly.
    const stored = localStorage.getItem('yupp_node_identity');
    expect(stored).not.toBeNull();

    if (stored) {
      const data = JSON.parse(stored);
      const { privateKey, publicKey } = data.keyPair;

      expect(privateKey).toBeDefined();
      expect(publicKey).toBeDefined();

      // Verify key relationship
      const keyFromPrivate = ec.keyFromPrivate(privateKey);
      const derivedPublic = keyFromPrivate.getPublic('hex');

      expect(derivedPublic).toBe(publicKey);
    }
  });

  it('should derive wallet address from public key correctly', () => {
    const identity = NodeIdentity.getOrCreate();
    const stored = localStorage.getItem('yupp_node_identity');

    if (stored) {
        const data = JSON.parse(stored);
        const { publicKey } = data.keyPair;
        const address = identity.getWalletAddress();

        expect(address).toBe(`0x${publicKey.substring(0, 40)}`);
    }
  });

  it('should return existing identity if present', () => {
    const id1 = NodeIdentity.getOrCreate();
    const id2 = NodeIdentity.getOrCreate();

    expect(id1.getId()).toBe(id2.getId());
    expect(id1.getWalletAddress()).toBe(id2.getWalletAddress());
  });
});
