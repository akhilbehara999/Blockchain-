import { Blockchain } from './core/Blockchain.js';
import { Block } from './core/Block.js';
import { Transaction } from './core/Transaction.js';
import { Consensus, Validators } from './core/Consensus.js';
import { Renderer } from './ui/Renderer.js';
import { ThemeManager } from './ui/ThemeManager.js';
import { GuidedMode } from './modes/GuidedMode.js';
import { AttackMode } from './modes/AttackMode.js';

class App {
    constructor() {
        this.themeManager = new ThemeManager();
        this.blockchain = new Blockchain();
        this.guidedMode = new GuidedMode(this);
        this.attackMode = new AttackMode(this);
        this.renderer = new Renderer(this.blockchain, this);
        this.state = {
            tamperMode: false,
            sandboxMode: false,
            mining: false
        };

        // Initialize UI
        this.renderer.renderAll();
        this.bindEvents();
    }

    bindEvents() {
        // Start Guide
        const startGuideBtn = document.getElementById('start-guide-btn');
        if (startGuideBtn) {
            startGuideBtn.addEventListener('click', () => this.guidedMode.start());
        }

        // Transaction Form
        const txInputs = ['sender', 'receiver', 'amount'];
        txInputs.forEach(id => {
            const el = document.getElementById(id);
            if(el) el.addEventListener('input', () => this.validateTxForm());
        });
        document.getElementById('create-tx-btn').addEventListener('click', () => this.createTransaction());

        // Settings
        const tamperCheck = document.getElementById('tamper-mode');
        if (tamperCheck) {
            tamperCheck.addEventListener('change', (e) => {
                this.state.tamperMode = e.target.checked;
                const warning = document.getElementById('tamper-warning');
                if(warning) warning.style.display = e.target.checked ? 'block' : 'none';

                const attackLab = document.getElementById('attack-lab');
                if(attackLab) {
                    if (e.target.checked) attackLab.classList.remove('hidden');
                    else attackLab.classList.add('hidden');
                }

                this.renderer.renderBlockchain();
            });
        }

        // Mempool -> Create Block
        const createBlockBtn = document.getElementById('create-block-btn');
        if (createBlockBtn) {
            createBlockBtn.addEventListener('click', () => this.prepareBlockBuilder());
        }

        // Consensus Switch
        const consensusSelect = document.getElementById('consensus-type');
        if (consensusSelect) {
            consensusSelect.addEventListener('change', (e) => {
                this.blockchain.consensusType = e.target.value;
                const diffSetting = document.getElementById('difficulty-setting');
                if(diffSetting) diffSetting.style.display = (e.target.value === 'POW') ? 'flex' : 'none';

                // Update Button Text if Builder is open
                const mineBtn = document.getElementById('mine-block-btn');
                if (mineBtn) {
                    mineBtn.textContent = (e.target.value === 'POW') ? '⛏️ Mine Block' : '🛡️ Validate Block';
                }
            });
        }

        // Mine/Validate Button
        const mineBtn = document.getElementById('mine-block-btn');
        if (mineBtn) {
            mineBtn.addEventListener('click', () => {
                if (this.blockchain.consensusType === 'POS') {
                    this.validateBlockPoS();
                } else {
                    this.mineBlock();
                }
            });
        }

        // Add to Chain Button
        const addBtn = document.getElementById('add-block-btn');
        if (addBtn) {
            addBtn.addEventListener('click', () => this.addBlockToChain());
        }
    }

    validateTxForm() {
        const sender = document.getElementById('sender').value.trim();
        const receiver = document.getElementById('receiver').value.trim();
        const amount = document.getElementById('amount').value;
        const btn = document.getElementById('create-tx-btn');

        if (sender && receiver && amount && parseFloat(amount) > 0) {
            btn.disabled = false;
        } else {
            btn.disabled = true;
        }
    }

