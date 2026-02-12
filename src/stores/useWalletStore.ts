import { create } from 'zustand';
import { Wallet, Transaction } from '../engine/types';
import { WalletManager } from '../engine/wallet';
import { createTransaction } from '../engine/transaction';

interface WalletState {
  wallets: Wallet[];
  mempool: Transaction[];
  minedTransactions: Transaction[];

  initializeWallets: () => void;
  createWallet: (name: string, balance: number) => void;
  sendTransaction: (fromName: string, toName: string, amount: number) => void;
  mineMempool: () => void;
  getWalletByName: (name: string) => Wallet | undefined;
}

// Internal singleton instance
let walletManager = new WalletManager();

export const useWalletStore = create<WalletState>((set, get) => ({
  wallets: [],
  mempool: [],
  minedTransactions: [],

  initializeWallets: () => {
    walletManager = new WalletManager();
    // Create initial wallets
    walletManager.createWallet('Alice', 100);
    walletManager.createWallet('Bob', 50);
    set({
      wallets: walletManager.getAllWallets(),
      mempool: [],
      minedTransactions: []
    });
  },

  createWallet: (name: string, balance: number) => {
    walletManager.createWallet(name, balance);
    set({ wallets: walletManager.getAllWallets() });
  },

  sendTransaction: (fromName: string, toName: string, amount: number) => {
    const wallets = walletManager.getAllWallets();
    const fromWallet = wallets.find(w => w.name === fromName);
    const toWallet = wallets.find(w => w.name === toName);

    if (!fromWallet || !toWallet) {
      console.error('Wallet not found');
      return;
    }

    if (fromWallet.balance < amount) {
      console.error('Insufficient funds');
      return;
    }

    // Create transaction (signs it)
    const tx = createTransaction(fromWallet.publicKey, toWallet.publicKey, amount, fromWallet.privateKey);

    // We add to mempool, but we don't update balance yet.
    // Balance updates on mining.
    set((state) => ({ mempool: [...state.mempool, tx] }));
  },

  mineMempool: () => {
    const { mempool } = get();
    if (mempool.length === 0) return;

    // Process transactions
    mempool.forEach(tx => {
      // Deduct from sender
      walletManager.updateBalance(tx.from, -tx.amount);
      // Deduct fee from sender if present
      if (tx.fee) {
        walletManager.updateBalance(tx.from, -tx.fee);
      }
      // Add to receiver
      walletManager.updateBalance(tx.to, tx.amount);
    });

    set((state) => ({
      wallets: walletManager.getAllWallets(),
      minedTransactions: [...state.minedTransactions, ...mempool],
      mempool: []
    }));
  },

  getWalletByName: (name: string) => {
    return walletManager.getWalletByName(name);
  }
}));
