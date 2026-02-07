import { Block } from './Block.js';
import { Transaction } from './Transaction.js';
import { Consensus } from './Consensus.js';

export class Blockchain {
    constructor(difficulty = 3) {
        this.chain = [];
        this.mempool = [];
        this.difficulty = difficulty;
        this.consensusType = 'POW'; // Default
        this.createGenesisBlock();
    }

    createGenesisBlock() {
        const genesisTx = [];
        // Genesis block uses PoW difficulty 3 by default for stability
        const genesisBlock = new Block(0, genesisTx, "0", 3, null);

        // Mine Genesis
        let nonce = 0;
        let hash = "";
        while(true) {
             hash = Consensus.calculateHash(
                0,
                genesisBlock.timestamp,
                genesisTx,
                "0",
                nonce,
                3,
                null
            );
            if(Consensus.isHashValid(hash, 3)) break;
            nonce++;
        }

        genesisBlock.nonce = nonce;
        genesisBlock.hash = hash;
        this.chain.push(genesisBlock);
    }

    getLatestBlock() {
        return this.chain[this.chain.length - 1];
    }

    addTransaction(sender, receiver, amount) {
        const tx = new Transaction(sender, receiver, amount);
        this.mempool.push(tx);
        return tx;
    }

    removeTransaction(id) {
        this.mempool = this.mempool.filter(tx => tx.id !== id);
    }

    // Add a mined block to the chain
    addBlock(block) {
        // Basic check: Prev hash must match
        const latest = this.getLatestBlock();
        if (latest && latest.hash !== block.previousHash) {
            // In Sandbox mode we might allow this, but the class should signal invalidity
            block.isValid = false;
            block.invalidReason = "Previous hash mismatch";
        }

        this.chain.push(block);

        // Remove mined transactions from mempool
        const minedIds = new Set(block.transactions.map(tx => tx.id));
        this.mempool = this.mempool.filter(tx => !minedIds.has(tx.id));
    }

    // Tamper Methods
    tamperBlockTransaction(blockIndex, txIndex, field, value) {
        if (blockIndex >= this.chain.length) return;
        const block = this.chain[blockIndex];
        if (txIndex >= block.transactions.length) return;

        const tx = block.transactions[txIndex];
        if (field === 'amount') value = parseFloat(value);
        tx[field] = value;

        // After tampering, we must re-validate the chain to show it's broken
        this.validateChain();
    }

    tamperPreviousHash(blockIndex, newPrevHash) {
        if (blockIndex >= this.chain.length) return;
        this.chain[blockIndex].previousHash = newPrevHash;
        this.validateChain();
    }

    validateChain() {
        // Validate Genesis
        if(this.chain.length > 0) {
            this.chain[0].isValid = true;
            this.chain[0].invalidReason = null;
        }

        for (let i = 1; i < this.chain.length; i++) {
            const current = this.chain[i];
            const previous = this.chain[i-1];

            const result = this.validateBlock(current, previous);
            current.isValid = result.isValid;
            current.invalidReason = result.reason;
            current.calculatedHash = result.calculatedHash;
        }
    }

    validateBlock(block, previousBlock) {
        const result = { isValid: true, reason: null, calculatedHash: "" };

        if (!previousBlock) {
            result.isValid = false;
            result.reason = "Previous block missing";
            return result;
        }

        if (block.previousHash !== previousBlock.hash) {
            result.isValid = false;
            result.reason = "Broken Link: Previous hash mismatch";
            return result;
        }

        const calculatedHash = Consensus.calculateHash(
            block.index,
            block.timestamp,
            block.transactions,
            block.previousHash,
            block.nonce,
            block.difficulty,
            block.validator
        );

        result.calculatedHash = calculatedHash;

        if (calculatedHash !== block.hash) {
            result.isValid = false;
            result.reason = "Data Tampered: Hash mismatch";
            return result;
        }

        // Check Difficulty (PoW)
        // If block has a validator, it's PoS, so we skip PoW difficulty check?
        // Or if block difficulty is set?
        // Let's assume block.validator implies PoS validation was used instead of PoW.
        if (!block.validator && !Consensus.isHashValid(block.hash, block.difficulty)) {
             result.isValid = false;
             result.reason = `Invalid PoW: Hash doesn't start with ${block.difficulty} zeros`;
             return result;
        }

        return result;
    }
}