    createTransaction() {
        const sender = document.getElementById('sender').value.trim();
        const receiver = document.getElementById('receiver').value.trim();
        const amount = document.getElementById('amount').value;

        if (sender && receiver && amount) {
            const tx = this.blockchain.addTransaction(sender, receiver, amount);
            this.renderer.renderMempool();

            // Clear inputs
            document.getElementById('sender').value = '';
            document.getElementById('receiver').value = '';
            document.getElementById('amount').value = '';
            this.validateTxForm(); // Re-validate (disable button)
        } else {
            alert("Please fill all fields");
        }
    }

    removeTransaction(id) {
        this.blockchain.removeTransaction(id);
        this.renderer.renderMempool();
    }

    prepareBlockBuilder() {
        if (this.blockchain.mempool.length === 0) {
            alert("Mempool is empty");
            return;
        }

        // Logic to show block builder
        document.getElementById('block-builder').classList.remove('hidden');

        // Create a temporary block for mining
        const index = this.blockchain.chain.length;
        const prevBlock = this.blockchain.getLatestBlock();
        const prevHash = prevBlock ? prevBlock.hash : "0";
        const txs = [...this.blockchain.mempool]; // Copy mempool

        this.currentBlock = new Block(index, txs, prevHash, this.blockchain.difficulty);

        // Update Builder UI
        document.getElementById('builder-index').textContent = index;
        document.getElementById('builder-prev-hash').textContent = prevHash;
        const txList = document.getElementById('builder-tx-list');
        txList.innerHTML = '';
        txs.forEach(tx => {
            const li = document.createElement('li');
            li.textContent = `${tx.sender} -> ${tx.receiver}: ${tx.amount}`;
            txList.appendChild(li);
        });

        // Reset status
        document.getElementById('mining-status').textContent = '';
        document.getElementById('add-block-btn').disabled = true;
        const mineBtn = document.getElementById('mine-block-btn');
        mineBtn.disabled = false;

        // Update Button Text based on mode
        mineBtn.textContent = (this.blockchain.consensusType === 'POW') ? '⛏️ Mine Block' : '🛡️ Validate Block';
    }

    validateBlockPoS() {
        if (!this.currentBlock) return;

        const btn = document.getElementById('mine-block-btn');
        const status = document.getElementById('mining-status');
        const hashDisplay = document.getElementById('builder-hash');

        btn.disabled = true;
        status.textContent = "Selecting Validator...";
        status.style.color = "orange";

        // Simulate network delay
        setTimeout(() => {
            const validator = Consensus.selectValidator();
            this.currentBlock.validator = validator;
            this.currentBlock.nonce = 0; // No nonce in PoS

            status.textContent = `Validator Selected: ${validator.name} (Stake: ${validator.stake})`;

            setTimeout(() => {
                const hash = Consensus.calculateHash(
                    this.currentBlock.index,
                    this.currentBlock.timestamp,
                    this.currentBlock.transactions,
                    this.currentBlock.previousHash,
                    this.currentBlock.nonce,
                    this.currentBlock.difficulty,
                    validator
                );

                this.currentBlock.hash = hash;
                hashDisplay.textContent = hash;

                status.textContent = `Block Validated by ${validator.name}!`;
                status.style.color = "green";

                document.getElementById('add-block-btn').disabled = false;
                btn.disabled = false;
            }, 1000); // 1s delay for validation
        }, 1000); // 1s delay for selection
    }

