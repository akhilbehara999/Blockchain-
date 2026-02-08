import { AppState } from './appState.js';
import { navigateTo, isModuleLocked, completeModule } from './router.js';
import { addTransaction, getTransactions, isModule1Complete, updateTransaction, deleteTransaction } from '../modules/ledger.js';
import { getBlockchain, isChainEmpty } from './blockchain.js';

// DOM Elements
const sidebar = document.getElementById('sidebar');
const moduleNav = document.getElementById('module-nav');
const mobileNav = document.getElementById('mobile-nav');
const mainContent = document.getElementById('main-content');
const blockchainPanel = document.getElementById('blockchain-panel');

// UI State
let editingTransactionId = null;

// Module Definitions (Metadata)
const MODULES = [
    { id: 0, title: "Introduction", icon: "👋", shortTitle: "Intro" },
    { id: 1, title: "Ledger", icon: "📒", shortTitle: "Ledger" },
    { id: 2, title: "Blocks", icon: "🧱", shortTitle: "Blocks" } // Placeholder
];

/**
 * Main render function.
 * Updates the entire UI based on the current AppState.
 */
export function renderUI() {
    renderSidebar();
    renderMobileNav();
    renderMainContent();
    renderBlockchainPanel();
}

/**
 * Renders the sidebar navigation (Desktop).
 */
function renderSidebar() {
    if (!moduleNav) return;
    moduleNav.innerHTML = '';

    MODULES.forEach(mod => {
        const isLocked = isModuleLocked(mod.id);
        const isActive = AppState.currentModule === mod.id;

        const btn = document.createElement('button');
        btn.className = `nav-item ${isActive ? 'active' : ''} ${isLocked ? 'locked' : ''}`;

        let label = `${mod.icon} ${mod.title}`;
        if (isLocked) {
            label = `🔒 ${mod.title}`;
        }

        btn.textContent = label;

        btn.onclick = () => {
            if (!isLocked && !isActive) {
                navigateTo(mod.id);
            }
        };

        moduleNav.appendChild(btn);
    });
}

/**
 * Renders the bottom navigation (Mobile).
 */
function renderMobileNav() {
    if (!mobileNav) return;
    mobileNav.innerHTML = '';

    MODULES.forEach(mod => {
        const isLocked = isModuleLocked(mod.id);
        const isActive = AppState.currentModule === mod.id;

        const btn = document.createElement('button');
        btn.className = `mobile-nav-item ${isActive ? 'active' : ''} ${isLocked ? 'locked' : ''}`;

        const icon = isLocked ? '🔒' : mod.icon;

        btn.innerHTML = `
            <span class="mobile-nav-icon">${icon}</span>
            <span>${mod.shortTitle || mod.title}</span>
        `;

        btn.onclick = () => {
            if (!isLocked && !isActive) {
                navigateTo(mod.id);
            }
        };

        mobileNav.appendChild(btn);
    });
}

/**
 * Renders the main content area based on the current module.
 */
function renderMainContent() {
    mainContent.innerHTML = '';

    switch (AppState.currentModule) {
        case 0:
            renderModule0();
            break;
        case 1:
            renderModule1();
            break;
        case 2:
            renderModule2Placeholder();
            break;
        default:
            mainContent.innerHTML = '<h2>Module Not Found</h2>';
    }
}

/**
 * Renders Module 0: Introduction.
 */
