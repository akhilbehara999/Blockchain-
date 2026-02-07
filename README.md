# BlockSim - Blockchain Simulator

BlockSim is an interactive educational blockchain simulator designed to demonstrate the core concepts of blockchain technology. It provides a visual and hands-on experience of how transactions are created, validated, mined into blocks, and linked together to form an immutable chain.

## ⚠️ Disclaimer
**This is an educational simulator only and is NOT a real blockchain or cryptocurrency application.** It runs entirely in your browser using local storage and does not connect to any network or process real value.

## Learning Objectives
- **Transactions & Mempool:** Understand how transactions are created, validated, and temporarily stored before being included in a block.
- **Proof of Work (PoW):** Experience the mining process and how difficulty affects the time required to find a valid hash.
- **Chain Integrity:** Visualize how blocks are linked by hashes and how changing data in a previous block invalidates the entire subsequent chain.
- **Tampering & Immutability:** See firsthand the consequences of tampering with data and the effort required to rewrite history.

## Simplifications
- **No P2P Network:** The simulation runs locally on a single node (your browser). There is no consensus mechanism or network propagation.
- **Simplified Mining:** Mining is simulated using a simple loop to find a hash with leading zeros.
- **No Digital Signatures:** Transactions are validated by simple logic (e.g., sender != receiver), not by cryptographic signatures (ECDSA).
- **No UTXO/Balances:** The simulator does not track account balances or use the UTXO model; it allows creating transactions freely as long as inputs are valid.

## Tech Stack
- **HTML5 & CSS3:** Vanilla implementations with no frameworks.
- **JavaScript (ES6+):** Core logic and DOM manipulation.
- **Crypto-js:** External library for SHA256 hashing (via CDN).
- **LocalStorage:** For persisting the blockchain state across reloads.

## How to Use

1.  **Create Transactions:**
    -   Enter a Sender, Receiver, and Amount in the "Create Transaction" section.
    -   Click "Create Transaction" to add it to the Mempool.

2.  **Create a Block:**
    -   Once you have pending transactions in the Mempool, click "Create Block from Mempool".
    -   The Block Builder section will appear with the transactions included.

3.  **Mine the Block:**
    -   Review the block data.
    -   Adjust the "Mining Difficulty" in Settings if desired (default is 3).
    -   Click "Mine This Block". The simulator will search for a nonce that produces a valid hash.

4.  **Add to Blockchain:**
    -   Once mined, click "Add to Blockchain" to append the new block to the chain.
    -   The Mempool will be cleared of the included transactions.

5.  **Explore the Chain:**
    -   Scroll to the "Blockchain Visualization" section to see your blocks linked together.
    -   Valid blocks are shown in green.

6.  **Tamper with Data:**
    -   Enable "Tampering Mode" in Settings.
    -   Edit the Sender, Receiver, or Amount in an existing block.
    -   Notice how the block turns RED (Invalid) and all subsequent blocks also turn RED because the link is broken.
    -   Try to fix it by clicking "Re-mine" on the tampered block, then re-mine subsequent blocks to restore chain validity.

## Live Demo
[Link to GitHub Pages] (To be deployed)
