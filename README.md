# Blockchain Experience

**Learn by Becoming a Node.**

Welcome to the Blockchain Experience, a comprehensive, interactive simulation that demystifies blockchain technology. This is not just a tutorial; it's a living, breathing network where you participate as a node.

## Overview

Join a simulated blockchain network, complete an 8-step guided journey to understand the core mechanics, and then master your skills in the open-ended Sandbox mode.

### The Journey (Steps 1-8)
1.  **Identity**: Generate your cryptographic keypair.
2.  **Hashing**: Experiment with SHA-256 and digital fingerprints.
3.  **Blocks**: Build and seal your first block.
4.  **Chain**: Understand the immutable link between blocks.
5.  **Mining**: Compete in Proof-of-Work races.
6.  **Transactions**: Send funds, manage fees, and visualize the mempool.
7.  **Consensus**: Witness forks and chain reorganizations.
8.  **Contracts**: Deploy and interact with smart contracts.

### The Sandbox
Once you complete the journey, unlock the **Sandbox Mode**.
-   **God Mode**: See everything happening in the network.
-   **Node Mode**: Experience the limited perspective of a single participant.
-   **Shortcuts**:
    -   `M`: Quick access to Mining
    -   `T`: Quick access to Wallet/Transactions
    -   `G`: Toggle God Mode
    -   `Space`: Pause/Resume Simulation

### Challenges
Test your mastery with advanced scenarios:
-   Double Spend Attack
-   51% Attack Simulation
-   Chain Reorganization Survival

## Features

-   **Live Simulation**: A background engine simulates peers, transactions, and mining in real-time.
-   **Interactive Visualizations**: See blocks, mempools, and forks dynamically.
-   **Persistent Progress**: Your identity and journey progress are saved locally.
-   **Responsive Design**: Works on desktop, tablet, and mobile.
-   **Mastery System**: Earn XP and ranks (Novice -> Master) as you progress.

## Tech Stack

-   **Frontend**: React, TypeScript, Vite
-   **Styling**: Tailwind CSS, Framer Motion
-   **State Management**: Zustand
-   **Icons**: Lucide React
-   **Cryptography**: Web Crypto API, Elliptic (secp256k1)

## Getting Started

1.  Clone the repository:
    ```bash
    git clone https://github.com/akhilbehara999/Blockchain-.git
    ```
2.  Install dependencies:
    ```bash
    npm install
    ```
3.  Run the development server:
    ```bash
    npm run dev
    ```
4.  Open `http://localhost:5173` in your browser.

## Architecture

-   **`src/engine`**: Core blockchain logic (Block, Transaction, Miner, BackgroundEngine).
-   **`src/stores`**: Zustand stores for state management (Blockchain, Wallet, Fork).
-   **`src/components`**: React components organized by feature (Journey, Sandbox, Network).
-   **`src/context`**: React contexts for global providers (Toast, Sound, Progress).

## License

MIT
