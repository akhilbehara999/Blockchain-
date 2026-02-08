
import { AppState } from '../js/appState.js';
import { saveState } from '../js/storage.js';
import { Block, recalculateBlockHash, isChainValid, generateDummyData } from '../js/blockUtils.js';

let hasTampered = false;

export function renderModule4() {
    const mainContent = document.getElementById('main-content');
    mainContent.innerHTML = '';

    const container = document.createElement('div');
    container.className = 'module-container';

    // 1. Header
    const header = `
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem;">
            <h2>Module 4: Blockchain Linking 🔗</h2>
            <div id="chain-status-indicator" class="status active">Checking...</div>
        </div>
    `;

    // 2. Explanation
    const explanation = `
        <div class="mb-4">
            <p>A blockchain is a chain of blocks. Each block contains the <strong>hash of the previous block</strong>.</p>
            <p>This creates a secure link. If you change data in Block 1, its hash changes. This breaks the link to Block 2, which breaks the link to Block 3, and so on.</p>
        </div>
    `;

    // 3. Actions
    const actions = `
        <div class="card" style="margin-bottom: 2rem; display: flex; align-items: center; justify-content: space-between;">
            <div>
                <h4>Build the Chain</h4>
                <p style="font-size: 0.9rem; color: #aaa; margin: 0;">Add blocks to see the chain grow.</p>
            </div>
            <button id="add-block-btn" style="padding: 0.75rem 1.5rem;">+ Add New Block</button>
        </div>

        <div class="card" style="background: rgba(239, 68, 68, 0.1); border: 1px solid var(--error-color);">
            <h4 style="color: var(--error-color);">Tamper Simulation 🕵️‍♀️</h4>
            <p style="font-size: 0.9rem; margin: 0;">
                Go to the <strong>Blockchain Panel</strong> below and try editing the data of an early block (like Block #1).
                Watch how the entire chain turns red!
            </p>
        </div>
    `;

    // 4. Next Button
    const nextBtn = `
        <div class="text-center mt-4" style="margin-bottom: 2rem;">
            <button id="next-mod-btn" disabled style="font-size: 1.2rem;">
                Next: Coming Soon...
            </button>
            <p id="next-hint" style="font-size: 0.9rem; margin-top: 0.5rem; color: #888;">
                Add at least 3 blocks and try tampering with one to finish.
            </p>
        </div>
    `;

    container.innerHTML = header + explanation + actions + nextBtn;
    mainContent.appendChild(container);

    // Initial render of the persistent panel (now active for this module)
    renderBlockchainPanel();
    updateStatusIndicator();

    // Event Listeners
    const addBtn = document.getElementById('add-block-btn');
    if (addBtn) {
        addBtn.addEventListener('click', () => {
            addNewBlock();
        });
    }

    // Since the "Next" button leads to "Coming Soon", we just disable it for now or mark complete?
    // The requirements say "STOP after Module 4 is complete."
    // So we just need to enable it visually to show success.
}

function addNewBlock() {
    const chain = AppState.blockchain;
    const prevBlock = chain[chain.length - 1];

    // Auto-generate data
    const data = generateDummyData();
    const index = chain.length;
    const timestamp = Date.now();
    const prevHash = prevBlock ? prevBlock.hash : "0";

    const newBlock = new Block(index, timestamp, data, prevHash);

    AppState.blockchain.push(newBlock);
    saveState();

    renderBlockchainPanel();
    updateStatusIndicator();
    checkCompletion();
}

/**
 * Renders the horizontal blockchain visualization in the fixed panel.
 */
