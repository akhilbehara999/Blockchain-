import { AppState } from '../js/appState.js';
import { saveState } from '../js/storage.js';

/**
 * Adds a transaction to the ledger.
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

    AppState.ledger.push(transaction);
    saveState();
    return true;
}

/**
 * Updates an existing transaction in the ledger.
 * @param {string} id
 * @param {string} sender
 * @param {string} receiver
 * @param {number} amount
 * @returns {boolean} True if successful, false otherwise.
 */
export function updateTransaction(id, sender, receiver, amount) {
    const index = AppState.ledger.findIndex(tx => tx.id === id);
    if (index === -1) return false;

    AppState.ledger[index] = {
        ...AppState.ledger[index],
        sender,
        receiver,
        amount: parseFloat(amount),
        timestamp: Date.now() // Update timestamp on edit? Maybe.
    };
    saveState();
    return true;
}

/**
 * Deletes a transaction from the ledger.
 * @param {string} id
 * @returns {boolean} True if successful, false otherwise.
 */
export function deleteTransaction(id) {
    const initialLength = AppState.ledger.length;
    AppState.ledger = AppState.ledger.filter(tx => tx.id !== id);

    if (AppState.ledger.length !== initialLength) {
        saveState();
        return true;
    }
    return false;
}

/**
 * Returns the current list of ledger transactions.
 */
export function getTransactions() {
    return AppState.ledger || [];
}

/**
 * Checks if the unlock condition for Module 1 is met.
 * Condition: At least 2 transactions added.
 */
export function isModule1Complete() {
    return (AppState.ledger && AppState.ledger.length >= 2);
}
