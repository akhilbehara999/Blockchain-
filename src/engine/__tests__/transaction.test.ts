import { describe, it, expect } from 'vitest';
import { createTransaction, verifyTransaction } from '../transaction';
import { generateKeyPair } from '../wallet';

describe('Transaction', () => {
  // Helper to make a valid-looking address from a public key (which already starts with 0x now)
  const toAddress = (key: string) => {
      // Key starts with 0x. We want an address which is 0x + 40 hex chars.
      // We can just take the first 42 chars of the key as a dummy address for testing,
      // provided it passes regex validation (which it should as it is hex).
      // Or cleaner: use a fixed valid address string to avoid confusion, but we need consistency for verification?
      // No, `createTransaction` signs `from` string. `verifyTransaction` verifies signature against `from` string.
      // It doesn't matter if `from` is derived from key or not, as long as it is the string that was signed.
      // So we just need a valid address format string.
      return key.substring(0, 42);
  };

  it('should create and verify a valid transaction', () => {
    const { publicKey: senderPub, privateKey: senderPriv } = generateKeyPair();
    const { publicKey: receiverPub } = generateKeyPair();

    const senderAddr = toAddress(senderPub);
    const receiverAddr = toAddress(receiverPub);

    const tx = createTransaction(senderAddr, receiverAddr, 10, senderPriv);

    expect(tx.from).toBe(senderAddr);
    expect(tx.amount).toBe(10);
    expect(tx.signature).toBeDefined();

    const isValid = verifyTransaction(tx, senderPub);
    expect(isValid).toBe(true);
  });

  it('should fail verification if tampered', () => {
    const { publicKey: senderPub, privateKey: senderPriv } = generateKeyPair();
    const { publicKey: receiverPub } = generateKeyPair();

    const senderAddr = toAddress(senderPub);
    const receiverAddr = toAddress(receiverPub);

    const tx = createTransaction(senderAddr, receiverAddr, 10, senderPriv);

    // Tamper amount
    tx.amount = 100;

    const isValid = verifyTransaction(tx, senderPub);
    expect(isValid).toBe(false);
  });

  it('should fail verification if signature is invalid', () => {
    const { publicKey: senderPub, privateKey: senderPriv } = generateKeyPair();
    const { publicKey: receiverPub } = generateKeyPair();

    const senderAddr = toAddress(senderPub);
    const receiverAddr = toAddress(receiverPub);

    const tx = createTransaction(senderAddr, receiverAddr, 10, senderPriv);

    tx.signature = 'deadbeef'; // Invalid signature

    let isValid = false;
    try {
        isValid = verifyTransaction(tx, senderPub);
    } catch (e) {
        isValid = false;
    }
    expect(isValid).toBe(false);
  });

  it('should respect the skipRateLimit flag', () => {
    const { publicKey: senderPub, privateKey: senderPriv } = generateKeyPair();
    const { publicKey: receiverPub } = generateKeyPair();

    const senderAddr = toAddress(senderPub);
    const receiverAddr = toAddress(receiverPub);

    // Default rate limit is 10 tx per minute.
    // Let's create 11 transactions with skipRateLimit = true
    for (let i = 0; i < 11; i++) {
      expect(() => {
        createTransaction(senderAddr, receiverAddr, 1, senderPriv, 0, true);
      }).not.toThrow();
    }
  });
});
