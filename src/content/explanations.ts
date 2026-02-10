export const EXPLANATIONS: Record<string, { simple: string; technical: string }> = {
  introduction: {
    simple: `
      # Welcome to BlockSim

      This interactive tool will guide you through the core concepts of blockchain technology.

      You'll start by understanding the basic building blocks and gradually build up to a full distributed ledger simulation.

      Use the navigation menu to jump between modules, or follow the sequence for the best learning experience.
    `,
    technical: `
      # Architecture Overview

      BlockSim is a client-side blockchain simulation engine running entirely in your browser.

      It demonstrates:
      - **SHA-256 Hashing**: The cryptographic foundation.
      - **Linked Data Structures**: How blocks form a chain.
      - **Distributed Consensus**: How nodes agree on the truth.
      - **Public Key Cryptography**: Identity and signatures (Elliptic Curve secp256k1).

      The simulation state is ephemeral and resets on reload, but provides a realistic model of blockchain mechanics.
    `,
  },
  hash: {
    simple: `
      # What is a Hash?

      Think of a hash as a "digital fingerprint" for data.

      If you take any piece of data—a word, a sentence, or an entire book—and run it through a hash function, you get a unique string of characters.

      - **Deterministic**: The same input always gives the same hash.
      - **Unique**: Changing even a single letter in the input completely changes the hash.

      Try typing in the box above and watch how the hash changes!
    `,
    technical: `
      # SHA-256 Hashing

      This module uses the **SHA-256** (Secure Hash Algorithm 256-bit) function.

      - **Input**: Arbitrary length binary data (in this UI, UTF-8 strings).
      - **Output**: A fixed 256-bit digest, typically represented as a 64-character hexadecimal string.
      - **Avalanche Effect**: A 1-bit change in input results in a pseudo-random change of approximately 50% of the output bits.
      - **Pre-image Resistance**: It is computationally infeasible to determine the original input from the hash output.
    `,
  },
  block: {
    simple: `
      # The Block

      A block is a container for data. In a blockchain, this data is usually a list of transactions.

      Each block has:
      1. **Block Number**: Its position in the chain.
      2. **Nonce**: A special number used for mining.
      3. **Data**: The information stored (e.g., "Alice pays Bob $10").
      4. **Hash**: The fingerprint of all the above combined.

      If you change the data inside the block, the block's hash changes. This is how we detect tampering!
    `,
    technical: `
      # Block Structure

      A block header typically contains:
      - \`index\`: Sequence number (height).
      - \`timestamp\`: Creation time.
      - \`data\`: The payload (transactions or arbitrary data).
      - \`previousHash\`: Link to the parent block (discussed in the next module).
      - \`nonce\`: A 32-bit integer used for Proof of Work.
      - \`hash\`: SHA256(index + previousHash + timestamp + data + nonce).

      The visual representation simplifies the header structure but retains the core cryptographic dependency between fields.
    `,
  },
  blockchain: {
    simple: `
      # The Blockchain

      A blockchain is just a list of blocks linked together.

      Each block contains the **Hash of the Previous Block**.

      - Block #2 contains the hash of Block #1.
      - Block #3 contains the hash of Block #2.

      This creates a chain. If you change data in Block #1, its hash changes. Since Block #2 stores that hash, Block #2 becomes invalid. Then Block #3 becomes invalid, and so on.

      **Tamper-Evident**: You can't change history without breaking the entire chain!
    `,
    technical: `
      # Linked List & Merkle Chain

      The blockchain is a back-linked list where each node points to its predecessor via a cryptographic hash pointer (\`previousHash\`).

      This structure ensures **immutability**:
      - Modifying block $N$ changes $Hash(N)$.
      - Block $N+1$ contains $Hash(N)$ in its header.
      - Therefore, $Hash(N+1)$ changes.
      - This cascades to the tip of the chain.

      To rewrite history, an attacker must re-mine (re-do Proof of Work) for the target block and all subsequent blocks.
    `,
  },
  distributed: {
    simple: `
      # Distributed Network

      So far, we've looked at a single blockchain on one computer. But blockchains are distributed across many computers (peers).

      Each peer has a full copy of the blockchain.

      If one peer changes their copy (to cheat), it won't match the copies on other peers. The network sees the mismatch and rejects the bad chain.

      **Consensus**: The majority of honest peers agree on the valid chain.
    `,
    technical: `
      # P2P Consensus

      In a distributed ledger, there is no central authority.

      - **Peers**: Nodes in the network that maintain the ledger state.
      - **Gossip Protocol**: Peers broadcast new transactions and blocks to their neighbors.
      - **Longest Chain Rule**: When a peer sees two conflicting versions of the chain, it generally trusts the one with the most accumulated Proof of Work (often the longest valid chain).

      This simulation visualizes multiple peers (Peer A, Peer B, Peer C) running in parallel. Modifying one peer's state shows how it desynchronizes from the network.
    `,
  },
  tokens: {
    simple: `
      # Tokens & Value

      Instead of just text data, blockchains usually track "Tokens" or coins.

      Transactions look like: "Alice sends 20 tokens to Bob".

      The blockchain ensures:
      1. Alice actually has 20 tokens.
      2. Alice signed the transaction.

      We track account balances by reading the history of all transactions.
    `,
    technical: `
      # State Transition Machine

      The ledger tracks the global state $S$. A transaction $T$ transitions the state: $S_{new} = apply(S_{old}, T)$.

      - **UTXO Model** (Bitcoin): Tracks Unspent Transaction Outputs.
      - **Account Model** (Ethereum): Tracks global balances for each address.

      This simulation uses a simplified **Account Model**:
      - Validation checks \`balance >= amount\`.
      - Balances are derived by summing all incoming and outgoing transactions for an address.
    `,
  },
  coinbase: {
    simple: `
      # Coinbase Transaction

      Where do tokens come from?

      The first transaction in every block is special. It's called the **Coinbase Transaction**.

      It has no sender. It creates new tokens out of thin air and gives them to the **Miner** who found the block.

      This is the incentive for miners to secure the network!
    `,
    technical: `
      # Block Reward

      The Coinbase transaction is the mechanism for:
      1. **Initial Coin Distribution**: How new currency enters the supply.
      2. **Incentivization**: Rewarding miners for spending energy on Proof of Work.

      Typically, the reward amount is fixed by the protocol (e.g., 6.25 BTC) and may halve over time (halving events). It is the only transaction allowed to have no input/sender.
    `,
  },
  keys: {
    simple: `
      # Public & Private Keys

      To own tokens, you need a key pair.

      - **Private Key**: Your secret password. Never share this! It lets you spend money.
      - **Public Key**: Your "bank account number". You share this so people can send you money.

      Mathematically, the Public Key is generated from the Private Key, but you can't go backwards.
    `,
    technical: `
      # Elliptic Curve Cryptography (ECC)

      We use **secp256k1**, the same curve used by Bitcoin and Ethereum.

      - **Private Key ($d$)**: A random 256-bit integer.
      - **Public Key ($Q$)**: A point on the curve, $Q = d \times G$, where $G$ is the generator point.
      - **One-Way Function**: It is easy to compute $Q$ from $d$, but computationally infeasible to compute $d$ from $Q$ (Discrete Logarithm Problem).

      Addresses are typically a hash of the Public Key.
    `,
  },
  signatures: {
    simple: `
      # Digital Signatures

      When you send money, you must **Sign** the transaction with your Private Key.

      Others can use your Public Key to **Verify** the signature.

      - **Valid Signature**: Proves *you* created the message and it hasn't been changed.
      - **Security**: They can verify it without ever seeing your Private Key.
    `,
    technical: `
      # ECDSA (Elliptic Curve Digital Signature Algorithm)

      Signing involves:
      1. Hashing the message $m$ to get $h = Hash(m)$.
      2. Using the private key $d$ and a random nonce $k$ to generate signature $(r, s)$.

      Verification involves:
      1. Using the public key $Q$, the message hash $h$, and the signature $(r, s)$ to calculate a point on the curve.
      2. Checking if the calculated point matches the $r$ value.

      This ensures **Authentication** (sender identity), **Non-repudiation** (sender can't deny), and **Integrity** (message not altered).
    `,
  },
  transaction: {
    simple: `
      # Putting it Together: Transactions

      A valid transaction requires:
      1. **Message**: "I send $20 to Bob".
      2. **Signature**: Signed by my Private Key.
      3. **Public Key**: Attached so the network can verify the signature.

      The network checks:
      - Is the signature valid for this message and public key?
      - Does the sender have enough money?

      If yes, the transaction is added to a block.
    `,
    technical: `
      # Transaction Structure

      A signed transaction typically contains:
      - \`from\`: Sender's public key (or address).
      - \`to\`: Receiver's address.
      - \`amount\`: Value to transfer.
      - \`timestamp\`: Time of creation.
      - \`signature\`: The cryptographic proof $(r, s)$.

      The network nodes validate the signature against the \`from\` key and the transaction data hash. Invalid signatures result in the transaction being rejected from the mempool.
    `,
  },
  pow: {
    simple: `
      # Proof of Work

      To add a block, you must solve a puzzle.

      **The Puzzle**: Find a hash that starts with four zeros (e.g., \`0000...\`).

      Since hashes are random, you can't predict which input will give four zeros.

      **The Solution**: You take the block data and add a random number called a **Nonce**.
      1. Hash(Data + Nonce 1) = \`8f4a...\` (Fail)
      2. Hash(Data + Nonce 2) = \`b21c...\` (Fail)
      ...
      3502. Hash(Data + Nonce 3502) = \`0000...\` (Success!)

      This takes work (CPU power). This proves you did the work.
    `,
    technical: `
      # Hashcash Algorithm

      Proof of Work requires finding a nonce such that:
      $Hash(Header + nonce) < Target$

      - **Target**: A value determined by the difficulty. Lower target = harder to find.
      - **Difficulty**: Often expressed as the number of leading zeros required in the hex hash.

      This mechanism makes block generation expensive (energy/time), preventing spam and Sybil attacks. It ensures that rewriting the chain is economically prohibitive.
    `,
  },
  mining: {
    simple: `
      # Mining

      Mining is the process of listening for new transactions, bundling them into a block, and trying to solve the Proof of Work puzzle.

      When a miner solves the puzzle:
      1. They broadcast the new block to the network.
      2. Everyone verifies the solution (easy to check).
      3. The miner gets the **Block Reward** (Coinbase).

      This secures the network because attackers would need more computing power than all honest miners combined to overpower the chain.
    `,
    technical: `
      # The Mining Loop

      1. **Construct Candidate Block**: Gather transactions from the mempool. Add Coinbase transaction.
      2. **Hash Loop**:
         - Increment \`nonce\`.
         - Calculate $h = SHA256(header)$.
         - Check if $h < target$.
      3. **Broadcast**: If solution found, send to peers.
      4. **Validation**: Peers verify the hash and transactions before adding to their local chain.

      This probabilistic process ensures blocks are found at a regular average interval (e.g., 10 mins for Bitcoin).
    `,
  },
  difficulty: {
    simple: `
      # Adjusting Difficulty

      What if computers get faster? Or more miners join?

      Blocks would be found too quickly!

      To keep the rhythm steady (e.g., one block every 10 minutes), the network adjusts the **Difficulty**.

      - **Too Fast?** Make the puzzle harder (more leading zeros).
      - **Too Slow?** Make the puzzle easier.
    `,
    technical: `
      # Difficulty Retargeting

      The protocol targets a specific block time $T_{target}$.
      Periodically (e.g., every 2016 blocks in Bitcoin), the network recalculates difficulty:

      $NewDifficulty = OldDifficulty \times \frac{ActualTime}{TargetTime}$

      In this simulation, we simplify this by allowing you to manually set the difficulty (number of leading zeros) to see how it exponentially increases the time required to mine a block.
    `,
  },
  'smart-contracts': {
    simple: `
      # Smart Contracts

      Blockchains can do more than move money. They can run computer programs.

      A **Smart Contract** is code that lives on the blockchain.

      "If Alice sends 10 tokens to the contract, release the digital artwork to Alice."

      Once deployed, the code cannot be changed. It runs exactly as programmed, without any middleman.
    `,
    technical: `
      # Turing-Complete Execution

      Smart Contracts are scripts stored on-chain. Transactions can trigger these scripts.

      - **Code**: Bytecode executed by the Virtual Machine (e.g., EVM).
      - **State**: Persistent storage variables associated with the contract address.
      - **Gas**: A fee mechanism to prevent infinite loops (Halting Problem) and resource abuse.

      In this module, we simulate a simple VM that executes basic conditional logic based on transaction inputs.
    `,
  },
};
