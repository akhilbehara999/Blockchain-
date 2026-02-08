import { AppState } from '../js/appState.js';
import { saveState } from '../js/storage.js';
import { Block, recalculateBlockHash, isChainValid, generateDummyData } from '../js/blockUtils.js';

let hasTampered = false;

export function renderModule4() {
    const mainContent = document.getElementById('main-content');
    if (!mainContent) return;

    mainContent.innerHTML = '';

    const container = document.createElement('div');
    container.className = 'module-container';

    // 1. Initialize Blockchain State (Transition Logic)
    initializeBlockchain();

    // 2. Header
    const header = `
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem;">
            <h2>Module 4: Blockchain Linking 🔗</h2>
            <div id="chain-status-indicator" class="status active" style="font-size: 0.8rem;">Checking...</div>
        </div>
    `;

    // 3. Explanation
    const explanation = `
        <div class="mb-4">
            <p>We've added a <strong>Genesis Block</strong> (Block #0) to start the chain. Your block is now Block #1.</p>
            <p>Each block stores the hash of the previous one. This creates an unbreakable chain.</p>
        </div>
    `;

    // 4. Actions
    const actions = `
        <div class="card" style="margin-bottom: 2rem; display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 1rem;">
            <div>
                <h4>Build the Chain</h4>
                <p style="font-size: 0.8rem; color: #aaa; margin: 0;">Add new blocks to the chain.</p>
            </div>
            <button id="add-block-btn" style="padding: 0.75rem 1.5rem; flex-shrink: 0;">+ Add Block</button>
        </div>

        <div class="card" style="background: rgba(239, 68, 68, 0.1); border: 1px solid var(--error-color);">
            <h4 style="color: var(--error-color);">🕵️‍♀️ Tamper Mission</h4>
            <p style="font-size: 0.8rem; margin: 0; color: #ccc;">
                Open the <strong>Blockchain Panel</strong> (button at bottom right) and try changing data in Block #1.
                Watch how it breaks the link to Block #2 and beyond!
            </p>
        </div>
    `;

    // 5. Completion Status
    const completionHtml = `
        <div class="text-center mt-4" style="margin-bottom: 2rem;">
            <button id="finish-btn" disabled style="width: 100%;">
                Finish Course 🎉
            </button>
            <p id="finish-hint" style="font-size: 0.8rem; margin-top: 0.5rem; color: #888;">
                Add at least 3 blocks and try tampering to complete.
            </p>
        </div>
    `;

    container.innerHTML = header + explanation + actions + completionHtml;
    mainContent.appendChild(container);

    // Initial render of the persistent panel
    renderBlockchainPanel();
    updateStatusIndicator();

    // Event Listeners
    const addBtn = document.getElementById('add-block-btn');
    if (addBtn) {
        addBtn.addEventListener('click', () => {
            addNewBlock();
        });
    }

    const finishBtn = document.getElementById('finish-btn');
    if (finishBtn) {
        finishBtn.addEventListener('click', () => {
            alert("Congratulations! You've completed the Blockchain Simulator course!");
            // Reset or redirect logic here
        });
    }
}

/**
 * Handles the transition from Module 2/3 to Module 4.
 * Ensures Genesis block exists and links properly.
 */
