import { AppState } from '../js/appState.js';
import { saveState } from '../js/storage.js';
import { navigateTo, completeModule } from '../js/router.js';
import { recalculateBlockHash } from '../js/blockUtils.js';

let hasGeneratedHashes = 0;
let hasModifiedBlock = false;

export function renderModule3() {
    const mainContent = document.getElementById('main-content');
    mainContent.innerHTML = '';

    const container = document.createElement('div');
    container.className = 'module-container';

    // 1. Header
    const header = `
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem;">
            <h2>Module 3: Hashing 🔐</h2>
            <span class="status ${AppState.progress[3] ? 'success' : 'active'}" style="font-size: 0.8rem;">
                ${AppState.progress[3] ? 'Completed' : 'In Progress'}
            </span>
        </div>
    `;

    // 2. Explanation
    const explanation = `
        <div class="mb-4">
            <p>A <strong>Hash</strong> is a digital fingerprint. No matter how big the input is (a word, a book, or a million transactions), the hash is always the same length.</p>
            <p><strong>The Golden Rule:</strong> Same Input ➡️ Same Hash. Different Input ➡️ Different Hash.</p>
        </div>
    `;

    // 3. Hash Playground
    const playground = `
        <div class="card" style="margin-bottom: 2rem;">
            <h3>Hash Playground 🛝</h3>
            <p style="font-size: 0.9rem; color: #aaa;">Type anything below to see its fingerprint.</p>

            <div style="display: grid; gap: 1rem;">
                <input type="text" id="hash-input" placeholder="Type here..." autocomplete="off" style="
                    width: 100%; padding: 0.75rem; background: rgba(0,0,0,0.3);
                    border: 1px solid rgba(255,255,255,0.2); border-radius: 4px; color: #fff;
                ">

                <div style="display: flex; align-items: center; gap: 0.5rem; margin-bottom: 0.5rem;">
                    <label class="switch">
                        <input type="checkbox" id="auto-hash-toggle" checked>
                        <span class="slider round"></span>
                    </label>
                    <span style="font-size: 0.8rem; color: #ccc;">Auto-update hash</span>
                </div>

                <div style="display: flex; gap: 1rem;">
                    <button id="generate-hash-btn">Generate Hash</button>
                </div>

                <div>
                    <label style="display: block; font-size: 0.8rem; color: #888; margin-bottom: 0.25rem;">OUTPUT HASH</label>
                    <div id="playground-hash-output" style="
                        font-family: monospace;
                        word-break: break-all;
                        background: rgba(0,0,0,0.5);
                        padding: 1rem;
                        border-radius: 4px;
                        min-height: 3.5rem;
                        color: var(--accent-color);
                    "></div>
                </div>
            </div>
        </div>
    `;

    // 4. Block Connection
    // Must use existing block from AppState
    const existingBlock = AppState.blockchain.length > 0 ? AppState.blockchain[0] : null;
    let blockConnectionHtml = '';

    if (existingBlock) {
        blockConnectionHtml = `
            <div class="card" style="border: 1px solid var(--accent-color); background: rgba(59, 130, 246, 0.05);">
                <h3>Connecting to Blocks 🧱</h3>
                <p style="font-size: 0.9rem; color: #aaa;">
                    Now let's look at your block from the previous module.
                    Notice how changing the data changes the block's hash completely.
                </p>

                <div style="display: grid; gap: 1rem;">
                     <!-- Data (Editable) -->
                    <div>
                        <label style="display: block; font-size: 0.8rem; color: #888; margin-bottom: 0.25rem;">BLOCK DATA</label>
                        <textarea id="m3-block-data" rows="6" style="
                            width: 100%;
                            background: rgba(0,0,0,0.3);
                            border: 1px solid rgba(255,255,255,0.2);
                            color: #ddd;
                            font-family: monospace;
                            padding: 0.5rem;
                            border-radius: 4px;
                            resize: vertical;
                        ">${existingBlock.data}</textarea>
                    </div>

                    <!-- Hash -->
                    <div>
                        <label style="display: block; font-size: 0.8rem; color: #888; margin-bottom: 0.25rem;">BLOCK HASH</label>
                        <div id="m3-block-hash" style="
                            font-family: monospace;
                            font-size: 0.9rem;
                            color: var(--success-color);
                            word-break: break-all;
                            background: rgba(16, 185, 129, 0.1);
                            padding: 0.5rem;
                            border-radius: 4px;
                            transition: all 0.3s ease;
                        ">${existingBlock.hash}</div>
                    </div>
                </div>
            </div>
        `;
    } else {
        blockConnectionHtml = `
            <div class="card error-border">
                <p>No block found. Please complete Module 2 first.</p>
                <button onclick="window.navigateTo(2)">Go to Module 2</button>
            </div>
        `;
    }

    // 5. Next Button
    const nextBtn = `
        <div class="text-center mt-4" style="margin-bottom: 2rem;">
            <button id="next-mod-btn" disabled style="font-size: 1.2rem;">
                Next: Blockchain ⛓️
            </button>
            <p id="next-hint" style="font-size: 0.9rem; margin-top: 0.5rem; color: #888;">
                Generate at least 2 hashes and modify the block to continue.
            </p>
        </div>
    `;

    container.innerHTML = header + explanation + playground + blockConnectionHtml + nextBtn;
    mainContent.appendChild(container);

    // --- LOGIC ---

    // Playground Logic
    const input = document.getElementById('hash-input');
    const output = document.getElementById('playground-hash-output');
    const btn = document.getElementById('generate-hash-btn');
    const toggle = document.getElementById('auto-hash-toggle');

    const updatePlaygroundHash = () => {
        const val = input.value;
        const hash = CryptoJS.SHA256(val).toString();
        output.textContent = hash;

        hasGeneratedHashes++;
        checkCompletion();
    };

    if (btn) {
        btn.addEventListener('click', updatePlaygroundHash);
    }

    if (input) {
        input.addEventListener('input', () => {
            if (toggle.checked) {
                updatePlaygroundHash();
            }
        });
    }

    // Block Connection Logic
    if (existingBlock) {
        const blockTextarea = document.getElementById('m3-block-data');
        const blockHashDisplay = document.getElementById('m3-block-hash');

        blockTextarea.addEventListener('input', (e) => {
            const newData = e.target.value;

            // Update Block in AppState
            existingBlock.data = newData;
            existingBlock.hash = recalculateBlockHash(existingBlock);
            saveState();

            // Update UI
            blockHashDisplay.textContent = existingBlock.hash;

            // Animation
            blockHashDisplay.style.background = 'rgba(255, 255, 255, 0.2)';
            blockHashDisplay.style.color = '#fff';
            setTimeout(() => {
                blockHashDisplay.style.background = 'rgba(16, 185, 129, 0.1)';
                blockHashDisplay.style.color = 'var(--success-color)';
            }, 200);

            hasModifiedBlock = true;
            checkCompletion();
        });
    }

    // Next Button Logic
    const nextButton = document.getElementById('next-mod-btn');
    if (nextButton) {
        nextButton.addEventListener('click', () => {
            if (hasGeneratedHashes >= 2 && hasModifiedBlock) {
                completeModule(3);
                navigateTo(4);
            }
        });
    }
}

function checkCompletion() {
    const btn = document.getElementById('next-mod-btn');
    const hint = document.getElementById('next-hint');

    // Condition: 2+ hashes generated AND block modified
    if (btn && hasGeneratedHashes >= 2 && hasModifiedBlock) {
        btn.disabled = false;
        btn.classList.add('pulse-animation');
        hint.textContent = "Great job! You understand how sensitive hashes are.";
        hint.style.color = "var(--success-color)";
    }
}
