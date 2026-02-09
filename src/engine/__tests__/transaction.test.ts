import { describe, it, expect } from 'vitest';
import { createTransaction, verifyTransaction } from '../transaction';
import { generateKeyPair } from '../wallet';

describe('Transaction', () => {
  it('should create and verify a valid transaction', () => {
    const { publicKey: senderPub, privateKey: senderPriv } = generateKeyPair();
    const { publicKey: receiverPub } = generateKeyPair();

    const tx = createTransaction(senderPub, receiverPub, 10, senderPriv);

    expect(tx.from).toBe(senderPub);
    expect(tx.amount).toBe(10);
    expect(tx.signature).toBeDefined();

    const isValid = verifyTransaction(tx, senderPub);
    expect(isValid).toBe(true);
  });

  it('should fail verification if tampered', () => {
    const { publicKey: senderPub, privateKey: senderPriv } = generateKeyPair();
    const { publicKey: receiverPub } = generateKeyPair();

    const tx = createTransaction(senderPub, receiverPub, 10, senderPriv);

    // Tamper amount
    tx.amount = 100;

    const isValid = verifyTransaction(tx, senderPub);
    expect(isValid).toBe(false);
  });

  it('should fail verification if signature is invalid', () => {
    const { publicKey: senderPub, privateKey: senderPriv } = generateKeyPair();
    const { publicKey: receiverPub } = generateKeyPair();

    const tx = createTransaction(senderPub, receiverPub, 10, senderPriv);

    tx.signature = 'deadbeef'; // Invalid signature

    let isValid = false;
    try {
        isValid = verifyTransaction(tx, senderPub);
    } catch (e) {
        isValid = false;
    }
    expect(isValid).toBe(false);
  });
});
