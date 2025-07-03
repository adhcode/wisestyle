/**
 * Cache utility for localStorage with automatic cleanup
 */

export const cacheManager = {
  // Set cache with expiration
  setCache: (key: string, data: any, expirationHours: number = 1) => {
    try {
      const cacheData = {
        data,
        timestamp: Date.now(),
        expirationTime: Date.now() + (expirationHours * 60 * 60 * 1000)
      };
      localStorage.setItem(key, JSON.stringify(cacheData));
    } catch (error) {
      console.error(`Error setting cache for ${key}:`, error);
    }
  },

  // Get cache if not expired
  getCache: <T>(key: string): T | null => {
    try {
      const cached = localStorage.getItem(key);
      if (!cached) return null;

      const cacheData = JSON.parse(cached);
      const now = Date.now();

      if (now > cacheData.expirationTime) {
        localStorage.removeItem(key);
        return null;
      }

      return cacheData.data as T;
    } catch (error) {
      console.error(`Error getting cache for ${key}:`, error);
      localStorage.removeItem(key);
      return null;
    }
  },

  // Clear specific cache
  clearCache: (key: string) => {
    localStorage.removeItem(key);
  },

  // Clear all expired cache entries
  clearExpiredCache: () => {
    const now = Date.now();
    const keysToRemove: string[] = [];

    try {
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (!key) continue;

        // Only process cache entries (those with our structure)
        try {
          const item = localStorage.getItem(key);
          if (!item) continue;

          const parsed = JSON.parse(item);
          if (parsed.expirationTime && now > parsed.expirationTime) {
            keysToRemove.push(key);
          }
        } catch {
          // Not a cache entry, skip
          continue;
        }
      }

      keysToRemove.forEach(key => localStorage.removeItem(key));
      console.log(`Cleared ${keysToRemove.length} expired cache entries`);
    } catch (error) {
      console.error('Error clearing expired cache:', error);
    }
  }
};

// Clear expired cache on app start
if (typeof window !== 'undefined') {
  cacheManager.clearExpiredCache();
} 