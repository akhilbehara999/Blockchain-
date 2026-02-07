export const ConsensusType = {
    POW: 'POW',
    POS: 'POS'
};

export const Validators = [
    { name: "Alice", stake: 50, color: "#e91e63" },
    { name: "Bob", stake: 30, color: "#3f51b5" },
    { name: "Carol", stake: 20, color: "#009688" }
];

export class Consensus {
    static calculateHash(index, timestamp, transactions, previousHash, nonce, difficulty, validator) {
        // Include validator in hash if present
        const blockData = index + timestamp + JSON.stringify(transactions) + previousHash + nonce + difficulty + (validator ? validator.name : "");
        return CryptoJS.SHA256(blockData).toString();
    }

    static isHashValid(hash, difficulty) {
        const prefix = "0".repeat(difficulty);
        return hash.startsWith(prefix);
    }

    static selectValidator() {
        // Weighted random selection based on stake
        const totalStake = Validators.reduce((sum, v) => sum + v.stake, 0);
        let random = Math.random() * totalStake;

        for (const v of Validators) {
            if (random < v.stake) {
                return v;
            }
            random -= v.stake;
        }
        return Validators[Validators.length - 1];
    }
}
