import { AppState } from '../js/appState.js';
import { saveState } from '../js/storage.js';
import { navigateTo, completeModule } from '../js/router.js';
import { Block, recalculateBlockHash } from '../js/blockUtils.js';
import { formatTx } from './ledger.js';

let hasCreatedBlock = false;
let hasModifiedBlock = false;

export function renderModule2() {
    const mainContent = document.getElementById('main-content');
    if (!mainContent) return;

    mainContent.innerHTML = '';

    const container = document.createElement('div');
    container.className = 'module-container';

    // 1. Header
    const header = `
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem;">
            <h2>Module 2: Block Basics 🧱</h2>
            <span class="status ${AppState.progress[2] ? 'success' : 'active'}" style="font-size: 0.8rem;">
                ${AppState.progress[2] ? 'Completed' : 'In Progress'}
            </span>
        </div>
    `;

    // 2. Explanation
    const explanation = `
        <div class="mb-4">
            <p>A <strong>block</strong> is a container for data. In a blockchain, this data is usually a list of transactions.</p>
            <p>Once you seal the block (calculate the hash), changing even a single character breaks the seal.</p>
        </div>
    `;

    // 3. What You Can Do
    const actions = `
        <div class="card" style="margin-bottom: 2rem;">
            <h4>Your Mission:</h4>
            <ol style="margin-left: 1.5rem; color: #ccc;">
                <li>Package your Ledger transactions into <strong>Block #1</strong>.</li>
                <li>Edit the data to see how the Hash changes instantly.</li>
            </ol>
        </div>
    `;

    // 4. Block Builder Panel
    const existingBlock = AppState.blockchain.length > 0 ? AppState.blockchain[0] : null;

    let builderHtml = '';
    if (!existingBlock) {
        builderHtml = `
            <div id="creation-zone" class="text-center" style="margin-top: 3rem;">
                <button id="create-block-btn" style="font-size: 1.1rem; padding: 1rem 2rem;">
                    Create Block #1 from Ledger 📦
                </button>
                <p style="margin-top: 1rem; color: #888;">Packages ${AppState.ledger.length} transactions.</p>
            </div>
        `;
    } else {
        hasCreatedBlock = true;
    }

    // 5. Block Display Area
    const blockDisplayId = 'block-display-area';
    const blockDisplayHtml = `<div id="${blockDisplayId}" style="margin-top: 2rem;"></div>`;

    // 6. Next Button
    const nextBtn = `
        <div class="text-center mt-4" style="margin-bottom: 2rem; margin-top: 3rem;">
            <button id="next-mod-btn" disabled style="width: 100%;">
                Next: Hashing 🔐
            </button>
            <p id="next-hint" style="font-size: 0.8rem; margin-top: 0.5rem; color: #888;">
                Create the block and modify it to continue.
            </p>
        </div>
    `;

    container.innerHTML = header + explanation + actions + builderHtml + blockDisplayHtml + nextBtn;
    mainContent.appendChild(container);

    // Render existing block if present
    if (existingBlock) {
        renderBlockCard(existingBlock);
        checkCompletion();
    }

    // Event Listeners
    const createBtn = document.getElementById('create-block-btn');
    if (createBtn) {
        createBtn.addEventListener('click', () => {
            createBlockFromLedger();
        });
    }

    const nextButton = document.getElementById('next-mod-btn');
    if (nextButton) {
        nextButton.addEventListener('click', () => {
            if (hasCreatedBlock && hasModifiedBlock) {
                completeModule(2);
                navigateTo(3);
            }
        });
    }
}

function createBlockFromLedger() {
    // 1. Get transactions and format them
    const transactions = AppState.ledger;
    // Format: "Alice -> Bob : 50 coins"
    const formattedData = transactions.map(tx => formatTx(tx)).join('\n');

    // 2. Create Block Object
    // Index 1 as requested. Previous Hash is "0" (placeholder).
    // Note: We use "0" as prevHash for now. Module 4 will handle the Genesis link.
    const newBlock = new Block(1, Date.now(), formattedData, "0");

    // 3. Update AppState
    AppState.blockchain = [newBlock];
    saveState();

    hasCreatedBlock = true;

    // 4. Update UI
    const creationZone = document.getElementById('creation-zone');
    if (creationZone) creationZone.style.display = 'none';

    renderBlockCard(newBlock);
    checkCompletion();
}

