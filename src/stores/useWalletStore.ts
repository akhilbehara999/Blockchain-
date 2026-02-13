import { create } from 'zustand';
import { Wallet, Transaction } from '../engine/types';
import { WalletManager } from '../engine/wallet';
import { createTransaction } from '../engine/transaction';
import { Mempool } from '../engine/Mempool';

interface WalletState {
  wallets: Wallet[];
  mempool: Transaction[];
  minedTransactions: Transaction[];

  initializeWallets: () => void;
  createWallet: (name: string, balance: number) => void;
  sendTransaction: (fromName: string, toName: string, amount: number, fee?: number) => void;
  speedUpTransaction: (signature: string, newFee: number) => void;
  mineMempool: () => Transaction[];
  getWalletByName: (name: string) => Wallet | undefined;
  getMempoolPosition: (signature: string) => number;
  getEstimatedConfirmationTime: (fee: number) => number;
}

// Internal singleton instances
let walletManager = new WalletManager();
let mempoolInstance = new Mempool();

export const useWalletStore = create<WalletState>((set) => ({
  wallets: [],
  mempool: [],
  minedTransactions: [],

  initializeWallets: () => {
    walletManager = new WalletManager();
    mempoolInstance = new Mempool();
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

  sendTransaction: (fromName: string, toName: string, amount: number, fee: number = 0) => {
    const wallets = walletManager.getAllWallets();
    const fromWallet = wallets.find(w => w.name === fromName);
    const toWallet = wallets.find(w => w.name === toName);

    if (!fromWallet || !toWallet) {
      console.error('Wallet not found');
      return;
    }

    if (fromWallet.balance < (amount + fee)) {
      console.error('Insufficient funds');
      return;
    }

    // Create transaction (signs it)
    const tx = createTransaction(fromWallet.publicKey, toWallet.publicKey, amount, fromWallet.privateKey, fee);

    // Add to mempool logic
    mempoolInstance.addTransaction(tx);

    // Update store state
    set({ mempool: mempoolInstance.getAllPending() });
  },

  speedUpTransaction: (signature: string, newFee: number) => {
    mempoolInstance.replaceFee(signature, newFee);
    set({ mempool: mempoolInstance.getAllPending() });
  },

  mineMempool: () => {
    // Get top transactions for the block
    const txsToMine = mempoolInstance.getTransactionsForBlock();

    if (txsToMine.length === 0) return [];

    // Process transactions
    txsToMine.forEach(tx => {
      // Deduct from sender
      walletManager.updateBalance(tx.from, -tx.amount);
      // Deduct fee from sender if present
      if (tx.fee) {
        walletManager.updateBalance(tx.from, -tx.fee);
      }
      // Add to receiver
      walletManager.updateBalance(tx.to, tx.amount);
    });

    // Remove mined transactions from mempool
    mempoolInstance.removeTransactions(txsToMine);

    set((state) => ({
      wallets: walletManager.getAllWallets(),
      minedTransactions: [...state.minedTransactions, ...txsToMine],
      mempool: mempoolInstance.getAllPending()
    }));

    return txsToMine;
  },

  getWalletByName: (name: string) => {
    return walletManager.getWalletByName(name);
  },

  getMempoolPosition: (signature: string) => mempoolInstance.getPosition(signature),
  getEstimatedConfirmationTime: (fee: number) => mempoolInstance.estimateConfirmationTime(fee),
}));
