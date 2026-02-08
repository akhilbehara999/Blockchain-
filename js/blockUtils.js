import { AppState } from './appState.js';
import { saveState } from './storage.js';

// Basic Block class structure
export class Block {
    constructor(index, timestamp, data, previousHash = '') {
        this.index = index;
        this.timestamp = timestamp;
        this.data = data;
        this.previousHash = previousHash;
        this.nonce = 0;
        this.hash = this.calculateHash();
    }

    calculateHash() {
        // Simple hash simulation using SHA256 from crypto-js
        // We ensure consistent string formatting for the hash input
        const dataStr = typeof this.data === 'string' ? this.data : JSON.stringify(this.data);
        const input = this.index + this.previousHash + this.timestamp + dataStr + this.nonce;

        if (typeof CryptoJS !== 'undefined') {
            return CryptoJS.SHA256(input).toString();
        } else {
            console.error("CryptoJS not loaded");
            return "ERROR_HASH";
        }
    }
}

// Recalculates hash for a block object (useful when editing data)
export function recalculateBlockHash(block) {
    const dataStr = typeof block.data === 'string' ? block.data : JSON.stringify(block.data);
    const input = block.index + block.previousHash + block.timestamp + dataStr + block.nonce;

    if (typeof CryptoJS !== 'undefined') {
        return CryptoJS.SHA256(input).toString();
    }
    return "ERROR_HASH";
}

// Chain validation logic
export function isChainValid(blockchain) {
    if (!blockchain || blockchain.length === 0) return true;

    for (let i = 1; i < blockchain.length; i++) {
        const currentBlock = blockchain[i];
        const previousBlock = blockchain[i - 1];

        // 1. Check if current block's hash is valid (recalculated matches stored)
        const recalculatedHash = recalculateBlockHash(currentBlock);
        if (currentBlock.hash !== recalculatedHash) {
            return false;
        }

        // 2. Check if current block's previousHash matches previous block's hash
        if (currentBlock.previousHash !== previousBlock.hash) {
            return false;
        }
    }
    return true;
}

// Generate simple dummy data for blocks
export function generateDummyData() {
    const names = ["Alice", "Bob", "Charlie", "Dave", "Eve", "Frank"];
    const sender = names[Math.floor(Math.random() * names.length)];
    const receiver = names[Math.floor(Math.random() * names.length)];
    const amount = Math.floor(Math.random() * 100) + 1;

    return `Transaction: ${sender} -> ${receiver} (${amount} BTC)`;
}
