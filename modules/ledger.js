import { AppState } from '../js/appState.js';
import { saveState } from '../js/storage.js';

/**
 * Adds a transaction to the ledger (pendingTransactions).
 * @param {string} sender
 * @param {string} receiver
 * @param {number} amount
 * @returns {boolean} True if successful, false otherwise.
 */
export function addTransaction(sender, receiver, amount) {
    if (!sender || !receiver || amount <= 0) {
        console.error("Invalid transaction data");
        return false;
    }

    const transaction = {
        id: Date.now().toString(36) + Math.random().toString(36).substr(2),
        sender: sender,
        receiver: receiver,
        amount: parseFloat(amount),
        timestamp: Date.now()
    };

    AppState.pendingTransactions.push(transaction);
    saveState();
    return true;
}

/**
 * Returns the current list of transactions.
 */
export function getTransactions() {
    return AppState.pendingTransactions;
}

/**
 * Checks if the unlock condition for Module 1 is met.
 * Condition: At least 2 transactions added.
 */
export function isModule1Complete() {
    return AppState.pendingTransactions.length >= 2;
}