function renderModule0() {
    const container = document.createElement('div');
    container.className = 'module-container text-center';

    // 1. Hero Section
    const hero = `
        <div class="mb-4">
            <h1>Learn Blockchain by Doing</h1>
            <p style="font-size: 1.25rem; color: #a0a0a0; max-width: 600px; margin: 0 auto;">
                An interactive simulator to understand how blockchain works without writing code.
            </p>
            <div style="font-size: 4rem; margin: 2rem 0;">🔗</div>
        </div>
    `;

    // 2. What You'll Learn (Cards)
    const cardsData = [
        { icon: '📒', title: 'Ledger', desc: 'How transactions are recorded' },
        { icon: '🧱', title: 'Blocks', desc: 'Grouping transactions together' },
        { icon: '⛓️', title: 'Blockchain', desc: 'Linking blocks securely' },
        { icon: '⛏️', title: 'Mining', desc: 'Securing the network' },
        { icon: '🌐', title: 'Network', desc: 'Decentralized consensus' }
    ];

    let cardsHtml = '<div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(140px, 1fr)); gap: 1rem; margin-bottom: 2rem;">';
    cardsData.forEach(card => {
        cardsHtml += `
            <div class="card" style="padding: 1rem; margin-bottom: 0; text-align: center;">
                <div style="font-size: 2rem; margin-bottom: 0.5rem;">${card.icon}</div>
                <h4 style="margin-bottom: 0.5rem; font-size: 1rem;">${card.title}</h4>
                <p style="font-size: 0.8rem; margin-bottom: 0; color: #888;">${card.desc}</p>
            </div>
        `;
    });
    cardsHtml += '</div>';

    // 3. How This Simulator Works
    const howItWorks = `
        <div class="card" style="text-align: left; max-width: 700px; margin: 0 auto 2rem;">
            <h3>How it works</h3>
            <ul style="padding-left: 1.5rem; color: #ccc; line-height: 1.6;">
                <li style="margin-bottom: 0.5rem;">👉 <strong>Interactive:</strong> You will complete tasks in each module.</li>
                <li style="margin-bottom: 0.5rem;">👉 <strong>Progressive:</strong> Completing a module unlocks the next one.</li>
                <li style="margin-bottom: 0.5rem;">👉 <strong>Persistent:</strong> Your progress is saved automatically.</li>
            </ul>
        </div>
    `;

    // 4. Start Button
    const startBtn = `
        <button id="start-btn" style="font-size: 1.2rem; padding: 1rem 2.5rem; margin-bottom: 2rem;">
            Start Learning 🚀
        </button>
    `;

    container.innerHTML = hero + cardsHtml + howItWorks + startBtn;
    mainContent.appendChild(container);

    // Event Listener
    document.getElementById('start-btn').addEventListener('click', () => {
        completeModule(0); // Mark Intro complete
        navigateTo(1);     // Go to Ledger
    });
}

/**
 * Renders Module 1: Ledger.
 */
