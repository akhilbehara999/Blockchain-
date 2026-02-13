import { Transaction } from './types';
import { FEE_LEVELS } from './transaction';

export class Mempool {
  private transactions: Transaction[] = [];
  private readonly MAX_BLOCK_SIZE = 10;
  // If mempool has >30 transactions, low-fee ones wait longer (effectively deprioritized by sort)
  // private readonly MEMPOOL_LIMIT = 30;

  setTransactions(txs: Transaction[]): void {
    this.transactions = [...txs];
    this.sort();
  }

  addTransaction(tx: Transaction): void {
    // Check if transaction already exists (by signature)
    const existingIndex = this.transactions.findIndex(t => t.signature === tx.signature);
    if (existingIndex !== -1) {
      // If new fee is higher, update
      if ((tx.fee || 0) > (this.transactions[existingIndex].fee || 0)) {
        this.transactions[existingIndex] = tx;
        this.sort();
      }
      return;
    }

    tx.status = 'pending';
    this.transactions.push(tx);
    this.sort();
  }

  cancelTransaction(signature: string, newFee: number): boolean {
    const index = this.transactions.findIndex(t => t.signature === signature);
    if (index !== -1) {
      const tx = this.transactions[index];
      // Must have higher fee
      if (newFee > (tx.fee || 0)) {
        // Replace with 0-value self-transfer (RBF cancel)
        this.transactions[index] = {
          ...tx,
          to: tx.from, // Send to self
          amount: 0,   // 0 value
          fee: newFee,
          status: 'pending' // Ensure it's pending
        };
        this.sort();
        return true;
      }
    }
    return false;
  }

  // Sort by fee (desc), then by timestamp (asc)
  private sort(): void {
    this.transactions.sort((a, b) => {
      const feeA = a.fee || 0;
      const feeB = b.fee || 0;
      if (feeB !== feeA) return feeB - feeA;
      return a.timestamp - b.timestamp;
    });
  }

  getTransactionsForBlock(): Transaction[] {
    this.prune();
    this.sort();
    // Greedy selection: take top N
    return this.transactions.slice(0, this.MAX_BLOCK_SIZE);
  }

  prune(): void {
    const now = Date.now();
    const thirtyMinutes = 30 * 60 * 1000;

    // Filter out transactions older than 30 mins with low fees
    this.transactions = this.transactions.filter(tx => {
      const age = now - tx.timestamp;
      const fee = tx.fee || 0;
      // "Low fees" defined as strictly less than Standard
      if (age > thirtyMinutes && fee < FEE_LEVELS.STANDARD) {
        return false;
      }
      return true;
    });
  }

  replaceFee(signature: string, newFee: number): void {
    const index = this.transactions.findIndex(t => t.signature === signature);
    if (index !== -1) {
      const tx = this.transactions[index];
      // Only update if new fee is higher
      if (newFee > (tx.fee || 0)) {
        // Note: In a real blockchain, updating fee would invalidate signature.
        // We update it here for simulation purposes as requested.
        this.transactions[index] = { ...tx, fee: newFee };
        this.sort();
      }
    }
  }

  getPosition(signature: string): number {
    this.sort(); // Ensure sorted state
    const index = this.transactions.findIndex(t => t.signature === signature);
    return index === -1 ? -1 : index + 1;
  }

  estimateConfirmationTime(fee: number): number {
    if (fee >= FEE_LEVELS.HIGH) return 1;
    if (fee >= FEE_LEVELS.STANDARD) return 3;
    if (fee >= FEE_LEVELS.ECONOMY) return 10;
    return 20; // Custom low fee
  }

  getAllPending(): Transaction[] {
    this.sort();
    return [...this.transactions];
  }

  // Helper to remove mined transactions
  removeTransactions(txs: Transaction[]): void {
    const signaturesToRemove = new Set(txs.map(t => t.signature));
    this.transactions = this.transactions.filter(t => !signaturesToRemove.has(t.signature));
  }

  clear(): void {
    this.transactions = [];
  }
}
