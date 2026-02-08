// LocalStorage Persistence Layer
import { AppState } from './appState.js';

const STORAGE_KEY = 'blocksim_state_v1';

/**
 * Saves the current AppState to localStorage.
 */
export function saveState() {
  try {
    const serializedState = JSON.stringify(AppState);
    localStorage.setItem(STORAGE_KEY, serializedState);
  } catch (error) {
    console.error('Failed to save state:', error);
  }
}

/**
 * Loads the state from localStorage and merges it into the current AppState object.
 */
export function loadState() {
  try {
    const serializedState = localStorage.getItem(STORAGE_KEY);
    if (!serializedState) return;

    const savedState = JSON.parse(serializedState);

    // Merge saved state into AppState
    Object.assign(AppState, savedState);

    // Ensure complex objects (like dates) are handled if necessary in future
    // For now, simple JSON parsing is sufficient
  } catch (error) {
    console.error('Failed to load state:', error);
  }
}

/**
 * Clears the saved state (Useful for debugging or reset).
 */
export function clearState() {
  localStorage.removeItem(STORAGE_KEY);
  location.reload();
}
