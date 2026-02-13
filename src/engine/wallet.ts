import { ec as EC } from 'elliptic';
import { sha256 } from './hash';
import { Wallet } from './types';

const ec = new EC('secp256k1');

export function generateKeyPair(): { publicKey: string, privateKey: string } {
  const key = ec.genKeyPair();
  return {
    publicKey: key.getPublic('hex'),
    privateKey: key.getPrivate('hex'),
  };
}

export function getAddress(publicKey: string): string {
  return sha256(publicKey).substring(0, 8);
}

export class WalletManager {
  private wallets: Map<string, Wallet>;

  constructor() {
    this.wallets = new Map();
  }

  public createWallet(name: string, initialBalance: number): Wallet {
    const { publicKey, privateKey } = generateKeyPair();
    const wallet: Wallet = {
      name,
      publicKey,
      privateKey,
      balance: initialBalance,
    };
    this.wallets.set(publicKey, wallet);
    return wallet;
  }

  public getWallet(publicKey: string): Wallet | undefined {
    return this.wallets.get(publicKey);
  }

  public getWalletByName(name: string): Wallet | undefined {
    for (const wallet of this.wallets.values()) {
      if (wallet.name === name) {
        return wallet;
      }
    }
    return undefined;
  }

  public getAllWallets(): Wallet[] {
    return Array.from(this.wallets.values());
  }

  public setWallets(wallets: Wallet[]): void {
    this.wallets.clear();
    wallets.forEach(w => this.wallets.set(w.publicKey, w));
  }

  public updateBalance(publicKey: string, amount: number): void {
    const wallet = this.wallets.get(publicKey);
    if (wallet) {
      wallet.balance += amount;
    }
  }

  public canSpend(publicKey: string, amount: number): boolean {
    const wallet = this.wallets.get(publicKey);
    if (!wallet) return false;
    return wallet.balance >= amount;
  }
}
