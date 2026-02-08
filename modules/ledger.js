import { AppState } from '../js/appState.js';
import { saveState } from '../js/storage.js';
import { navigateTo, completeModule } from '../js/router.js';
import { escapeHtml } from '../js/blockUtils.js';

let editingTransactionId = null;

// --- Ledger Logic ---

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
        sender: sender.trim(),
        receiver: receiver.trim(),
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
        sender: sender.trim(),
        receiver: receiver.trim(),
        amount: parseFloat(amount),
        timestamp: Date.now()
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

/**
 * Formats a transaction object into a human-readable string.
 * @param {object} tx - The transaction object.
 * @returns {string} Formatted string.
 */
export function formatTx(tx) {
    return `${tx.sender} → ${tx.receiver} : ${tx.amount} coins`;
}


// --- Rendering ---

/**
 * Renders Module 1: Ledger.
 */
export function renderModule1() {
    const mainContent = document.getElementById('main-content');
    if (!mainContent) return;

    mainContent.innerHTML = '';

    const container = document.createElement('div');
    container.className = 'module-container';

    // 1. Header
    const header = `
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem;">
            <h2>Module 1: The Ledger 📒</h2>
            <span class="status ${AppState.progress[1] ? 'success' : 'active'}" style="font-size: 0.8rem;">
                ${AppState.progress[1] ? 'Completed' : 'In Progress'}
            </span>
        </div>
    `;

    // 2. Explanation
    const explanation = `
        <div class="mb-4">
            <p>A <strong>ledger</strong> is a list of transactions. It tracks who sent money to whom.</p>
            <div class="card" style="background: rgba(239, 68, 68, 0.1); border: 1px solid var(--error-color);">
                <h4 style="color: var(--error-color); margin-bottom: 0.5rem;">The Problem 🚨</h4>
                <p style="margin-bottom: 0; font-size: 0.9rem;">
                    Centralized ledgers (like a bank's database) are risky because <strong>anyone with access can change the history</strong>.
                </p>
            </div>
            <p style="font-size: 0.9rem; color: #aaa;">👇 Try adding and editing transactions below to see how easy it is to change history.</p>
        </div>
    `;

    // 3. Form (Input)
    const transactions = getTransactions();
    const isEditing = editingTransactionId !== null;
    const editingTx = isEditing ? transactions.find(t => t.id === editingTransactionId) : null;

    // Safety check: if editing ID exists but tx doesn't (deleted), clear edit mode
    if (isEditing && !editingTx) {
        editingTransactionId = null;
        renderModule1();
        return;
    }

    const form = `
        <div class="card">
            <h3>${isEditing ? 'Edit Transaction' : 'Add Transaction'}</h3>
            <div style="display: grid; gap: 0.75rem;">
                <input type="text" id="tx-sender" placeholder="Sender (e.g. Alice)" value="${editingTx ? escapeHtml(editingTx.sender) : ''}" />
                <input type="text" id="tx-receiver" placeholder="Receiver (e.g. Bob)" value="${editingTx ? escapeHtml(editingTx.receiver) : ''}" />
                <input type="number" id="tx-amount" placeholder="Amount" min="1" value="${editingTx ? editingTx.amount : ''}" />
            </div>
            <div style="display: flex; gap: 1rem; margin-top: 1rem;">
                <button id="add-tx-btn" style="flex: 1;">${isEditing ? 'Update' : 'Add to Ledger'}</button>
                ${isEditing ? '<button id="cancel-edit-btn" class="secondary" style="flex: 1;">Cancel</button>' : ''}
            </div>
        </div>
    `;

    // 4. Ledger List (Output)
    let ledgerList = '<div class="card"><h3>Public Ledger</h3>';
    if (transactions.length === 0) {
        ledgerList += '<p style="text-align: center; color: #666; padding: 1rem;">Ledger is empty. Add a transaction above.</p>';
    } else {
        ledgerList += '<ul style="list-style: none; padding: 0;">';
        transactions.forEach((tx) => {
            const isBeingEdited = tx.id === editingTransactionId;
            // Use formatTx for the display string (and escape it just in case, though formatTx is usually clean)
            const formattedString = escapeHtml(formatTx(tx));

            ledgerList += `
                <li style="
                    background: ${isBeingEdited ? 'rgba(59, 130, 246, 0.1)' : 'rgba(255,255,255,0.05)'};
                    border: ${isBeingEdited ? '1px solid var(--accent-color)' : '1px solid transparent'};
                    padding: 1rem;
                    margin-bottom: 0.5rem;
                    border-radius: 8px;
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    transition: all 0.2s;
                ">
                    <div style="overflow: hidden; text-overflow: ellipsis;">
                        <span style="font-size: 1rem; font-weight: 500;">${formattedString}</span>
                        <div style="font-size: 0.75rem; color: #666; margin-top: 0.25rem;">${new Date(tx.timestamp).toLocaleTimeString()}</div>
                    </div>
                    <div style="display: flex; gap: 0.5rem; flex-shrink: 0;">
                        <button class="secondary edit-btn" data-id="${tx.id}" style="padding: 0.4rem 0.6rem; font-size: 1rem;">✏️</button>
                        <button class="secondary delete-btn" data-id="${tx.id}" style="padding: 0.4rem 0.6rem; font-size: 1rem; color: var(--error-color); border-color: rgba(239,68,68,0.5);">🗑️</button>
                    </div>
                </li>
            `;
        });
        ledgerList += '</ul>';
    }
    ledgerList += '</div>';

    // 5. Next Button
    const canProceed = transactions.length >= 2;
    const nextBtn = `
        <div class="text-center mt-4" style="margin-bottom: 2rem;">
            <button id="next-mod-btn" ${canProceed ? '' : 'disabled'} style="width: 100%;">
                Next: Blocks 🧱
            </button>
            ${!canProceed ? '<p style="font-size: 0.8rem; margin-top: 0.5rem; color: #888;">Add at least 2 transactions to continue.</p>' : ''}
        </div>
    `;

    container.innerHTML = header + explanation + form + ledgerList + nextBtn;
    mainContent.appendChild(container);

    // --- Event Listeners ---

    // Add / Update
    const addBtn = document.getElementById('add-tx-btn');
    if (addBtn) {
        addBtn.addEventListener('click', () => {
            const sender = document.getElementById('tx-sender').value;
            const receiver = document.getElementById('tx-receiver').value;
            const amount = document.getElementById('tx-amount').value;

            if (sender && receiver && amount) {
                if (editingTransactionId) {
                    updateTransaction(editingTransactionId, sender, receiver, amount);
                    editingTransactionId = null;
                } else {
                    addTransaction(sender, receiver, amount);
                }
                renderModule1();
            } else {
                alert("Please fill in all fields.");
            }
        });
    }

    // Cancel Edit
    const cancelBtn = document.getElementById('cancel-edit-btn');
    if (cancelBtn) {
        cancelBtn.addEventListener('click', () => {
            editingTransactionId = null;
            renderModule1();
        });
    }

    // Edit Buttons
    container.querySelectorAll('.edit-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            editingTransactionId = e.target.closest('button').getAttribute('data-id');
            renderModule1();
            // Focus on sender input
            setTimeout(() => {
                const input = document.getElementById('tx-sender');
                if (input) input.focus();
            }, 50);
        });
    });

    // Delete Buttons
    container.querySelectorAll('.delete-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const id = e.target.closest('button').getAttribute('data-id');
            if (confirm("Delete this transaction?")) {
                deleteTransaction(id);
                // If we deleted the item being edited, cancel edit mode
                if (editingTransactionId === id) {
                    editingTransactionId = null;
                }
                renderModule1();
            }
        });
    });

    // Next Button
    const nextBtnEl = document.getElementById('next-mod-btn');
    if (nextBtnEl) {
        nextBtnEl.addEventListener('click', () => {
            if (canProceed) {
                completeModule(1);
                navigateTo(2);
            }
        });
    }
}
