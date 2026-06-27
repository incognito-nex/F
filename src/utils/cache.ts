// Simple API Request Cache Utility
interface CacheEntry<T> {
  data: T;
  timestamp: number;
}

const CACHE_EXPIRY_MS = 5 * 60 * 1000; // 5 minutes
const cacheMap = new Map<string, CacheEntry<any>>();

export const cache = {
  get<T>(key: string): T | null {
    const entry = cacheMap.get(key);
    if (!entry) return null;
    
    const isExpired = Date.now() - entry.timestamp > CACHE_EXPIRY_MS;
    if (isExpired) {
      cacheMap.delete(key);
      return null;
    }
    return entry.data as T;
  },

  set<T>(key: string, data: T): void {
    cacheMap.set(key, {
      data,
      timestamp: Date.now()
    });
  },

  clear(): void {
    cacheMap.clear();
  }
};
