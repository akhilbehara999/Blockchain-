export const EXPLANATIONS = {
  introduction: {
    simple: "Welcome to BlockSim! A blockchain is a shared digital ledger that records transactions across many computers. Think of it like a Google Doc where everyone can see what's written, but no one can delete or change what's already there without everyone else agreeing. This module introduces you to the core concepts.",
    technical: "A blockchain is a decentralized, distributed ledger technology that maintains a continuously growing list of records, called blocks. Each block contains a cryptographic hash of the previous block, a timestamp, and transaction data. This structure ensures immutability and security without a central authority."
  },
  hash: {
    simple: "A hash is like a unique digital fingerprint for data. If you change even a single letter in the data, the fingerprint changes completely. This makes it easy to spot if someone has tampered with the information.",
    technical: "A cryptographic hash function (like SHA-256) maps data of arbitrary size to a bit array of a fixed size. It is a one-way function, meaning it is computationally infeasible to invert. The avalanche effect ensures that a small change in input results in a significantly different output."
  },
  block: {
    simple: "A block is a container that holds a list of transactions. It also has a unique ID (hash) and a reference to the previous block. This chaining of blocks is what makes the blockchain secure.",
    technical: "A block consists of a header and a body. The header typically includes the version, previous block hash, Merkle root, timestamp, difficulty target, and nonce. The body contains the transaction data. The block hash is calculated by hashing the header."
  },
  blockchain: {
    simple: "Blocks are linked together in a specific order. Each block points to the one before it. If you try to change an old block, its fingerprint changes, and the link to the next block breaks. This makes the history of transactions permanent.",
    technical: "The blockchain is a linked list of blocks where each block contains the hash of the preceding block. This cryptographic link enforces the ordering and integrity of the chain. Modifying any block requires re-mining that block and all subsequent blocks."
  },
  distributed: {
    simple: "Instead of one central computer keeping the records, many computers (peers) keep their own copy. They talk to each other to agree on the correct history. This makes the system very hard to hack.",
    technical: "A distributed ledger relies on a peer-to-peer (P2P) network. Each node maintains a full or partial copy of the blockchain. A consensus algorithm ensures that all nodes agree on the state of the ledger, providing fault tolerance and eliminating single points of failure."
  },
  tokens: {
    simple: "Tokens represent value or assets on the blockchain. You can send them to others. The blockchain tracks how many tokens everyone has, preventing people from spending money they don't have.",
    technical: "Tokens are digital assets defined by a protocol or smart contract on a blockchain. Transactions involve transferring ownership of these tokens by updating the state of the ledger. The system enforces rules against double-spending and unauthorized creation of tokens."
  },
  coinbase: {
    simple: "Where do new coins come from? The first transaction in every block is special—it creates new coins and gives them to the miner who did the work. This is the reward for securing the network.",
    technical: "The coinbase transaction is the first transaction in a block. It has no inputs and generates new coins (block reward) plus transaction fees from the block. This is the primary mechanism for introducing new currency into circulation."
  },
  keys: {
    simple: "You get a pair of keys: a public key (like your email address) that you share with others to receive money, and a private key (like your password) that you keep secret to access your money.",
    technical: "Public-key cryptography (e.g., Elliptic Curve Cryptography) uses a pair of keys: a public key for encryption/verification and a private key for decryption/signing. Addresses are derived from the public key."
  },
  signatures: {
    simple: "To prove a message came from you, you 'sign' it with your private key. Anyone can use your public key to verify the signature is real, without needing your private key.",
    technical: "Digital signatures provide authentication, non-repudiation, and integrity. A user signs a transaction hash with their private key. The network uses the corresponding public key to verify that the signature is valid and the transaction has not been tampered with."
  },
  transaction: {
    simple: "A transaction is a record of money moving from one person to another. It says 'Alice sends 5 coins to Bob' and includes Alice's signature to prove she authorized it.",
    technical: "A transaction consists of inputs (referencing previous unspent outputs or UTXOs) and outputs (specifying new owners and amounts). It is signed by the sender's private key. Miners validate the signature and check for sufficient funds before including it in a block."
  },
  pow: {
    simple: "Proof of Work is like a difficult puzzle. Miners compete to solve it. The solution is easy to check but hard to find. This proves they did the work and makes it expensive to cheat.",
    technical: "Proof of Work (PoW) requires miners to find a nonce such that the hash of the block header is less than a specific target. This process is probabilistic and requires significant computational energy, securing the network against Sybil attacks and history rewriting."
  },
  mining: {
    simple: "Mining is the process of collecting new transactions, putting them in a block, and solving the Proof of Work puzzle. The winner gets to add the block to the chain and earns a reward.",
    technical: "Mining involves aggregating pending transactions from the mempool into a candidate block, hashing the block header with different nonces until a valid hash is found, and broadcasting the block to the network."
  },
  difficulty: {
    simple: "To keep blocks coming at a steady pace (e.g., every 10 minutes), the puzzle gets harder if more miners join, and easier if they leave. This self-adjustment keeps the system stable.",
    technical: "The difficulty target is adjusted periodically based on the total hashing power of the network. If blocks are generated too quickly, difficulty increases (target decreases); if too slowly, difficulty decreases, maintaining a constant average block time."
  },
  'smart-contracts': {
    simple: "Smart contracts are like digital vending machines. You put in money and select an item, and the machine automatically gives it to you. No shopkeeper needed. They are programs that run on the blockchain.",
    technical: "Smart contracts are self-executing code deployed on the blockchain. They automatically enforce and execute the terms of an agreement when predefined conditions are met. They run in a deterministic environment (e.g., EVM) and their state is stored on the ledger."
  }
};
