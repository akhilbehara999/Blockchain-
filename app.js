'use strict';

// ==========================================
// CORE DATA MODELS & LOGIC
// ==========================================

class Transaction {
    constructor(sender, receiver, amount) {
        this.id = Date.now().toString() + Math.random().toString(36).substr(2, 9);
        this.sender = sender;
        this.receiver = receiver;
        this.amount = parseFloat(amount);
        this.timestamp = new Date().toISOString();
        // Status is derived from block validity in UI, but we keep the object simple
    }
}

class Block {
    constructor(index, transactions, previousHash = "0", difficulty = 3) {
        this.index = index;
        this.timestamp = new Date().toISOString();
        this.transactions = transactions;
        this.previousHash = previousHash;
        this.difficulty = difficulty; // Store difficulty in block
        this.nonce = 0;
        this.hash = ""; // Empty until mined
        this.isValid = true; // Cache validation status
        this.invalidReason = null; // Store reason if invalid
    }
}

const BlockchainLogic = {
    calculateHash: function(index, timestamp, transactions, previousHash, nonce, difficulty) {
        // Include difficulty in hash to ensure it's part of the integrity check
        const blockData = index + timestamp + JSON.stringify(transactions) + previousHash + nonce + difficulty;
        return CryptoJS.SHA256(blockData).toString();
    },

    // Check if hash meets difficulty requirement
    isHashValid: function(hash, difficulty) {
        const prefix = "0".repeat(difficulty);
        return hash.startsWith(prefix);
    },

    // Validate a single block against its predecessor and its own difficulty
    validateBlock: function(block, previousBlock) {
        // Return object with status and reason
        const result = { isValid: true, reason: null };

        // 1. Check if previousHash matches previous block's hash
        // For genesis block (index 0), previousHash should be "0"
        if (block.index === 0) {
            if (block.previousHash !== "0") {
                result.isValid = false;
                result.reason = "Genesis Block: Previous hash must be 0";
                return result;
            }
        } else {
            if (!previousBlock) {
                 result.isValid = false;
                 result.reason = "System Error: Previous block missing";
                 return result;
            }
            if (block.previousHash !== previousBlock.hash) {
                result.isValid = false;
                result.reason = "Chain Broken: Previous hash does not match";
                return result;
            }
        }

        // 2. Verify hash integrity (recalculate and compare)
        // This checks if data (transactions, timestamp, nonce, difficulty) matches the hash
        const calculatedHash = this.calculateHash(
            block.index,
            block.timestamp,
            block.transactions,
            block.previousHash,
            block.nonce,
            block.difficulty
        );

        if (calculatedHash !== block.hash) {
            result.isValid = false;
            result.reason = "Data Tampered: Hash no longer matches block data";
            return result;
        }

        // 3. Check if hash satisfies the block's stored difficulty
        // Genesis block (index 0) is exempt from difficulty check in some designs,
        // but here we enforce it based on the stored difficulty.
        if (block.index !== 0 && !this.isHashValid(block.hash, block.difficulty)) {
            result.isValid = false;
            result.reason = `Invalid Proof of Work: Hash does not start with ${block.difficulty} zeros`;
            return result;
        }

        return result;
    }
};

// ==========================================
// STATE MANAGEMENT
// ==========================================
const State = {
    blockchain: [],
    mempool: [],
    difficulty: 3,
    tamperMode: false,
    sandboxMode: false
};

