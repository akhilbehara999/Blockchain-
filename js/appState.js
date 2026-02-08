// Global Application State

export const AppState = {
  currentModule: 0,

  // Blockchain Data
  blockchain: [], // Array of Block objects
  pendingTransactions: [], // Array of Transaction objects

  // Wallet & Network Data (Placeholders for future modules)
  wallets: [],
  nodes: [],

  // Mining Difficulty
  difficulty: 2,

  // User Progress Tracking
  progress: {
    // Stores boolean 'completed' flags for each module index
    0: false, // Intro
    1: false, // Ledger
    2: false, // Block
    // ... extend as needed
  }
};

export default AppState;
