import { describe, it, expect } from 'vitest';
import { WalletManager, generateKeyPair, getAddress } from '../wallet';

describe('Wallet', () => {
  it('should generate valid keys and address', () => {
    const { publicKey, privateKey } = generateKeyPair();
    expect(publicKey).toBeDefined();
    expect(privateKey).toBeDefined();
    const address = getAddress(publicKey);
    expect(address.length).toBe(8);
  });

  it('should manage wallets', () => {
    const manager = new WalletManager();
    const wallet = manager.createWallet('Alice', 100);

    expect(wallet.name).toBe('Alice');
    expect(wallet.balance).toBe(100);

    const retrieved = manager.getWallet(wallet.publicKey);
    expect(retrieved).toEqual(wallet);

    const retrievedByName = manager.getWalletByName('Alice');
    expect(retrievedByName).toEqual(wallet);
  });

  it('should update balance and check spending', () => {
    const manager = new WalletManager();
    const wallet = manager.createWallet('Bob', 50);

    expect(manager.canSpend(wallet.publicKey, 60)).toBe(false);
    expect(manager.canSpend(wallet.publicKey, 50)).toBe(true);

    manager.updateBalance(wallet.publicKey, -20);
    expect(wallet.balance).toBe(30);
    expect(manager.canSpend(wallet.publicKey, 40)).toBe(false);
  });
});