function renderModule1() {
    const container = document.createElement('div');
    container.className = 'module-container';

    // 1. Title & Progress
    const header = `
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem;">
            <h2>Module 1: The Ledger 📒</h2>
            <span class="status ${isModule1Complete() ? 'success' : 'active'}" style="font-size: 0.8rem;">
                ${isModule1Complete() ? 'Completed' : 'In Progress'}
            </span>
        </div>
    `;

    // 2. Explanation
    const explanation = `
        <div class="mb-4">
            <p>A <strong>ledger</strong> is simply a list of transactions. It records who sent money to whom.</p>
            <div class="card" style="background: rgba(239, 68, 68, 0.1); border: 1px solid var(--error-color);">
                <h4 style="color: var(--error-color); margin-bottom: 0.5rem;">The Problem 🚨</h4>
                <p style="margin-bottom: 0; font-size: 0.9rem;">
                    Centralized ledgers (like Excel sheets or bank databases) are insecure because
                    <strong>anyone with access can change the history</strong>.
                    Try adding, editing, and deleting transactions below to see how easy it is!
                </p>
            </div>
        </div>
    `;

    // 3. What You Can Do
    // Integrated into the flow above or as a small list.

    // 4. Interactive Section
    // Form
    const transactions = getTransactions();
    const isEditing = editingTransactionId !== null;
    const editingTx = isEditing ? transactions.find(t => t.id === editingTransactionId) : null;

    const form = `
        <div class="card">
            <h3>${isEditing ? 'Edit Transaction' : 'Add New Transaction'}</h3>
            <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 1rem;">
                <input type="text" id="tx-sender" placeholder="Sender (e.g. Alice)" value="${editingTx ? editingTx.sender : ''}" />
                <input type="text" id="tx-receiver" placeholder="Receiver (e.g. Bob)" value="${editingTx ? editingTx.receiver : ''}" />
                <input type="number" id="tx-amount" placeholder="Amount" min="1" value="${editingTx ? editingTx.amount : ''}" />
            </div>
            <div style="display: flex; gap: 1rem; margin-top: 1rem;">
                <button id="add-tx-btn">${isEditing ? 'Update Transaction' : 'Add to Ledger'}</button>
                ${isEditing ? '<button id="cancel-edit-btn" class="secondary">Cancel</button>' : ''}
            </div>
        </div>
    `;

    // Ledger List
    let ledgerList = '<div class="card"><h3>Current Ledger</h3>';
    if (transactions.length === 0) {
        ledgerList += '<p style="text-align: center; color: #666; padding: 1rem;">No transactions yet. Add one above!</p>';
    } else {
        ledgerList += '<ul style="list-style: none; padding: 0;">';
        transactions.forEach((tx) => {
            const isBeingEdited = tx.id === editingTransactionId;
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
                    <div>
                        <span style="font-size: 1.1rem;"><strong>${tx.sender}</strong> ➡️ <strong>${tx.receiver}</strong>: <span style="color: var(--success-color);">${tx.amount} BTC</span></span>
                        <div style="font-size: 0.8rem; color: #666; margin-top: 0.25rem;">${new Date(tx.timestamp).toLocaleTimeString()}</div>
                    </div>
                    <div style="display: flex; gap: 0.5rem;">
                        <button class="secondary edit-btn" data-id="${tx.id}" style="padding: 0.4rem 0.8rem; font-size: 0.9rem;">✏️ Edit</button>
                        <button class="secondary delete-btn" data-id="${tx.id}" style="padding: 0.4rem 0.8rem; font-size: 0.9rem; color: var(--error-color); border-color: rgba(239,68,68,0.5);">🗑️</button>
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
            <button id="next-mod-btn" ${canProceed ? '' : 'disabled'} style="font-size: 1.2rem;">
                Next: Blocks 🧱
            </button>
            ${!canProceed ? '<p style="font-size: 0.9rem; margin-top: 0.5rem; color: #888;">Add at least 2 transactions to continue.</p>' : ''}
        </div>
    `;

    container.innerHTML = header + explanation + form + ledgerList + nextBtn;
    mainContent.appendChild(container);

    // Event Listeners

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
                renderUI();
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
            renderUI();
        });
    }

    // Edit Buttons
    document.querySelectorAll('.edit-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            editingTransactionId = e.target.getAttribute('data-id');
            renderUI();
            // Focus on sender input
            setTimeout(() => document.getElementById('tx-sender').focus(), 50);
        });
    });

    // Delete Buttons
    document.querySelectorAll('.delete-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const id = e.target.getAttribute('data-id');
            if (confirm("Are you sure you want to delete this transaction?")) {
                deleteTransaction(id);
                // If we deleted the item being edited, cancel edit mode
                if (editingTransactionId === id) {
                    editingTransactionId = null;
                }
                renderUI();
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

/**
 * Renders Module 2: Blocks (Placeholder).
 */
function renderModule2Placeholder() {
    const container = document.createElement('div');
    container.className = 'module-container text-center';
    container.innerHTML = `
        <div style="font-size: 4rem; margin-bottom: 1rem;">🧱</div>
        <h1>Module 2: Blocks</h1>
        <p style="font-size: 1.2rem; margin-bottom: 2rem;">
            Great job! You've learned that ledgers can be easily tampered with.
        </p>
        <p>In the next module, we will learn how to <strong>seal</strong> transactions into blocks using <strong>Hashes</strong>.</p>
        <div class="card" style="display: inline-block; margin-top: 2rem;">
            <p style="margin-bottom: 0; color: var(--accent-color);">Coming Soon...</p>
        </div>
    `;
    mainContent.appendChild(container);
}

/**
 * Renders the Blockchain Visualization Panel.
 */
function renderBlockchainPanel() {
    // Hidden on Module 0
    if (AppState.currentModule === 0) {
        blockchainPanel.classList.add('hidden');
        return;
    }

    blockchainPanel.classList.remove('hidden');
    blockchainPanel.innerHTML = '';

    if (isChainEmpty()) {
        const placeholder = document.createElement('div');
        placeholder.className = 'placeholder-text';
        placeholder.style.color = '#666';
        placeholder.style.fontStyle = 'italic';
        placeholder.style.width = '100%';
        placeholder.style.textAlign = 'center';
        placeholder.textContent = 'No blocks mined yet.';
        blockchainPanel.appendChild(placeholder);
    } else {
        const blocks = getBlockchain();
        const placeholder = document.createElement('div');
        placeholder.textContent = `Chain has ${blocks.length} blocks.`;
        blockchainPanel.appendChild(placeholder);
    }
}
