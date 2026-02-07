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
        this.status = "valid"; // "valid" | "invalid"
    }
}

class Block {
    constructor(index, transactions, previousHash = "0") {
        this.index = index;
        this.timestamp = new Date().toISOString();
        this.transactions = transactions;
        this.previousHash = previousHash;
        this.nonce = 0;
        this.hash = ""; // Empty until mined
    }
}

const BlockchainLogic = {
    calculateHash: function(index, timestamp, transactions, previousHash, nonce) {
        // blockData = index + timestamp + JSON.stringify(transactions) + previousHash + nonce
        const blockData = index + timestamp + JSON.stringify(transactions) + previousHash + nonce;
        return CryptoJS.SHA256(blockData).toString();
    },

    // Check if hash meets difficulty requirement
    isHashValid: function(hash, difficulty) {
        const prefix = "0".repeat(difficulty);
        return hash.startsWith(prefix);
    },

    // Validate a single block against its predecessor and difficulty
    validateBlock: function(block, previousBlock, difficulty) {
        // 1. Check if hash satisfies difficulty
        // Genesis block (index 0) is exempt from difficulty check
        if (block.index !== 0 && !this.isHashValid(block.hash, difficulty)) {
            return false;
        }

        // 2. Check if previousHash matches previous block's hash
        // For genesis block (index 0), previousHash should be "0"
        if (block.index === 0) {
            if (block.previousHash !== "0") return false;
        } else {
            if (block.previousHash !== previousBlock.hash) return false;
        }

        // 3. Verify hash integrity (recalculate and compare)
        const calculatedHash = this.calculateHash(
            block.index,
            block.timestamp,
            block.transactions,
            block.previousHash,
            block.nonce
        );

        if (calculatedHash !== block.hash) {
            return false;
        }

        return true;
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
    save: function() {
        try {
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

    clear: function() {
        localStorage.clear();
        location.reload();
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
        const genesisTransaction = []; // No transactions in genesis usually, or a special one
        const genesisBlock = new Block(0, genesisTransaction, "0");

        // Pre-mine genesis block (difficulty 3 as per PRD)
        // Note: Genesis block hash is exempt from difficulty changes in future validation if we want,
        // but PRD says "Pre-mined hash (satisfies difficulty 3)"
        let nonce = 0;
        let hash = "";
        // We use a fixed difficulty of 3 for genesis as per PRD
        const genesisDifficulty = 3;

        console.log("Mining Genesis Block...");
        while (true) {
            hash = BlockchainLogic.calculateHash(0, genesisBlock.timestamp, genesisTransaction, "0", nonce);
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
        // Note: We bind 'this' correctly
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
            // Re-validate chain on difficulty change (to show/hide red blocks)
            this.renderBlockchain();
        });

        document.getElementById('tamper-mode').addEventListener('change', (e) => {
            State.tamperMode = e.target.checked;
            document.getElementById('tamper-warning').style.display = State.tamperMode ? 'block' : 'none';
            Storage.save();
            this.renderBlockchain(); // Re-render to show/hide edit inputs
        });

        document.getElementById('sandbox-mode').addEventListener('change', (e) => {
            State.sandboxMode = e.target.checked;
            Storage.save();
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

        // Simple validation visualization
        const senderInput = document.getElementById('sender');
        const receiverInput = document.getElementById('receiver');
        const amountInput = document.getElementById('amount');

        let isValid = true;

        if (!sender) {
            senderInput.classList.add('invalid');
            isValid = false;
        } else {
            senderInput.classList.remove('invalid');
            senderInput.classList.add('valid');
        }

        if (!receiver) {
            receiverInput.classList.add('invalid');
            isValid = false;
        } else {
            receiverInput.classList.remove('invalid');
            receiverInput.classList.add('valid');
        }

        if (sender && receiver && sender === receiver) {
            isValid = false;
            // Show error message
            document.getElementById('receiver-error').textContent = "Sender and receiver must be different";
            document.getElementById('receiver-error').style.display = 'block';
        } else {
             document.getElementById('receiver-error').style.display = 'none';
        }

        if (!amount || amount <= 0) {
            amountInput.classList.add('invalid');
            isValid = false;
        } else {
            amountInput.classList.remove('invalid');
            amountInput.classList.add('valid');
        }

        // In Sandbox Mode, button is always enabled (UI enforcement removed)
        // But validation logic inside createTransaction will still apply or we show error there
        // Actually, PRD says "Create Transaction" button disabled until valid in Core Requirements.
        // "Sandbox Mode Rules: Removes step-by-step UI enforcement ONLY".
        // So we enable it, but if clicked, we should probably validate again and show error if invalid.

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

        // Validation Check (required even in Sandbox if we want to produce valid transactions)
        // Or strictly follow "Core blockchain rules MUST still apply".
        // "Validation Rules: All fields required... Amount > 0... Sender != Receiver".
        if (!sender || !receiver || !amount || amount <= 0 || sender === receiver) {
            if (State.sandboxMode) {
                alert("Invalid transaction data! Core rules still apply.");
            }
            return;
        }

        const tx = new Transaction(sender, receiver, amount);
        State.mempool.push(tx);
        Storage.save();

        // Clear form
        document.getElementById('sender').value = '';
        document.getElementById('receiver').value = '';
        document.getElementById('amount').value = '';
        this.validateTxForm(); // Reset validation styles

        // Remove valid classes manually
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

        // Deep copy transactions to ensure block data is independent
        const transactions = JSON.parse(JSON.stringify(State.mempool));
        const previousBlock = State.blockchain[State.blockchain.length - 1];
        const index = State.blockchain.length;
        const previousHash = previousBlock ? previousBlock.hash : "0";

        this.currentMiningBlock = new Block(index, transactions, previousHash);

        // Update UI
        document.getElementById('block-builder').classList.remove('hidden');
        document.getElementById('builder-index').textContent = index;
        document.getElementById('builder-timestamp').textContent = new Date(this.currentMiningBlock.timestamp).toLocaleString();
        document.getElementById('builder-prev-hash').textContent = previousHash;

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

        // Scroll to block builder
        document.getElementById('block-builder').scrollIntoView({ behavior: 'smooth' });
    },

    mineBlock: function() {
        if (!this.currentMiningBlock) return;

        const difficulty = State.difficulty;
        const btn = document.getElementById('mine-block-btn');
        const status = document.getElementById('mining-status');
        const nonceDisplay = document.getElementById('builder-nonce');
        const hashDisplay = document.getElementById('builder-hash');

        btn.disabled = true;
        status.textContent = "Mining... trying nonce: 0";
        status.style.color = "orange"; // Or use a class

        let nonce = 0; // Start from 0
        this.currentMiningBlock.nonce = 0;

        const mineLoop = () => {
            // Run a batch of iterations to keep UI responsive
            const batchSize = 1000;
            let found = false;
            let currentHash = "";

            for (let i = 0; i < batchSize; i++) {
                currentHash = BlockchainLogic.calculateHash(
                    this.currentMiningBlock.index,
                    this.currentMiningBlock.timestamp,
                    this.currentMiningBlock.transactions,
                    this.currentMiningBlock.previousHash,
                    nonce
                );

                if (BlockchainLogic.isHashValid(currentHash, difficulty)) {
                    this.currentMiningBlock.nonce = nonce;
                    this.currentMiningBlock.hash = currentHash;
                    found = true;
                    break;
                }
                nonce++;
            }

            // Update UI
            nonceDisplay.textContent = nonce;
            hashDisplay.textContent = found ? currentHash : "";

            if (found) {
                status.textContent = "Block mined! Hash: " + currentHash;
                status.style.color = "green";
                document.getElementById('add-block-btn').disabled = false;
                btn.disabled = false;
            } else {
                status.textContent = "Mining... trying nonce: " + nonce;
                // Continue next batch
                setTimeout(mineLoop, 0);
            }
        };

        setTimeout(mineLoop, 10);
    },

    addBlockToChain: function() {
        if (!this.currentMiningBlock) return;

        // In Sandbox mode, user might click Add before mining.
        // Logic check:
        if (!this.currentMiningBlock.hash) {
             alert("Block has not been mined yet! Core rules apply.");
             return;
        }

        // Validation
        const previousBlock = State.blockchain[State.blockchain.length - 1];
        if (!BlockchainLogic.validateBlock(this.currentMiningBlock, previousBlock, State.difficulty)) {
            // If validation fails (e.g. difficulty changed mid-mining? shouldn't happen but good to check)
            // Or simple sanity check
            alert("Block validation failed. Please re-mine.");
            return;
        }

        // Add to chain
        State.blockchain.push(this.currentMiningBlock);

        // Clear mined transactions from mempool
        // We filter out transactions that were in the block (by ID)
        const minedTxIds = new Set(this.currentMiningBlock.transactions.map(tx => tx.id));
        State.mempool = State.mempool.filter(tx => !minedTxIds.has(tx.id));

        // Save
        Storage.save();

        // Reset UI
        document.getElementById('block-builder').classList.add('hidden');
        this.currentMiningBlock = null;
        this.renderAll();

        // Scroll to bottom of blockchain
        // setTimeout(() => document.getElementById('blockchain-section').scrollIntoView({ behavior: 'smooth' }), 100);
    },

    validateChain: function() {
        // Genesis block always valid logic
        if (State.blockchain.length > 0) {
            State.blockchain[0].isValid = true;
        }

        for (let i = 1; i < State.blockchain.length; i++) {
            const currentBlock = State.blockchain[i];
            const previousBlock = State.blockchain[i-1];

            // Check if previous block is valid (Cascade effect)
            if (!previousBlock.isValid) {
                currentBlock.isValid = false;
                continue;
            }

            // 1. Verify hash satisfies difficulty (Current Global Difficulty)
            // Note: In real blockchains difficulty is stored in block. Here using global setting.
            const isDifficultyValid = BlockchainLogic.isHashValid(currentBlock.hash, State.difficulty);

            // 2. Verify previousHash equals previous block's hash
            const isLinkValid = currentBlock.previousHash === previousBlock.hash;

            // 3. Verify hash integrity
            const calculatedHash = BlockchainLogic.calculateHash(
                currentBlock.index,
                currentBlock.timestamp,
                currentBlock.transactions,
                currentBlock.previousHash,
                currentBlock.nonce
            );
            currentBlock.calculatedHash = calculatedHash; // Store for UI
            const isIntegrityValid = calculatedHash === currentBlock.hash;

            currentBlock.isValid = isDifficultyValid && isLinkValid && isIntegrityValid;
        }
    },

    renderBlockchain: function() {
        this.validateChain();

        const container = document.getElementById('blockchain-container');
        container.innerHTML = '';

        State.blockchain.forEach((block, index) => {
            // Add arrow if not genesis
            if (index > 0) {
                const arrow = document.createElement('div');
                arrow.className = 'block-arrow';
                arrow.innerHTML = '➜';
                container.appendChild(arrow);
            }

            const card = document.createElement('div');
            card.className = `block-card ${block.isValid ? 'valid' : 'invalid'}`;
            if (!block.isValid && block.isValid === false) card.classList.add('tampered'); // Visual helper

            // Truncate hashes
            const formatHash = (h) => h ? `${h.substring(0, 10)}...${h.substring(h.length - 8)}` : "";

            let txHtml = '';
            if (State.tamperMode && index > 0) {
                // Editable transactions
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
                // Read-only transactions
                txHtml = `
                    <details>
                        <summary>${block.transactions.length} Transactions</summary>
                        <ul class="block-tx-list">
                            ${block.transactions.map(tx => `<li>${this.escapeHtml(tx.sender)} ➜ ${this.escapeHtml(tx.receiver)}: ${tx.amount}</li>`).join('')}
                        </ul>
                    </details>
                `;
            }

            // Re-mine button for invalid blocks (if tamper mode or just invalid)
            // PRD 3.8: "User clicks 'Re-mine Block' on tampered block"
            let actionHtml = '';
            if (!block.isValid) {
                 actionHtml = `<button class="btn btn-sm" onclick="App.reMineBlock(${index})">Re-mine</button>`;
            }

            card.innerHTML = `
                <div class="block-index">#${block.index}</div>
                <div class="block-status ${block.isValid ? 'status-valid' : 'status-invalid'}">
                    ${block.isValid ? '✓ VALID' : '✗ INVALID'}
                </div>
                <p><strong>Nonce:</strong> ${block.nonce}</p>

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
                    <small>Recalculated Hash:</small><br>
                    <span class="hash">${formatHash(block.calculatedHash)}</span>
                </div>` : ''}

                <div style="margin: 10px 0;">
                    ${txHtml}
                </div>

                <div style="text-align: center; margin-top: 10px;">
                    ${actionHtml}
                </div>

                <div style="margin-top: 5px; font-size: 0.8em; color: #666;">
                    ${new Date(block.timestamp).toLocaleTimeString()}
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

        // When tampered, the stored hash remains the same (mismatching data),
        // but we should probably NOT automatically update the hash property of the block
        // because that would effectively be auto-mining (if we just set hash = calcHash, it wouldn't meet difficulty).
        // PRD 3.7: "Stored block.hash MUST NOT change automatically".

        // However, we can immediately validate to show it's invalid
        this.renderBlockchain();
        Storage.save();
    },

    reMineBlock: function(blockIndex) {
        const block = State.blockchain[blockIndex];
        const difficulty = State.difficulty;

        // Visual feedback
        const btn = document.activeElement; // The button clicked
        if (btn) {
            btn.textContent = "Mining...";
            btn.disabled = true;
        }

        // Async mining to avoid freeze
        setTimeout(() => {
            let nonce = 0;
            let hash = "";
            while (true) {
                hash = BlockchainLogic.calculateHash(
                    block.index,
                    block.timestamp,
                    block.transactions,
                    block.previousHash,
                    nonce
                );
                if (BlockchainLogic.isHashValid(hash, difficulty)) {
                    break;
                }
                nonce++;
            }

            block.nonce = nonce;
            block.hash = hash;

            Storage.save();
            this.renderBlockchain();
        }, 100);
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
