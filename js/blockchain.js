import { AppState } from './appState.js';

/**
 * Returns the current blockchain.
 */
export function getBlockchain() {
    return AppState.blockchain;
}

/**
 * Checks if the chain is empty.
 */
export function isChainEmpty() {
    return AppState.blockchain.length === 0;
}
