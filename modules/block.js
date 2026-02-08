
import { AppState } from '../js/appState.js';
import { saveState } from '../js/storage.js';
import { navigateTo, completeModule } from '../js/router.js';
import { Block, recalculateBlockHash } from '../js/blockUtils.js';

let hasCreatedBlock = false;
let hasModifiedBlock = false;

export function renderModule2() {
    const mainContent = document.getElementById('main-content');
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
            <p>A <strong>block</strong> is just a container for data. In a blockchain, this data is usually a list of transactions.</p>
            <p>Think of it like a sealed box. Once you put data in and seal it (calculate the hash), changing even a single comma will change the box's "fingerprint".</p>
        </div>
    `;

    // 3. What You Can Do
    const actions = `
        <div class="card" style="margin-bottom: 2rem;">
            <h4>What to do:</h4>
            <ol style="margin-left: 1.5rem; color: #ccc;">
                <li>Create a block using transactions from your Ledger.</li>
                <li>See how the block organizes this data.</li>
                <li>Try <strong>tampering</strong> with the data to see the hash change!</li>
            </ol>
        </div>
    `;

    // 4. Block Builder Panel
    // If we already have a block in AppState (from previous session), show it.
    // Otherwise show the "Create" button.
    const existingBlock = AppState.blockchain.length > 0 ? AppState.blockchain[0] : null;

    // Logic to decide what to show
    let builderHtml = '';
    if (!existingBlock) {
        builderHtml = `
            <div id="creation-zone" class="text-center" style="margin-top: 3rem;">
                <button id="create-block-btn" style="font-size: 1.2rem; padding: 1rem 2rem;">
                    Create Block from Ledger 📦
                </button>
                <p style="margin-top: 1rem; color: #888;">This will package your ${AppState.ledger.length} ledger transactions into a block.</p>
            </div>
        `;
    } else {
        hasCreatedBlock = true; // Recover state
    }

    // 5. Block Visualization Area (Main Content)
    // We will inject the block card here if it exists
    const blockDisplayId = 'block-display-area';
    const blockDisplayHtml = `<div id="${blockDisplayId}" style="margin-top: 2rem;"></div>`;

    // 6. Next Button
    const nextBtn = `
        <div class="text-center mt-4" style="margin-bottom: 2rem; margin-top: 3rem;">
            <button id="next-mod-btn" disabled style="font-size: 1.2rem;">
                Next: Hashing 🔐
            </button>
            <p id="next-hint" style="font-size: 0.9rem; margin-top: 0.5rem; color: #888;">
                Create a block and modify its data to continue.
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
    // 1. Get transactions
    const transactions = AppState.ledger; // array of objects

    // 2. Format data for the block (JSON string)
    // We store the array directly in data, but when calculating hash/displaying, we treat it as string
    const blockData = JSON.stringify(transactions, null, 2);

    // 3. Create Block Object
    // index 0 (Genesis-ish), timestamp now, data, prevHash "0"
    const newBlock = new Block(0, Date.now(), blockData, "0");

    // 4. Update AppState
    // We only want ONE block for this module, so we reset the array
    AppState.blockchain = [newBlock];
    saveState();

    hasCreatedBlock = true;

    // 5. Update UI
    const creationZone = document.getElementById('creation-zone');
    if (creationZone) creationZone.style.display = 'none'; // Hide button

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
                <span style="color: #888; font-size: 0.9rem;">${new Date(block.timestamp).toLocaleString()}</span>
            </div>

            <div style="display: grid; gap: 1rem;">
                <!-- Nonce -->
                <div>
                    <label style="display: block; font-size: 0.8rem; color: #888; margin-bottom: 0.25rem;">NONCE</label>
                    <div style="background: rgba(0,0,0,0.3); padding: 0.5rem; border-radius: 4px; font-family: monospace;">${block.nonce}</div>
                </div>

                <!-- Data (Editable) -->
                <div>
                    <label style="display: block; font-size: 0.8rem; color: #888; margin-bottom: 0.25rem;">DATA (Transactions)</label>
                    <textarea id="block-data-input" rows="8" style="
                        width: 100%;
                        background: rgba(0,0,0,0.3);
                        border: 1px solid rgba(255,255,255,0.2);
                        color: #ddd;
                        font-family: monospace;
                        padding: 0.5rem;
                        border-radius: 4px;
                        resize: vertical;
                    ">${block.data}</textarea>
                    <p style="font-size: 0.8rem; color: #666; margin-top: 0.25rem;">
                        👆 Edit this text to see the hash change!
                    </p>
                </div>

                <!-- Previous Hash -->
                <div>
                    <label style="display: block; font-size: 0.8rem; color: #888; margin-bottom: 0.25rem;">PREVIOUS HASH</label>
                    <div style="font-family: monospace; font-size: 0.9rem; color: #aaa; word-break: break-all;">${block.previousHash}</div>
                </div>

                <!-- Hash -->
                <div>
                    <label style="display: block; font-size: 0.8rem; color: #888; margin-bottom: 0.25rem;">HASH</label>
                    <div id="block-hash-display" style="
                        font-family: monospace;
                        font-size: 0.9rem;
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

        // Update local block object (temporarily for this view)
        // Note: In a real app we might not want to save "tampered" state immediately or maybe we do?
        // Requirements say "Change block data -> See hash update".
        // We will update the AppState block so it persists to Module 3.
        block.data = newData;
        block.hash = recalculateBlockHash(block);

        // Update UI Hash
        const hashDisplay = document.getElementById('block-hash-display');
        hashDisplay.textContent = block.hash;

        // Flash animation
        hashDisplay.style.background = 'rgba(255, 255, 255, 0.2)';
        hashDisplay.style.color = '#fff';
        setTimeout(() => {
            hashDisplay.style.background = 'rgba(16, 185, 129, 0.1)';
            hashDisplay.style.color = 'var(--success-color)';
        }, 200);

        // Save changes
        saveState();

        // Mark requirement as met
        hasModifiedBlock = true;
        checkCompletion();
    });
}

function checkCompletion() {
    const btn = document.getElementById('next-mod-btn');
    const hint = document.getElementById('next-hint');

    if (btn && hasCreatedBlock && hasModifiedBlock) {
        btn.disabled = false;
        btn.classList.add('pulse-animation'); // Optional visual cue
        hint.textContent = "Great! You can now proceed to learn about Hashing.";
        hint.style.color = "var(--success-color)";
    }
}
