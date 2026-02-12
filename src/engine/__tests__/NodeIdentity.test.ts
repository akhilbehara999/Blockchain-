
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { NodeIdentity } from '../NodeIdentity';

// Mock localStorage
const localStorageMock = (function() {
  let store: Record<string, string> = {};
  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value.toString();
    },
    clear: () => {
      store = {};
    },
    removeItem: (key: string) => {
      delete store[key];
    }
  };
})();

Object.defineProperty(global, 'localStorage', {
  value: localStorageMock
});

// Mock crypto.getRandomValues
Object.defineProperty(global, 'crypto', {
  value: {
    getRandomValues: (buffer: Uint8Array) => {
      for (let i = 0; i < buffer.length; i++) {
        buffer[i] = Math.floor(Math.random() * 256);
      }
      return buffer;
    }
  }
});

describe('NodeIdentity', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
  });

  it('should create a new identity if none exists', () => {
    const identity = NodeIdentity.getOrCreate();
    expect(identity).toBeDefined();
    expect(identity.getId()).toMatch(/^Node #[0-9A-F]{4}$/);
    expect(identity.isNew).toBe(true);
    expect(localStorage.getItem('yupp_node_identity')).toBeTruthy();
  });

  it('should retrieve an existing identity', () => {
    // Create first
    const first = NodeIdentity.getOrCreate();
    const id1 = first.getId();

    // Retrieve second
    const second = NodeIdentity.getOrCreate();
    const id2 = second.getId();

    expect(id1).toBe(id2);
    expect(second.isNew).toBe(false);
  });

  it('should contain a wallet address', () => {
    const identity = NodeIdentity.getOrCreate();
    expect(identity.getWalletAddress()).toMatch(/^0x[0-9a-f]{40}$/);
  });

  it('should persist firstSeen date', () => {
    const identity1 = NodeIdentity.getOrCreate();
    const date1 = identity1.getFirstSeen();

    const identity2 = NodeIdentity.getOrCreate();
    const date2 = identity2.getFirstSeen();

    expect(date1.toISOString()).toBe(date2.toISOString());
  });
});
