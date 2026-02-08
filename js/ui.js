import { AppState } from './appState.js';
import { navigateTo } from './router.js';
import { addTransaction, getTransactions, isModule1Complete } from '../modules/ledger.js';
import { getBlockchain, isChainEmpty } from './blockchain.js';

// DOM Elements
const sidebar = document.getElementById('sidebar');
const moduleNav = document.getElementById('module-nav');
const mainContent = document.getElementById('main-content');
const blockchainPanel = document.getElementById('blockchain-panel');

// Module Definitions (Metadata)
const MODULES = [
    { id: 0, title: "Introduction", icon: "👋" },
    { id: 1, title: "Ledger", icon: "📒" },
    // Future modules will be added here
];

/**
 * Main render function.
 * Updates the entire UI based on the current AppState.
 */
export function renderUI() {
    renderSidebar();
    renderMainContent();
    renderBlockchainPanel();
}

/**
 * Renders the sidebar navigation.
 */
function renderSidebar() {
    moduleNav.innerHTML = '';

    MODULES.forEach(mod => {
        const btn = document.createElement('button');
        btn.className = `nav-item ${AppState.currentModule === mod.id ? 'active' : ''}`;
        btn.textContent = `${mod.icon} ${mod.title}`;
        btn.onclick = () => {
            // Only allow navigation if the module is unlocked (to be implemented)
            // For now, allow navigation if we've visited it or it's the next one
            navigateTo(mod.id);
        };

        // Simple styling for nav items
        btn.style.width = '100%';
        btn.style.textAlign = 'left';
        btn.style.background = AppState.currentModule === mod.id ? 'var(--accent-color)' : 'transparent';
        btn.style.color = AppState.currentModule === mod.id ? '#fff' : 'var(--text-color)';
        btn.style.marginBottom = '0.5rem';
        btn.style.border = 'none';
        btn.style.cursor = 'pointer';

        moduleNav.appendChild(btn);
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

    container.innerHTML = `
        <h1>Welcome to BlockSim 👋</h1>
        <p style="font-size: 1.2rem; margin-bottom: 2rem;">
            BlockSim is an interactive, visual simulator that teaches you how blockchain works by building it step-by-step.
        </p>

        <div class="card" style="text-align: left; max-width: 600px; margin: 0 auto;">
            <h3>What you will learn:</h3>
            <ul style="padding-left: 1.5rem; margin-bottom: 1.5rem; color: #ccc;">
                <li>How a simple Ledger works (and why it's insecure)</li>
                <li>What Blocks and Hashes are</li>
                <li>How specific rules (Consensus) keep the network safe</li>
                <li>What Mining actually does</li>
            </ul>

            <p><strong>How to use this simulator:</strong></p>
            <p>You will complete tasks in each module to unlock the next one. No coding required!</p>
        </div>

        <button id="start-btn" class="mt-4" style="font-size: 1.2rem; padding: 1rem 2rem;">
            Start Learning 🚀
        </button>
    `;

    mainContent.appendChild(container);

    document.getElementById('start-btn').addEventListener('click', () => {
        navigateTo(1);
    });
}

/**
 * Renders Module 1: Ledger.
 */
function renderModule1() {
    const container = document.createElement('div');
    container.className = 'module-container';

    // Explanation Section
    const explanation = `
        <h2>Module 1: The Ledger 📒</h2>
        <p>A <strong>ledger</strong> is simply a list of transactions. It records who sent money to whom.</p>
        <p>Before we have blocks or chains, we just have a list. Let's create one!</p>
        <div class="status success mb-4" style="display: inline-block;">
            Goal: Add at least 2 transactions to unlock the next module.
        </div>
    `;

    // Interactive Form
    const form = `
        <div class="card">
            <h3>Add New Transaction</h3>
            <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 1rem;">
                <input type="text" id="tx-sender" placeholder="Sender (e.g., Alice)" />
                <input type="text" id="tx-receiver" placeholder="Receiver (e.g., Bob)" />
                <input type="number" id="tx-amount" placeholder="Amount" min="1" />
            </div>
            <button id="add-tx-btn" class="mt-2">Add to Ledger</button>
        </div>
    `;

    // Ledger Visualization (List)
    const transactions = getTransactions();
    let ledgerList = '<div class="card"><h3>Current Ledger</h3>';
    if (transactions.length === 0) {
        ledgerList += '<p>No transactions yet.</p>';
    } else {
        ledgerList += '<ul style="list-style: none; padding: 0;">';
        transactions.forEach((tx, index) => {
            ledgerList += `
                <li style="background: rgba(255,255,255,0.05); padding: 0.5rem; margin-bottom: 0.5rem; border-radius: 4px; display: flex; justify-content: space-between;">
                    <span><strong>${tx.sender}</strong> sent <strong>${tx.amount}</strong> to <strong>${tx.receiver}</strong></span>
                    <span style="color: #666; font-size: 0.8rem;">${new Date(tx.timestamp).toLocaleTimeString()}</span>
                </li>
            `;
        });
        ledgerList += '</ul>';
    }
    ledgerList += '</div>';

    // Navigation (Next Button)
    const isComplete = isModule1Complete();
    const nextBtn = `
        <div class="text-center mt-4">
            <button id="next-mod-btn" ${isComplete ? '' : 'disabled'}>
                Next: Blocks 🧱
            </button>
            ${!isComplete ? '<p style="font-size: 0.9rem; margin-top: 0.5rem;">Add more transactions to continue.</p>' : ''}
        </div>
    `;

    container.innerHTML = explanation + form + ledgerList + nextBtn;
    mainContent.appendChild(container);

    // Event Listeners
    document.getElementById('add-tx-btn').addEventListener('click', () => {
        const sender = document.getElementById('tx-sender').value;
        const receiver = document.getElementById('tx-receiver').value;
        const amount = document.getElementById('tx-amount').value;

        if (sender && receiver && amount) {
            addTransaction(sender, receiver, amount);
            renderUI(); // Re-render to update list and button state
        } else {
            alert("Please fill in all fields.");
        }
    });

    // Helper function to attach event listener to dynamically created element
    const nextBtnEl = document.getElementById('next-mod-btn');
    if (nextBtnEl) {
        nextBtnEl.addEventListener('click', () => {
            if (isModule1Complete()) {
                navigateTo(2); // Go to Module 2 (Block)
            }
        });
    }
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
        placeholder.textContent = 'No blocks mined yet. Continue learning to create the first block!';
        blockchainPanel.appendChild(placeholder);
    } else {
        // Render blocks (future steps)
        const blocks = getBlockchain();
        // Placeholder for block rendering
        const placeholder = document.createElement('div');
        placeholder.textContent = `Chain has ${blocks.length} blocks.`;
        blockchainPanel.appendChild(placeholder);
    }
}
