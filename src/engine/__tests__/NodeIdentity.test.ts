import { describe, it, expect } from 'vitest';
import { NodeIdentity } from '../NodeIdentity';
import { generateKeyPair } from '../wallet';
import { ec as EC } from 'elliptic';

const ec = new EC('secp256k1');

describe('NodeIdentity', () => {
  it('should generate a new identity with mathematically linked keys', () => {
    // Clear storage
    localStorage.clear();

    const identity = NodeIdentity.getOrCreate();

    expect(identity).toBeDefined();
    expect(identity.isNew).toBe(true);

    const publicKey = identity.getPublicKey();
    // Retrieve private key from storage to verify relationship
    const stored = localStorage.getItem('yupp_node_identity');
    if (stored) {
      const data = JSON.parse(stored);
      const privateKey = data.keyPair.privateKey;

      const keyFromPrivate = ec.keyFromPrivate(privateKey);
      // getPublic('hex') returns raw hex. Our generated public key has '0x'.
      const derivedPublic = '0x' + keyFromPrivate.getPublic('hex');

      expect(derivedPublic).toBe(publicKey);
    }
  });

  it('should restore existing identity', () => {
    // Setup
    const { publicKey, privateKey } = generateKeyPair();
    const data = {
        id: 'Node #TEST',
        walletAddress: '0x123',
        keyPair: { publicKey, privateKey },
        firstSeen: new Date().toISOString()
    };
    localStorage.setItem('yupp_node_identity', JSON.stringify(data));

    const identity = NodeIdentity.getOrCreate();
    expect(identity.isNew).toBe(false);
    expect(identity.getId()).toBe('Node #TEST');
    expect(identity.getPublicKey()).toBe(publicKey);
  });
});
