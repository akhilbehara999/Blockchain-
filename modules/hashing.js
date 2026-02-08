import { AppState } from '../js/appState.js';
import { saveState } from '../js/storage.js';
import { navigateTo, completeModule } from '../js/router.js';
import { recalculateBlockHash } from '../js/blockUtils.js';

let hasGeneratedHashes = 0;
let hasModifiedBlock = false;

export function renderModule3() {
    const mainContent = document.getElementById('main-content');
    if (!mainContent) return;

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
            <p>A <strong>Hash</strong> is a unique digital fingerprint. If you change the input even slightly, the hash changes completely.</p>
        </div>
    `;

    // 3. Hash Playground
    const playground = `
        <div class="card" style="margin-bottom: 2rem;">
            <h3>Step 1: Hash Playground 🛝</h3>
            <p style="font-size: 0.8rem; color: #aaa;">Type anything to generate a SHA-256 hash.</p>

            <div style="display: grid; gap: 0.75rem;">
                <input type="text" id="hash-input" placeholder="Type here (e.g. Hello)" autocomplete="off">

                <div>
                    <label style="display: block; font-size: 0.7rem; color: #888; margin-bottom: 0.25rem;">OUTPUT HASH</label>
                    <div id="playground-hash-output" style="
                        font-family: monospace;
                        font-size: 0.8rem;
                        word-break: break-all;
                        background: rgba(0,0,0,0.5);
                        padding: 0.75rem;
                        border-radius: 4px;
                        min-height: 2.5rem;
                        color: var(--accent-color);
                    "></div>
                </div>
            </div>
        </div>
    `;

    // 4. Block Connection
    const existingBlock = AppState.blockchain.length > 0 ? AppState.blockchain[0] : null;
    let blockConnectionHtml = '';

    if (existingBlock) {
        blockConnectionHtml = `
            <div class="card" style="border: 1px solid var(--accent-color); background: rgba(59, 130, 246, 0.05);">
                <h3>Step 2: Hashing a Block 🧱</h3>
                <p style="font-size: 0.8rem; color: #aaa;">
                    This is your block from Module 2. Edit the data to see its fingerprint change.
                </p>

                <div style="display: grid; gap: 0.75rem;">
                    <div>
                        <label style="display: block; font-size: 0.7rem; color: #888; margin-bottom: 0.25rem;">BLOCK DATA</label>
                        <textarea id="m3-block-data" rows="4" style="
                            width: 100%;
                            background: rgba(0,0,0,0.3);
                            border: 1px solid rgba(255,255,255,0.2);
                            color: #ddd;
                            font-family: monospace;
                            font-size: 0.9rem;
                            padding: 0.5rem;
                            border-radius: 4px;
                            resize: vertical;
                        ">${existingBlock.data}</textarea>
                    </div>

                    <div>
                        <label style="display: block; font-size: 0.7rem; color: #888; margin-bottom: 0.25rem;">BLOCK HASH</label>
                        <div id="m3-block-hash" style="
                            font-family: monospace;
                            font-size: 0.8rem;
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
            <div class="card" style="border: 1px solid var(--error-color);">
                <p>⚠️ No block found. Please complete Module 2 first.</p>
                <button onclick="window.location.reload()" class="secondary">Reload</button>
            </div>
        `;
    }

    // 5. Next Button
    const nextBtn = `
        <div class="text-center mt-4" style="margin-bottom: 2rem;">
            <button id="next-mod-btn" disabled style="width: 100%;">
                Next: Blockchain ⛓️
            </button>
            <p id="next-hint" style="font-size: 0.8rem; margin-top: 0.5rem; color: #888;">
                Generate a hash AND modify the block to continue.
            </p>
        </div>
    `;

    container.innerHTML = header + explanation + playground + blockConnectionHtml + nextBtn;
    mainContent.appendChild(container);

    // --- LOGIC ---

    // Playground
    const input = document.getElementById('hash-input');
    const output = document.getElementById('playground-hash-output');

    if (input && output) {
        input.addEventListener('input', () => {
            const val = input.value;
            // Use crypto-js
            const hash = typeof CryptoJS !== 'undefined' ? CryptoJS.SHA256(val).toString() : "CryptoJS Error";
            output.textContent = hash;

            if (val.length > 0) {
                hasGeneratedHashes++;
                checkCompletion();
            }
        });
    }

    // Block Connection
    if (existingBlock) {
        const blockTextarea = document.getElementById('m3-block-data');
        const blockHashDisplay = document.getElementById('m3-block-hash');

        if (blockTextarea) {
            blockTextarea.addEventListener('input', (e) => {
                const newData = e.target.value;

                // Update Block in AppState
                existingBlock.data = newData;
                existingBlock.hash = recalculateBlockHash(existingBlock);
                saveState();

                // Update UI
                if (blockHashDisplay) {
                    blockHashDisplay.textContent = existingBlock.hash;

                    // Animation
                    blockHashDisplay.style.background = 'rgba(255, 255, 255, 0.2)';
                    blockHashDisplay.style.color = '#fff';
                    setTimeout(() => {
                        blockHashDisplay.style.background = 'rgba(16, 185, 129, 0.1)';
                        blockHashDisplay.style.color = 'var(--success-color)';
                    }, 200);
                }

                hasModifiedBlock = true;
                checkCompletion();
            });
        }
    }

    // Next Button
    const nextButton = document.getElementById('next-mod-btn');
    if (nextButton) {
        nextButton.addEventListener('click', () => {
            if (hasGeneratedHashes > 0 && hasModifiedBlock) {
                completeModule(3);
                navigateTo(4);
            }
        });
    }
}

function checkCompletion() {
    const btn = document.getElementById('next-mod-btn');
    const hint = document.getElementById('next-hint');

    // Condition: 1+ hash generated AND block modified
    if (btn && hasGeneratedHashes > 0 && hasModifiedBlock) {
        btn.disabled = false;
        hint.textContent = "Great job! You understand how sensitive hashes are.";
        hint.style.color = "var(--success-color)";
    }
}
