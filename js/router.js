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

    // Check if module is locked
    if (isModuleLocked(moduleIndex)) {
        console.warn(`Module ${moduleIndex} is locked.`);
        return;
    }

    // Update state
    AppState.currentModule = moduleIndex;
    saveState();

    // Re-render UI
    renderUI();
}

/**
 * Marks a module as completed.
 * @param {number} moduleIndex
 */
export function completeModule(moduleIndex) {
    if (AppState.progress[moduleIndex] === true) return; // Already completed

    AppState.progress[moduleIndex] = true;
    saveState();

    // We don't necessarily navigate here; the caller decides when to navigate.
    // But we should re-render UI to update progress indicators if any.
    renderUI();
}

/**
 * Checks if a module is locked.
 * Module 0 is always unlocked.
 * Module N is locked if Module N-1 is not complete.
 * @param {number} moduleIndex
 * @returns {boolean} True if locked, false if unlocked.
 */
export function isModuleLocked(moduleIndex) {
    if (moduleIndex === 0) return false;

    // Check if previous module is complete
    // We look at the progress of (moduleIndex - 1)
    // Note: This assumes linear progression 0 -> 1 -> 2
    return !AppState.progress[moduleIndex - 1];
}

/**
 * Sets up navigation event listeners (e.g., for the sidebar).
 */
function setupNavigation() {
    // Navigation logic is mainly handled by UI buttons and renderUI
}