function renderBlockCard(block) {
    const displayArea = document.getElementById('block-display-area');
    if (!displayArea) return;

    displayArea.innerHTML = `
        <div class="card" style="border: 1px solid var(--accent-color); background: rgba(59, 130, 246, 0.05);">
            <div style="display: flex; justify-content: space-between; border-bottom: 1px solid rgba(255,255,255,0.1); padding-bottom: 0.5rem; margin-bottom: 1rem;">
                <strong>Block #${block.index}</strong>
                <span style="color: #888; font-size: 0.8rem;">${new Date(block.timestamp).toLocaleTimeString()}</span>
            </div>

            <div style="background: rgba(255, 255, 255, 0.05); padding: 0.5rem; border-radius: 4px; margin-bottom: 1rem; font-size: 0.8rem; color: #ccc; border-left: 3px solid var(--accent-color);">
                ℹ️ <strong>Note:</strong> In a real blockchain, a <strong>Genesis Block</strong> (Block #0) comes before this. We will add it in Module 4.
            </div>

            <div style="display: grid; gap: 1rem;">
                <!-- Nonce -->
                <div>
                    <label style="display: block; font-size: 0.7rem; color: #888; margin-bottom: 0.25rem;">NONCE</label>
                    <div style="background: rgba(0,0,0,0.3); padding: 0.5rem; border-radius: 4px; font-family: monospace; font-size: 0.9rem;">${block.nonce}</div>
                </div>

                <!-- Data (Editable) -->
                <div>
                    <label style="display: block; font-size: 0.7rem; color: #888; margin-bottom: 0.25rem;">DATA</label>
                    <textarea id="block-data-input" rows="6" style="
                        width: 100%;
                        background: rgba(0,0,0,0.3);
                        border: 1px solid rgba(255,255,255,0.2);
                        color: #ddd;
                        font-family: monospace;
                        font-size: 0.9rem;
                        padding: 0.5rem;
                        border-radius: 4px;
                        resize: vertical;
                    ">${block.data}</textarea>
                    <p style="font-size: 0.75rem; color: #666; margin-top: 0.25rem;">
                        👆 Edit this text to see the hash change!
                    </p>
                </div>

                <!-- Previous Hash -->
                <div>
                    <label style="display: block; font-size: 0.7rem; color: #888; margin-bottom: 0.25rem;">PREVIOUS HASH</label>
                    <div style="font-family: monospace; font-size: 0.8rem; color: #aaa; word-break: break-all;">${block.previousHash}</div>
                </div>

                <!-- Hash -->
                <div>
                    <label style="display: block; font-size: 0.7rem; color: #888; margin-bottom: 0.25rem;">HASH</label>
                    <div id="block-hash-display" style="
                        font-family: monospace;
                        font-size: 0.8rem;
                        color: var(--success-color);
                        word-break: break-all;
                        background: rgba(16, 185, 129, 0.1);
                        padding: 0.5rem;
                        border-radius: 4px;
                        transition: all 0.3s ease;
                    ">${block.hash}</div>
                </div>
            </div>
        </div>
    `;

    // Attach listener for live editing
    const textarea = document.getElementById('block-data-input');
    textarea.addEventListener('input', (e) => {
        const newData = e.target.value;

        // Update block
        block.data = newData;
        block.hash = recalculateBlockHash(block);

        // Update UI
        const hashDisplay = document.getElementById('block-hash-display');
        hashDisplay.textContent = block.hash;

        // Flash animation
        hashDisplay.style.background = 'rgba(255, 255, 255, 0.2)';
        hashDisplay.style.color = '#fff';
        setTimeout(() => {
            hashDisplay.style.background = 'rgba(16, 185, 129, 0.1)';
            hashDisplay.style.color = 'var(--success-color)';
        }, 200);

        saveState();
        hasModifiedBlock = true;
        checkCompletion();
    });
}

function checkCompletion() {
    const btn = document.getElementById('next-mod-btn');
    const hint = document.getElementById('next-hint');

    if (btn && hasCreatedBlock && hasModifiedBlock) {
        btn.disabled = false;
        hint.textContent = "Great! You saw how data changes the hash.";
        hint.style.color = "var(--success-color)";
    }
}