function initializeBlockchain() {
    let chain = AppState.blockchain;

    // Case 0: Empty chain (shouldn't happen if Mod 2 done, but safe fallback)
    if (chain.length === 0) {
        const genesis = new Block(0, Date.now(), "Genesis Block", "0");
        chain.push(genesis);
    }
    // Case 1: Only Block #1 exists (from Mod 2)
    else if (chain.length === 1 && chain[0].index === 1) {
        const block1 = chain[0];

        // Create Genesis
        const genesis = new Block(0, Date.now(), "Genesis Block", "0");

        // Link Block 1 to Genesis
        block1.previousHash = genesis.hash;
        block1.hash = recalculateBlockHash(block1); // Re-hash because prevHash changed

        // Prepend Genesis
        chain.unshift(genesis);
    }
    // Case 2: Genesis exists, check link integrity for Block 1
    // (If user reloads page or comes back)
    else if (chain.length >= 2) {
         // Ensure Block 1 links to Genesis (if it was "0" placeholder)
         if (chain[1].previousHash === "0" && chain[0].hash !== "0") {
             chain[1].previousHash = chain[0].hash;
             chain[1].hash = recalculateBlockHash(chain[1]);
         }
    }

    AppState.blockchain = chain;
    saveState();
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
 * Renders the horizontal blockchain visualization in the drawer.
 */
export function renderBlockchainPanel() {
    const panel = document.getElementById('blockchain-panel');
    if (!panel) return;

    // We only render fully if we are in Module 4 (or maybe just render anyway if data exists?)
    // The panel is "Live", so we should render what we have.
    // If in Mod 1-3, we might want to restrict editing or simplify.
    // But for now, let's render the full view if chain exists.

    if (AppState.blockchain.length === 0) {
        panel.innerHTML = '<div class="placeholder-text" style="color:#666; text-align:center; width:100%;">No blocks yet.</div>';
        return;
    }

    panel.innerHTML = ''; // Clear

    // Container for horizontal scrolling (already in css/chain.css as .chain-container?)
    // Actually layout.css defines .drawer-content with overflow-x: auto.
    // We just need a flex container.
    const scrollContainer = document.createElement('div');
    scrollContainer.className = 'chain-container';

    // Calculate Validity Map
    const invalidIndices = new Set();

    // Check Genesis
    if (AppState.blockchain.length > 0) {
        const genesis = AppState.blockchain[0];
        if (genesis.hash !== recalculateBlockHash(genesis)) {
            invalidIndices.add(0);
        }
    }

    // Check Chain
    for (let i = 1; i < AppState.blockchain.length; i++) {
        const current = AppState.blockchain[i];
        const previous = AppState.blockchain[i - 1];

        // 1. Valid Hash?
        if (current.hash !== recalculateBlockHash(current)) {
            invalidIndices.add(i);
        }
        // 2. Valid Link?
        if (current.previousHash !== previous.hash) {
            invalidIndices.add(i);
        }
        // 3. Previous broken?
        if (invalidIndices.has(i - 1)) {
            invalidIndices.add(i);
        }
    }

    AppState.blockchain.forEach((block, index) => {
        // Arrow
        if (index > 0) {
            const arrow = document.createElement('div');
            arrow.className = 'chain-arrow';
            arrow.innerHTML = '➡️';
            scrollContainer.appendChild(arrow);
        }

        // Card
        const card = document.createElement('div');
        const isInvalid = invalidIndices.has(index);
        card.className = `chain-block ${isInvalid ? 'invalid' : ''}`;

        // Disable editing for Genesis Block
        const isEditable = index !== 0;

        card.innerHTML = `
            <h4>
                Block #${block.index}
                <span>${isInvalid ? '❌' : '✅'}</span>
            </h4>

            <div class="field">
                <label>DATA</label>
                <input type="text" class="data-edit"
                    value="${block.data.replace(/"/g, '&quot;')}"
                    data-index="${index}"
                    ${!isEditable ? 'disabled style="color:#888; border:none; background:transparent;"' : ''}
                >
            </div>

            <div class="field">
                <label>PREVIOUS HASH</label>
                <div class="value" style="color: #aaa; font-size: 0.65rem;">
                    ${block.previousHash.substring(0, 20)}...
                </div>
            </div>

            <div class="field">
                <label>HASH</label>
                <div class="value" style="color: ${isInvalid ? 'var(--error-color)' : 'var(--success-color)'}; font-size: 0.65rem;">
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

    // Attach Listeners
    const inputs = panel.querySelectorAll('.data-edit');
    inputs.forEach(input => {
        input.addEventListener('input', (e) => {
            const idx = parseInt(e.target.dataset.index);
            const val = e.target.value;

            const block = AppState.blockchain[idx];
            block.data = val;
            block.hash = recalculateBlockHash(block);
            saveState();

            // Re-render immediately to show red chain reaction
            // In a large chain, we might want to optimize this, but for < 10 blocks it's fine.
            renderBlockchainPanel();
            updateStatusIndicator();

            // Track tampering for completion
            // If chain is invalid, user has successfully tampered
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
        indicator.textContent = "Valid ✅";
        indicator.className = "status success";
        indicator.style.background = "rgba(16, 185, 129, 0.2)";
        indicator.style.color = "var(--success-color)";
    } else {
        indicator.textContent = "Broken ❌";
        indicator.className = "status error";
        indicator.style.background = "rgba(239, 68, 68, 0.2)";
        indicator.style.color = "var(--error-color)";
    }
}

function checkCompletion() {
    const btn = document.getElementById('finish-btn');
    const hint = document.getElementById('finish-hint');

    // Condition: 3+ blocks AND has tampered
    if (btn && AppState.blockchain.length >= 3 && hasTampered) {
        btn.disabled = false;
        hint.textContent = "You've seen how fragile the chain is!";
        hint.style.color = "var(--success-color)";
    }
}
