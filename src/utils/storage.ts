const MAX_STORAGE_SIZE = 4 * 1024 * 1024; // 4MB

function getStorageUsage(): number {
  let total = 0;
  try {
    for (const key in localStorage) {
      if (key.startsWith('yupp_')) {
        total += (localStorage.getItem(key) || '').length;
      }
    }
  } catch {
    // Ignore errors
  }
  return total;
}

function pruneOldData() {
  try {
    const EPHEMERAL_KEYS = ['yupp_mempool', 'yupp_events', 'yupp_background_state'];
    for (const key of EPHEMERAL_KEYS) {
        localStorage.removeItem(key);
    }
  } catch {
    // Ignore
  }
}

export const Storage = {
  getItem: <T>(key: string, validator?: (data: any) => boolean): T | null => {
    try {
      const raw = localStorage.getItem(key);
      if (!raw) return null;
      const parsed = JSON.parse(raw);
      if (validator && !validator(parsed)) {
        return null;
      }
      return parsed as T;
    } catch {
      return null;
    }
  },

  setItem: <T>(key: string, value: T): boolean => {
    try {
      const serialized = JSON.stringify(value);
      if (getStorageUsage() + serialized.length > MAX_STORAGE_SIZE) {
        pruneOldData();
        if (getStorageUsage() + serialized.length > MAX_STORAGE_SIZE) {
             return false;
        }
      }
      localStorage.setItem(key, serialized);
      return true;
    } catch {
      return false;
    }
  },

  removeItem: (key: string) => {
      try {
          localStorage.removeItem(key);
      } catch {
          // Ignore
      }
  },

  clear: () => {
      try {
        Object.keys(localStorage).forEach(key => {
            if (key.startsWith('yupp_')) {
                localStorage.removeItem(key);
            }
        });
      } catch {
          // Ignore
      }
  }
};