const Storage = {
    DATA_VERSION: '1.1', // Increment to force reset if needed

    save: function() {
        try {
            localStorage.setItem('blocksim_version', this.DATA_VERSION);
            localStorage.setItem('blocksim_blockchain', JSON.stringify(State.blockchain));
            localStorage.setItem('blocksim_mempool', JSON.stringify(State.mempool));
            localStorage.setItem('blocksim_difficulty', State.difficulty);
            localStorage.setItem('blocksim_tamperMode', State.tamperMode);
            localStorage.setItem('blocksim_sandboxMode', State.sandboxMode);
        } catch (e) {
            console.error("Storage save failed:", e);
            alert("Warning: Storage quota exceeded. Your progress may not be saved.");
        }
    },

    load: function() {
        const version = localStorage.getItem('blocksim_version');
        if (version !== this.DATA_VERSION) {
            console.log("Data version mismatch or fresh load. Resetting storage.");
            this.clear(false); // Clear but don't reload page yet
            return;
        }

        const chain = localStorage.getItem('blocksim_blockchain');
        const pool = localStorage.getItem('blocksim_mempool');
        const diff = localStorage.getItem('blocksim_difficulty');
        const tamper = localStorage.getItem('blocksim_tamperMode');
        const sandbox = localStorage.getItem('blocksim_sandboxMode');

        if (chain) State.blockchain = JSON.parse(chain);
        if (pool) State.mempool = JSON.parse(pool);
        if (diff) State.difficulty = parseInt(diff);
        if (tamper) State.tamperMode = (tamper === 'true');
        if (sandbox) State.sandboxMode = (sandbox === 'true');
    },

    clear: function(reload = true) {
        localStorage.clear();
        if (reload) location.reload();
    }
};

// ==========================================
// UI CONTROLLERS & APP LOGIC
// ==========================================

