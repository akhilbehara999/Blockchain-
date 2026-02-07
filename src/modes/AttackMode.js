export class AttackMode {
    constructor(app) {
        this.app = app;
    }

    showInfo(msg) {
        const div = document.getElementById('attack-info');
        if(div) {
            div.innerHTML = `<strong>Attack Simulator:</strong> ${msg}`;
            div.style.display = 'block';
        }
    }

    doubleSpend() {
        // Find a block with transactions (skip genesis if possible)
        const chain = this.app.blockchain.chain;
        let targetBlock = null;
        let targetTxIndex = -1;

        for (let i = chain.length - 1; i > 0; i--) {
            if (chain[i].transactions.length > 0) {
                targetBlock = chain[i];
                targetTxIndex = 0; // Pick first tx
                break;
            }
        }

        if (!targetBlock) {
            this.showInfo("No transactions found to double spend. Create some blocks with transactions first.");
            return;
        }

        // Modify the transaction
        const tx = targetBlock.transactions[targetTxIndex];
        const originalReceiver = tx.receiver;

        // We simulate a double spend by changing the receiver to "Attacker"
        // In a real scenario, this would be broadcasting a conflicting tx.
        // Here we simulate the result: The block becomes invalid because it doesn't match the history or signature.
        // Since we don't have signatures, we just modify the data which breaks the hash.

        this.app.tamperTransaction(targetBlock.index, targetTxIndex, 'receiver', 'Attacker');

        this.showInfo(`Double Spend Attempted! Block #${targetBlock.index} transaction modified. Receiver changed from ${originalReceiver} to 'Attacker'. The chain is now invalid.`);

        // Scroll to block
        const container = document.getElementById('blockchain-container');
        // Simple scroll to end or specific block logic?
        // Let's just scroll to the block
        // We don't have easy ref to the DOM element here without querying.
        // But Renderer renders all.
    }

    forkChain() {
        // Find a block in the middle
        const chain = this.app.blockchain.chain;
        if (chain.length < 3) {
            this.showInfo("Chain too short to fork. Mine at least 3 blocks.");
            return;
        }

        const splitIndex = Math.floor(chain.length / 2);
        const block = chain[splitIndex];

        // Change previous hash to a random one
        const originalPrevHash = block.previousHash;
        const newPrevHash = "0000fork" + Math.random().toString(36).substr(2, 6);

        this.app.tamperPreviousHash(block.index, newPrevHash);

        this.showInfo(`Chain Forked at Block #${block.index}! Previous Hash changed. This disconnects the block from the valid chain.`);
    }
}
