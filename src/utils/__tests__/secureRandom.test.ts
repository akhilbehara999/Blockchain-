import { describe, it, expect } from 'vitest';
import { generateSecureId } from '../secureRandom';

describe('secureRandom', () => {
  it('should generate a string', () => {
    const id = generateSecureId();
    expect(typeof id).toBe('string');
    expect(id.length).toBeGreaterThan(0);
  });

  it('should generate unique ids', () => {
    const id1 = generateSecureId();
    const id2 = generateSecureId();
    expect(id1).not.toBe(id2);
  });

  it('should look like a UUID or hex string', () => {
    const id = generateSecureId();
    // UUID regex or hex string regex
    // UUID: 8-4-4-4-12 hex chars
    // Fallback: 32 hex chars
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    const hexRegex = /^[0-9a-f]+$/i;

    const isUuid = uuidRegex.test(id);
    const isHex = hexRegex.test(id);

    expect(isUuid || isHex).toBe(true);
  });
});
