import { AppState } from './appState.js';
import { loadState, saveState } from './storage.js';
import { renderUI } from './ui.js';

/**
 * Initializes the application.
 * Loads state, sets up event listeners, and renders the initial module.
 */
export function initApp() {
    console.log('BlockSim Initializing...');

    // Load state from localStorage
    loadState();

    // Determine the starting module
    // If no state was saved, AppState.currentModule defaults to 0

    // Render the UI for the current module
    renderUI();

    // Set up global event listeners (e.g., navigation)
    setupNavigation();
}

/**
 * Navigates to a specific module index.
 * @param {number} moduleIndex
 */
export function navigateTo(moduleIndex) {
    if (moduleIndex < 0) return;

    // Update state
    AppState.currentModule = moduleIndex;
    saveState();

    // Re-render UI
    renderUI();
}

/**
 * Sets up navigation event listeners (e.g., for the sidebar).
 */
function setupNavigation() {
    // This will be expanded later to handle sidebar clicks
    // For now, navigation is driven by module progression buttons
}
