export class Block {
    constructor(index, transactions, previousHash = "0", difficulty = 3, validator = null) {
        this.index = index;
        this.timestamp = new Date().toISOString();
        this.transactions = transactions;
        this.previousHash = previousHash;
        this.difficulty = difficulty;
        this.nonce = 0;
        this.hash = ""; // Empty until mined/validated
        this.validator = validator; // For Proof of Stake
        this.isValid = true;
        this.invalidReason = null;
        this.calculatedHash = ""; // For UI display of mismatch
    }
}