export function renderBlockchainPanel() {
    const panel = document.getElementById('blockchain-panel');
    if (!panel) return;

    // Ensure visible
    panel.classList.remove('hidden');
    panel.innerHTML = '';

    // Container for horizontal scrolling
    const scrollContainer = document.createElement('div');
    scrollContainer.style.display = 'flex';
    scrollContainer.style.alignItems = 'flex-start'; // Align top
    scrollContainer.style.gap = '1rem';
    scrollContainer.style.padding = '1rem';
    scrollContainer.style.minWidth = '100%';

    // Validation check for highlighting
    // We need to know WHICH blocks are invalid.
    // isChainValid returns bool, but let's do a local check to mark specific blocks.
    const invalidIndices = new Set();

    // Basic validation loop
    for (let i = 1; i < AppState.blockchain.length; i++) {
        const current = AppState.blockchain[i];
        const previous = AppState.blockchain[i - 1];

        // Check 1: Hash valid?
        if (current.hash !== recalculateBlockHash(current)) {
            invalidIndices.add(i);
        }

        // Check 2: Link valid?
        if (current.previousHash !== previous.hash) {
            invalidIndices.add(i);
        }

        // If previous was invalid, this one is effectively broken too (chain reaction)
        if (invalidIndices.has(i-1)) {
            invalidIndices.add(i);
        }
    }
    // Also check genesis block integrity? (Usually assumed true, but if edited...)
    if (AppState.blockchain.length > 0) {
        const genesis = AppState.blockchain[0];
        if (genesis.hash !== recalculateBlockHash(genesis)) {
            invalidIndices.add(0);
        }
    }


    AppState.blockchain.forEach((block, index) => {
        // Arrow (except for first block)
        if (index > 0) {
            const arrow = document.createElement('div');
            arrow.className = 'chain-arrow';
            arrow.innerHTML = '➡️';
            arrow.style.alignSelf = 'center';
            scrollContainer.appendChild(arrow);
        }

        // Card
        const card = document.createElement('div');
        const isInvalid = invalidIndices.has(index);
        card.className = `chain-block ${isInvalid ? 'invalid' : ''}`;

        card.innerHTML = `
            <h4>
                Block #${block.index}
                <span>${isInvalid ? '❌' : '✅'}</span>
            </h4>

            <div class="field">
                <label>DATA</label>
                <input type="text" class="data-edit" value="${block.data.replace(/"/g, '&quot;')}" data-index="${index}">
            </div>

            <div class="field">
                <label>PREVIOUS HASH</label>
                <div class="value" style="color: #aaa; font-size: 0.7rem;">
                    ${block.previousHash.substring(0, 20)}...
                </div>
            </div>

            <div class="field">
                <label>HASH</label>
                <div class="value" style="color: ${isInvalid ? 'var(--error-color)' : 'var(--success-color)'}; font-size: 0.7rem;">
                    ${block.hash.substring(0, 20)}...
                </div>
            </div>

            <div class="field">
                <label>NONCE</label>
                <div class="value">${block.nonce}</div>
            </div>
        `;

        scrollContainer.appendChild(card);
    });

    panel.appendChild(scrollContainer);

    // Attach listeners for inline editing
    const inputs = panel.querySelectorAll('.data-edit');
    inputs.forEach(input => {
        input.addEventListener('input', (e) => {
            const idx = parseInt(e.target.dataset.index);
            const val = e.target.value;

            // Update Block
            const block = AppState.blockchain[idx];
            block.data = val;
            block.hash = recalculateBlockHash(block);

            saveState();

            // Re-render to show validation effects
            // (Debouncing would be nice, but instant feedback is requested)
            renderBlockchainPanel();
            updateStatusIndicator();

            // Mark as tampered if chain is broken
            if (!isChainValid(AppState.blockchain)) {
                hasTampered = true;
                checkCompletion();
            }
        });
    });
}

function updateStatusIndicator() {
    const indicator = document.getElementById('chain-status-indicator');
    if (!indicator) return;

    const isValid = isChainValid(AppState.blockchain);

    if (isValid) {
        indicator.textContent = "Blockchain Valid ✅";
        indicator.className = "status success";
        indicator.style.background = "rgba(16, 185, 129, 0.2)";
        indicator.style.color = "var(--success-color)";
        indicator.style.border = "1px solid var(--success-color)";
    } else {
        indicator.textContent = "Blockchain Broken ❌";
        indicator.className = "status error";
        indicator.style.background = "rgba(239, 68, 68, 0.2)";
        indicator.style.color = "var(--error-color)";
        indicator.style.border = "1px solid var(--error-color)";
    }
}

function checkCompletion() {
    const btn = document.getElementById('next-mod-btn');
    const hint = document.getElementById('next-hint');
    const isValid = isChainValid(AppState.blockchain);

    // Unlock: 3 blocks + has tampered at least once (even if fixed later, though 'broken' is the lesson)
    // Actually, usually we want them to see it broken.
    if (btn && AppState.blockchain.length >= 3 && hasTampered) {
        btn.disabled = false;
        btn.textContent = "Module Completed! 🎉"; // Stop condition met
        hint.textContent = "You've mastered the basics of Blockchain linking!";
        hint.style.color = "var(--success-color)";
    }
}