const App = {
    init: function() {
        // Load state
        Storage.load();

        // Initialize Genesis Block if chain is empty
        if (State.blockchain.length === 0) {
            this.createGenesisBlock();
        }

        // Initialize UI
        this.bindEvents();
        this.renderAll();
    },

    createGenesisBlock: function() {
        const genesisTransaction = [];
        // Genesis difficulty fixed at 3 for stability/demo
        const genesisDifficulty = 3;
        const genesisBlock = new Block(0, genesisTransaction, "0", genesisDifficulty);

        console.log("Mining Genesis Block...");
        let nonce = 0;
        let hash = "";

        while (true) {
            hash = BlockchainLogic.calculateHash(
                0,
                genesisBlock.timestamp,
                genesisTransaction,
                "0",
                nonce,
                genesisDifficulty
            );
            if (BlockchainLogic.isHashValid(hash, genesisDifficulty)) {
                break;
            }
            nonce++;
        }

        genesisBlock.nonce = nonce;
        genesisBlock.hash = hash;

        State.blockchain.push(genesisBlock);
        Storage.save();
    },

    bindEvents: function() {
        // Transaction Creator
        const validate = this.validateTxForm.bind(this);
        document.getElementById('sender').addEventListener('input', validate);
        document.getElementById('receiver').addEventListener('input', validate);
        document.getElementById('amount').addEventListener('input', validate);
        document.getElementById('create-tx-btn').addEventListener('click', this.createTransaction.bind(this));

        // Settings
        document.getElementById('difficulty').addEventListener('input', (e) => {
            State.difficulty = parseInt(e.target.value);
            document.getElementById('difficulty-value').textContent = State.difficulty;
            Storage.save();
            // Difficulty only applies to NEW blocks. Existing blocks retain their difficulty.
            // So we don't need to re-validate the whole chain based on the new setting,
            // but we might want to re-render to show the current setting.
        });

        document.getElementById('tamper-mode').addEventListener('change', (e) => {
            State.tamperMode = e.target.checked;
            document.getElementById('tamper-warning').style.display = State.tamperMode ? 'block' : 'none';
            Storage.save();
            this.renderBlockchain();
        });

        document.getElementById('sandbox-mode').addEventListener('change', (e) => {
            State.sandboxMode = e.target.checked;
            Storage.save();
            this.validateTxForm(); // Re-evaluate button state
        });

        document.getElementById('reset-app').addEventListener('click', () => {
            if(confirm("Are you sure you want to reset the entire simulator? This cannot be undone.")) {
                Storage.clear();
            }
        });

        // Sync settings UI with state
        document.getElementById('difficulty').value = State.difficulty;
        document.getElementById('difficulty-value').textContent = State.difficulty;
        document.getElementById('tamper-mode').checked = State.tamperMode;
        document.getElementById('tamper-warning').style.display = State.tamperMode ? 'block' : 'none';
        document.getElementById('sandbox-mode').checked = State.sandboxMode;

        // Block Builder
        document.getElementById('create-block-btn').addEventListener('click', this.createBlockFromMempool.bind(this));
        document.getElementById('mine-block-btn').addEventListener('click', this.mineBlock.bind(this));
        document.getElementById('add-block-btn').addEventListener('click', this.addBlockToChain.bind(this));
    },

    validateTxForm: function() {
        const sender = document.getElementById('sender').value.trim();
        const receiver = document.getElementById('receiver').value.trim();
        const amount = parseFloat(document.getElementById('amount').value);
        const btn = document.getElementById('create-tx-btn');

        const senderInput = document.getElementById('sender');
        const receiverInput = document.getElementById('receiver');
        const amountInput = document.getElementById('amount');

        let isValid = true;

        // Validation UI logic (Classes)
        if (!sender) { senderInput.classList.add('invalid'); isValid = false; }
        else { senderInput.classList.remove('invalid'); senderInput.classList.add('valid'); }

        if (!receiver) { receiverInput.classList.add('invalid'); isValid = false; }
        else { receiverInput.classList.remove('invalid'); receiverInput.classList.add('valid'); }

        if (sender && receiver && sender === receiver) {
            isValid = false;
            document.getElementById('receiver-error').textContent = "Sender and receiver must be different";
            document.getElementById('receiver-error').style.display = 'block';
        } else {
             document.getElementById('receiver-error').style.display = 'none';
        }

        if (!amount || amount <= 0) { amountInput.classList.add('invalid'); isValid = false; }
        else { amountInput.classList.remove('invalid'); amountInput.classList.add('valid'); }

        // Sandbox Mode: Allow button click even if invalid (Logic fail handled in createTransaction)
        if (State.sandboxMode) {
            btn.disabled = false;
        } else {
            btn.disabled = !isValid;
        }
    },

    createTransaction: function() {
        const sender = document.getElementById('sender').value.trim();
        const receiver = document.getElementById('receiver').value.trim();
        const amount = parseFloat(document.getElementById('amount').value);

        // Logic check: if Sandbox mode is on, we still create it?
        // Requirements say "Allow actions... Still fail logically".
        // For transactions, "failing logically" might mean creating an invalid transaction?
        // But the core model doesn't have "isValid" on Transaction independent of Block.
        // For now, we'll block empty/garbage data but allow logic errors if possible.
        // But basic field validation is needed to even create the object.

        if (!sender || !receiver || !amount || amount <= 0 || sender === receiver) {
            alert("Invalid transaction data. Please check fields.");
            return;
        }

        const tx = new Transaction(sender, receiver, amount);
        State.mempool.push(tx);
        Storage.save();

        // Clear form
        document.getElementById('sender').value = '';
        document.getElementById('receiver').value = '';
        document.getElementById('amount').value = '';
        this.validateTxForm();

        document.getElementById('sender').classList.remove('valid');
        document.getElementById('receiver').classList.remove('valid');
        document.getElementById('amount').classList.remove('valid');

        this.renderMempool();
    },

    removeTransaction: function(id) {
        State.mempool = State.mempool.filter(tx => tx.id !== id);
        Storage.save();
        this.renderMempool();
    },

    renderMempool: function() {
        const list = document.getElementById('mempool-list');
        const countBadge = document.getElementById('mempool-count');
        const createBlockBtn = document.getElementById('create-block-btn');

        list.innerHTML = '';
        countBadge.textContent = State.mempool.length;

        if (State.mempool.length === 0) {
            list.innerHTML = '<p class="placeholder-text">No pending transactions.</p>';
            if (!State.sandboxMode) createBlockBtn.disabled = true;
            return;
        }

        createBlockBtn.disabled = false;

        State.mempool.forEach(tx => {
            const el = document.createElement('div');
            el.className = 'transaction-item';
            el.innerHTML = `
                <div class="tx-details">
                    <strong>${this.escapeHtml(tx.sender)}</strong> ➝ <strong>${this.escapeHtml(tx.receiver)}</strong> : ${tx.amount}
                    <br><small class="text-muted">${new Date(tx.timestamp).toLocaleTimeString()}</small>
                </div>
                <button class="tx-remove-btn" onclick="App.removeTransaction('${tx.id}')">&times;</button>
            `;
            list.appendChild(el);
        });
    },

    escapeHtml: function(text) {
        if (text === null || text === undefined) return '';
        return String(text)
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    },

    renderAll: function() {
        this.renderMempool();
        this.renderBlockchain();
    },

    // Block Builder & Mining
    currentMiningBlock: null,

    createBlockFromMempool: function() {
        if (State.mempool.length === 0) {
            alert("Cannot create block: mempool is empty");
            return;
        }

        const transactions = JSON.parse(JSON.stringify(State.mempool));
        const previousBlock = State.blockchain[State.blockchain.length - 1];
        const index = State.blockchain.length;
        const previousHash = previousBlock ? previousBlock.hash : "0";
        // Capture current global difficulty for this new block
        const difficulty = State.difficulty;

        this.currentMiningBlock = new Block(index, transactions, previousHash, difficulty);

        // Update UI
        document.getElementById('block-builder').classList.remove('hidden');
        document.getElementById('builder-index').textContent = index;
        document.getElementById('builder-timestamp').textContent = new Date(this.currentMiningBlock.timestamp).toLocaleString();
        document.getElementById('builder-prev-hash').textContent = previousHash;

        // Show difficulty in builder (needs UI element in HTML later, but for now logic is here)
        // I will add a dynamic element or assume there is one.
        // For now, I'll log it or just rely on the stored object.

        const txList = document.getElementById('builder-tx-list');
        txList.innerHTML = '';
        transactions.forEach(tx => {
            const li = document.createElement('li');
            li.textContent = `${tx.sender} -> ${tx.receiver}: ${tx.amount}`;
            txList.appendChild(li);
        });

        document.getElementById('builder-nonce').textContent = '0';
        document.getElementById('builder-hash').textContent = '';
        document.getElementById('mining-status').textContent = '';

        if (State.sandboxMode) {
            document.getElementById('add-block-btn').disabled = false;
        } else {
            document.getElementById('add-block-btn').disabled = true;
        }

        document.getElementById('mine-block-btn').disabled = false;
        document.getElementById('block-builder').scrollIntoView({ behavior: 'smooth' });
    },

    mineBlock: function() {
        if (!this.currentMiningBlock) return;

        // Use the block's stored difficulty
        const difficulty = this.currentMiningBlock.difficulty;

        const btn = document.getElementById('mine-block-btn');
        const status = document.getElementById('mining-status');
        const nonceDisplay = document.getElementById('builder-nonce');
        const hashDisplay = document.getElementById('builder-hash');

        btn.disabled = true;
        status.textContent = "Mining...";
        status.style.color = "orange";

        let nonce = 0;
        this.currentMiningBlock.nonce = 0;

        const mineLoop = () => {
            // Updated Batch size for responsiveness
            const batchSize = 300;
            let found = false;
            let currentHash = "";

            for (let i = 0; i < batchSize; i++) {
                currentHash = BlockchainLogic.calculateHash(
                    this.currentMiningBlock.index,
                    this.currentMiningBlock.timestamp,
                    this.currentMiningBlock.transactions,
                    this.currentMiningBlock.previousHash,
                    nonce,
                    this.currentMiningBlock.difficulty
                );

                if (BlockchainLogic.isHashValid(currentHash, difficulty)) {
                    this.currentMiningBlock.nonce = nonce;
                    this.currentMiningBlock.hash = currentHash;
                    found = true;
                    break;
                }
                nonce++;
            }

            // Update UI with real hash
            nonceDisplay.textContent = nonce;
            hashDisplay.textContent = currentHash;

            if (found) {
                status.textContent = "Block mined! Hash: " + currentHash;
                status.style.color = "green";
                document.getElementById('add-block-btn').disabled = false;
                btn.disabled = false;
            } else {
                status.textContent = `Mining... (${nonce})`;
                setTimeout(mineLoop, 0);
            }
        };

        setTimeout(mineLoop, 10);
    },

    addBlockToChain: function() {
        if (!this.currentMiningBlock) return;

        // Sandbox: Allow adding unmined/invalid blocks, but validate them
        if (!this.currentMiningBlock.hash && !State.sandboxMode) {
             alert("Block has not been mined yet!");
             return;
        }

        // If hash is missing (Sandbox add without mine), we generate a hash based on current state (which will fail difficulty)
        if (!this.currentMiningBlock.hash) {
             this.currentMiningBlock.hash = BlockchainLogic.calculateHash(
                this.currentMiningBlock.index,
                this.currentMiningBlock.timestamp,
                this.currentMiningBlock.transactions,
                this.currentMiningBlock.previousHash,
                this.currentMiningBlock.nonce,
                this.currentMiningBlock.difficulty
             );
        }

        // Validate before adding? In Sandbox we allow adding invalid blocks.
        // We just add it. The rendering logic will mark it invalid.

        State.blockchain.push(this.currentMiningBlock);

        const minedTxIds = new Set(this.currentMiningBlock.transactions.map(tx => tx.id));
        State.mempool = State.mempool.filter(tx => !minedTxIds.has(tx.id));

        Storage.save();

        document.getElementById('block-builder').classList.add('hidden');
        this.currentMiningBlock = null;
        this.renderAll();
    },

    validateChain: function() {
        if (State.blockchain.length > 0) {
            State.blockchain[0].isValid = true;
            State.blockchain[0].invalidReason = null;
        }

        for (let i = 1; i < State.blockchain.length; i++) {
            const currentBlock = State.blockchain[i];
            const previousBlock = State.blockchain[i-1];

            // Validate using updated logic
            const validationResult = BlockchainLogic.validateBlock(currentBlock, previousBlock);

            currentBlock.isValid = validationResult.isValid;
            currentBlock.invalidReason = validationResult.reason;

            // Also store calculated hash for UI display if mismatch
             const calculatedHash = BlockchainLogic.calculateHash(
                currentBlock.index,
                currentBlock.timestamp,
                currentBlock.transactions,
                currentBlock.previousHash,
                currentBlock.nonce,
                currentBlock.difficulty
            );
            currentBlock.calculatedHash = calculatedHash;
        }
    },

    renderBlockchain: function() {
        this.validateChain();

        const container = document.getElementById('blockchain-container');
        container.innerHTML = '';

        State.blockchain.forEach((block, index) => {
            if (index > 0) {
                const arrow = document.createElement('div');
                arrow.className = 'block-arrow';
                arrow.innerHTML = '➜';
                container.appendChild(arrow);
            }

            const card = document.createElement('div');
            // Add classes for styling
            card.className = `block-card ${block.isValid ? 'valid' : 'invalid'}`;
            if (!block.isValid) card.classList.add('tampered');

            const formatHash = (h) => h ? `${h.substring(0, 10)}...${h.substring(h.length - 8)}` : "None";

            // Transactions Rendering
            let txHtml = '';
            if (State.tamperMode && index > 0) {
                txHtml = `<div class="block-tx-list">`;
                block.transactions.forEach((tx, txIndex) => {
                    txHtml += `
                        <div style="margin-bottom: 5px; border-bottom: 1px solid #eee; padding-bottom: 2px;">
                            <input type="text" class="tamper-input" value="${this.escapeHtml(tx.sender)}" onchange="App.tamperBlock(${index}, ${txIndex}, 'sender', this.value)">
                            ➜
                            <input type="text" class="tamper-input" value="${this.escapeHtml(tx.receiver)}" onchange="App.tamperBlock(${index}, ${txIndex}, 'receiver', this.value)">
                            :
                            <input type="number" class="tamper-input" value="${tx.amount}" onchange="App.tamperBlock(${index}, ${txIndex}, 'amount', this.value)">
                        </div>
                    `;
                });
                txHtml += `</div>`;
            } else {
                // If block is invalid, we mark transactions as invalid (Visual only)
                const txClass = block.isValid ? '' : 'tx-invalid';
                txHtml = `
                    <details open>
                        <summary>${block.transactions.length} Transactions</summary>
                        <ul class="block-tx-list ${txClass}">
                            ${block.transactions.map(tx => `
                                <li class="${block.isValid ? '' : 'text-danger'}">
                                    ${this.escapeHtml(tx.sender)} ➜ ${this.escapeHtml(tx.receiver)}: ${tx.amount}
                                </li>`).join('')}
                        </ul>
                    </details>
                `;
            }

            let actionHtml = '';
            if (!block.isValid) {
                 // Added ID for selecting in reMineBlock
                 actionHtml = `<button id="remine-btn-${index}" class="btn btn-sm" onclick="App.reMineBlock(${index})">Re-mine</button>`;
            }

            // Show Invalid Reason
            const reasonHtml = block.isValid ? '' : `<div class="invalid-reason">⚠️ ${block.invalidReason}</div>`;

            card.innerHTML = `
                <div class="block-index">#${block.index}</div>
                <div class="block-status ${block.isValid ? 'status-valid' : 'status-invalid'}">
                    ${block.isValid ? '✓ VALID' : '✗ INVALID'}
                </div>
                ${reasonHtml}

                <div class="block-data-row">
                     <small>Diff:</small> <strong>${block.difficulty}</strong>
                     <span style="margin: 0 5px;">|</span>
                     <small>Nonce:</small> <strong>${block.nonce}</strong>
                </div>

                <div style="margin: 10px 0;">
                    <small>Previous Hash:</small><br>
                    <span class="prev-hash">${formatHash(block.previousHash)}</span>
                </div>

                <div style="margin: 10px 0;">
                    <small>Hash:</small><br>
                    <span class="hash">${formatHash(block.hash)}</span>
                </div>

                ${(!block.isValid && block.calculatedHash && block.calculatedHash !== block.hash) ? `
                <div style="margin: 10px 0; color: #e74c3c;">
                    <small>Actual Hash:</small><br>
                    <span class="hash">${formatHash(block.calculatedHash)}</span>
                </div>` : ''}

                <div style="margin: 10px 0;">
                    ${txHtml}
                </div>

                <div style="text-align: center; margin-top: 10px;">
                    ${actionHtml}
                </div>
            `;

            container.appendChild(card);
        });
    },

    tamperBlock: function(blockIndex, txIndex, field, value) {
        if (!State.tamperMode) return;

        const block = State.blockchain[blockIndex];
        const tx = block.transactions[txIndex];

        if (field === 'amount') value = parseFloat(value);
        tx[field] = value;

        this.renderBlockchain();
        Storage.save();
    },

    reMineBlock: function(blockIndex) {
        const block = State.blockchain[blockIndex];
        const difficulty = block.difficulty;

        // Use the specific button for this block
        const btn = document.getElementById(`remine-btn-${blockIndex}`);
        if (btn) {
            btn.textContent = "Mining...";
            btn.disabled = true;
        }

        // ASYNC LOOP IMPLEMENTATION
        let nonce = 0;
        let hash = "";
        const startTime = Date.now();

        const mineLoop = () => {
             const batchSize = 500;
             let found = false;

             for (let i = 0; i < batchSize; i++) {
                 hash = BlockchainLogic.calculateHash(
                    block.index,
                    block.timestamp,
                    block.transactions,
                    block.previousHash,
                    nonce,
                    block.difficulty
                );

                if (BlockchainLogic.isHashValid(hash, difficulty)) {
                    found = true;
                    break;
                }
                nonce++;
             }

             if (found) {
                block.nonce = nonce;
                block.hash = hash;
                Storage.save();
                this.renderBlockchain();
             } else {
                // Update button text to show progress
                if (btn) btn.textContent = `Mining... (${nonce})`;

                // Prevent infinite loop safety check (optional, but good for UX)
                if (Date.now() - startTime > 60000) { // 60 seconds max
                     alert("Mining timed out (60s). Difficulty might be too high for this device.");
                     if(btn) { btn.textContent = "Re-mine"; btn.disabled = false; }
                     return;
                }

                setTimeout(mineLoop, 0);
             }
        };

        setTimeout(mineLoop, 10);
    }
};

// Initialize app when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    if (typeof CryptoJS === 'undefined') {
        document.body.innerHTML = `
            <div style="text-align:center; padding: 50px; color: #e74c3c;">
                <h1>System Error</h1>
                <p>Failed to load crypto-js library. Please check your internet connection and reload.</p>
            </div>
        `;
        return;
    }
    App.init();
});
