import '@testing-library/jest-dom';
import { vi } from 'vitest';

// Mock IntersectionObserver
const IntersectionObserverMock = vi.fn(() => ({
  disconnect: vi.fn(),
  observe: vi.fn(),
  takeRecords: vi.fn(),
  unobserve: vi.fn(),
}));

vi.stubGlobal('IntersectionObserver', IntersectionObserverMock);

// Mock crypto.subtle if needed globally (though Step2 test handles it locally)
// We already did a local mock in Step2, but global might help others if they use it.
if (!global.crypto) {
    Object.defineProperty(global, 'crypto', {
        value: {
            getRandomValues: (arr: any) => require('crypto').randomFillSync(arr),
            subtle: {
                digest: vi.fn(),
            }
        }
    });
}
