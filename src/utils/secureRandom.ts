/**
 * Generates a cryptographically secure random identifier.
 * Uses crypto.randomUUID() where available, falling back to crypto.getRandomValues().
 */
export function generateSecureId(): string {
  // Modern browsers and Node.js
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }

  // Fallback for environments with crypto but no randomUUID
  if (typeof crypto !== 'undefined' && typeof crypto.getRandomValues === 'function') {
    // Generate 16 random bytes (128 bits)
    const array = new Uint8Array(16);
    crypto.getRandomValues(array);

    // Convert to hex string
    return Array.from(array)
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');
  }

  // Fallback should be avoided in production security contexts,
  // but included here to prevent app crash in very old environments.
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}
