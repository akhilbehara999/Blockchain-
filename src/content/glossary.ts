export const GLOSSARY_TERMS = [
  {
    term: 'Hash',
    definition: 'A cryptographic hash function takes an input (or "message") and returns a fixed-size string of bytes. The output is typically a "digest" that is unique to each unique input.',
  },
  {
    term: 'Block',
    definition: 'A data structure that contains a list of transactions and a reference to the previous block\'s hash, creating a chain.',
  },
  {
    term: 'Blockchain',
    definition: 'A distributed, immutable ledger made of blocks linked together cryptographically.',
  },
  {
    term: 'Nonce',
    definition: 'A "number only used once" added to a hashed block that, when changed, changes the block\'s hash. Miners iterate the nonce to find a hash that meets the difficulty target.',
  },
  {
    term: 'Difficulty',
    definition: 'A measure of how hard it is to find a hash below a given target. The network adjusts this to keep block generation time consistent.',
  },
  {
    term: 'Coinbase Transaction',
    definition: 'The first transaction in a block, which creates new coins and awards them to the miner as a reward.',
  },
  {
    term: 'Peer',
    definition: 'A participant in the blockchain network that maintains a copy of the ledger and validates transactions.',
  },
  {
    term: 'Public Key',
    definition: 'A cryptographic code that allows a user to receive cryptocurrencies into their account. It is derived from the private key and can be shared openly.',
  },
  {
    term: 'Private Key',
    definition: 'A secret number that allows a user to spend cryptocurrencies. It must be kept secure, as anyone with the private key can control the funds.',
  },
  {
    term: 'Digital Signature',
    definition: 'A mathematical scheme for demonstrating the authenticity of digital messages or documents. It proves ownership of the private key without revealing it.',
  },
  {
    term: 'Smart Contract',
    definition: 'Self-executing contracts with the terms of the agreement between buyer and seller being directly written into lines of code.',
  },
  {
    term: 'Proof of Work (PoW)',
    definition: 'A consensus mechanism that requires members of a network to expend effort solving an arbitrary mathematical puzzle to prevent anybody from gaming the system.',
  },
  {
    term: 'Ledger',
    definition: 'A record of all transactions that have ever occurred on the blockchain network.',
  },
  {
    term: 'Token',
    definition: 'A digital asset issued on a blockchain that can represent value, utility, or an asset.',
  },
];