    mineBlock() {
        if (!this.currentBlock) return;

        const btn = document.getElementById('mine-block-btn');
        const status = document.getElementById('mining-status');
        const nonceDisplay = document.getElementById('builder-nonce');
        const hashDisplay = document.getElementById('builder-hash');

        btn.disabled = true;
        status.textContent = "Mining...";
        status.style.color = "orange";

        let nonce = 0;
        const startTime = Date.now();

        const mineLoop = () => {
            const batchSize = 500;
            let found = false;
            let hash = "";

            for(let i=0; i<batchSize; i++) {
                hash = Consensus.calculateHash(
                    this.currentBlock.index,
                    this.currentBlock.timestamp,
                    this.currentBlock.transactions,
                    this.currentBlock.previousHash,
                    nonce,
                    this.currentBlock.difficulty,
                    null // No validator for PoW
                );

                if (Consensus.isHashValid(hash, this.currentBlock.difficulty)) {
                    found = true;
                    break;
                }
                nonce++;
            }

            if (found) {
                this.currentBlock.nonce = nonce;
                this.currentBlock.hash = hash;

                nonceDisplay.textContent = nonce;
                hashDisplay.textContent = hash;
                status.textContent = "Block Mined!";
                status.style.color = "green";

                document.getElementById('add-block-btn').disabled = false;
                btn.disabled = false;
            } else {
                nonceDisplay.textContent = nonce;
                if (Date.now() - startTime > 30000) {
                     status.textContent = "Mining timed out. Try lower difficulty.";
                     btn.disabled = false;
                     return;
                }
                setTimeout(mineLoop, 0);
            }
        };

        setTimeout(mineLoop, 10);
    }

    addBlockToChain() {
        if (!this.currentBlock || !this.currentBlock.hash) return;

        this.blockchain.addBlock(this.currentBlock);

        // Hide builder
        document.getElementById('block-builder').classList.add('hidden');
        this.currentBlock = null;

        this.renderer.renderAll();
    }

    reMineBlock(index) {
        const block = this.blockchain.chain[index];
        const btn = document.getElementById(`remine-btn-${index}`);
        if (btn) {
            btn.textContent = "Mining...";
            btn.disabled = true;
        }

        let nonce = 0;
        const startTime = Date.now();

        const mineLoop = () => {
             const batchSize = 500;
             let found = false;
             let hash = "";

             for (let i = 0; i < batchSize; i++) {
                 hash = Consensus.calculateHash(
                    block.index,
                    block.timestamp,
                    block.transactions,
                    block.previousHash,
                    nonce,
                    block.difficulty,
                    block.validator
                );

                if (Consensus.isHashValid(hash, block.difficulty)) {
                    found = true;
                    break;
                }
                nonce++;
             }

             if (found) {
                block.nonce = nonce;
                block.hash = hash;
                // If PoS, we might need to re-validate differently, but for now we assume PoW re-mining fixes PoW blocks
                // If it was PoS, difficulty check might fail if difficulty is not set correctly?
                // But PoS doesn't use nonce loop. So re-mining a PoS block is just re-signing.

                this.blockchain.validateChain();
                this.renderer.renderBlockchain();
             } else {
                if (btn) btn.textContent = `Mining... ${nonce}`;
                if (Date.now() - startTime > 30000) {
                     alert("Mining timed out.");
                     if(btn) btn.textContent = "Re-mine";
                     return;
                }
                setTimeout(mineLoop, 0);
             }
        };

        if (this.blockchain.consensusType === 'POS' || block.validator) {
            // PoS Re-validation (Just re-calculate hash)
             const hash = Consensus.calculateHash(
                block.index,
                block.timestamp,
                block.transactions,
                block.previousHash,
                0, // Nonce 0
                block.difficulty,
                block.validator
            );
            block.hash = hash;
            this.blockchain.validateChain();
            this.renderer.renderBlockchain();
        } else {
            setTimeout(mineLoop, 10);
        }
    }

    tamperTransaction(blockIndex, txIndex, field, value) {
        this.blockchain.tamperBlockTransaction(blockIndex, txIndex, field, value);
        this.renderer.renderBlockchain();
    }

    tamperPreviousHash(blockIndex, value) {
        this.blockchain.tamperPreviousHash(blockIndex, value);
        this.renderer.renderBlockchain();
    }
}

// Start App
document.addEventListener('DOMContentLoaded', () => {
    window.app = new App();
});
