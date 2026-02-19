// Offline Data Manager - Cache and Sync Data
import { pwaManager } from './pwaManager';

interface CacheConfig {
  key: string;
  ttl?: number; // Time to live in milliseconds
  strategy?: 'cache-first' | 'network-first' | 'stale-while-revalidate';
}

class OfflineDataManager {
  private static instance: OfflineDataManager;

  private constructor() {}

  static getInstance(): OfflineDataManager {
    if (!OfflineDataManager.instance) {
      OfflineDataManager.instance = new OfflineDataManager();
    }
    return OfflineDataManager.instance;
  }

  // Fetch with offline support
  async fetchWithCache(url: string, options: RequestInit = {}, config: CacheConfig) {
    const { key, ttl = 3600000, strategy = 'network-first' } = config;

    if (strategy === 'cache-first') {
      return this.cacheFirstFetch(url, options, key, ttl);
    } else if (strategy === 'network-first') {
      return this.networkFirstFetch(url, options, key, ttl);
    } else {
      return this.staleWhileRevalidateFetch(url, options, key, ttl);
    }
  }

  // Cache first strategy
  private async cacheFirstFetch(url: string, options: RequestInit, key: string, ttl: number) {
    const cached = await pwaManager.getCachedData(key);
    
    if (cached && this.isCacheValid(cached, ttl)) {
      return cached.data;
    }

    try {
      const response = await fetch(url, options);
      const data = await response.json();
      await pwaManager.cacheData(key, { data, timestamp: Date.now() });
      return data;
    } catch (error) {
      if (cached) return cached.data;
      throw error;
    }
  }

  // Network first strategy
  private async networkFirstFetch(url: string, options: RequestInit, key: string, ttl: number) {
    try {
      const response = await fetch(url, options);
      const data = await response.json();
      await pwaManager.cacheData(key, { data, timestamp: Date.now() });
      return data;
    } catch (error) {
      const cached = await pwaManager.getCachedData(key);
      if (cached && this.isCacheValid(cached, ttl)) {
        return cached.data;
      }
      throw error;
    }
  }

  // Stale while revalidate strategy
  private async staleWhileRevalidateFetch(url: string, options: RequestInit, key: string, ttl: number) {
    const cached = await pwaManager.getCachedData(key);
    
    // Return cached immediately if available
    const cachePromise = cached ? Promise.resolve(cached.data) : null;
    
    // Fetch fresh data in background
    const fetchPromise = fetch(url, options)
      .then(res => res.json())
      .then(data => {
        pwaManager.cacheData(key, { data, timestamp: Date.now() });
        return data;
      })
      .catch(() => cached?.data);

    return cachePromise || fetchPromise;
  }

  // Check if cache is valid
  private isCacheValid(cached: any, ttl: number): boolean {
    if (!cached.timestamp) return false;
    return Date.now() - cached.timestamp < ttl;
  }

  // Queue action for offline sync
  async queueAction(action: {
    url: string;
    method: string;
    headers?: Record<string, string>;
    body?: any;
    description?: string;
  }) {
    await pwaManager.addToOfflineQueue({
      ...action,
      body: action.body ? JSON.stringify(action.body) : undefined
    });
  }

  // Preload critical data
  async preloadCriticalData(token: string) {
    const criticalEndpoints = [
      { url: '/api/dashboard/stats', key: 'dashboard-stats' },
      { url: '/api/students', key: 'students-list' },
      { url: '/api/staff', key: 'staff-list' },
      { url: '/api/courses', key: 'courses-list' },
      { url: '/api/trades', key: 'trades-list' },
      { url: '/api/news', key: 'news-list' },
      { url: '/api/sports', key: 'sports-list' }
    ];

    const headers = { Authorization: `Bearer ${token}` };

    for (const endpoint of criticalEndpoints) {
      try {
        await this.fetchWithCache(
          endpoint.url,
          { headers },
          { key: endpoint.key, strategy: 'network-first' }
        );
      } catch (error) {
        console.error(`Failed to preload ${endpoint.key}:`, error);
      }
    }
  }

  // Clear old cache
  async clearOldCache(maxAge: number = 7 * 24 * 60 * 60 * 1000) {
    // Implementation would clear cache older than maxAge
    console.log('Clearing old cache...');
  }

  // Get cache statistics
  async getCacheStats() {
    const size = await pwaManager.getCacheSize();
    return {
      size,
      sizeFormatted: this.formatBytes(size)
    };
  }

  private formatBytes(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  }
}

export const offlineDataManager = OfflineDataManager.getInstance();
export default offlineDataManager;

// React Hook for offline-aware API calls
export function useOfflineAPI() {
  const [isOnline, setIsOnline] = React.useState(navigator.onLine);

  React.useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const fetchData = async (url: string, options: RequestInit = {}, cacheKey: string) => {
    return offlineDataManager.fetchWithCache(url, options, {
      key: cacheKey,
      strategy: isOnline ? 'network-first' : 'cache-first'
    });
  };

  const mutateData = async (url: string, options: RequestInit = {}, description?: string) => {
    if (!isOnline) {
      await offlineDataManager.queueAction({
        url,
        method: options.method || 'POST',
        headers: options.headers as Record<string, string>,
        body: options.body,
        description
      });
      return { offline: true, queued: true };
    }

    return fetch(url, options).then(res => res.json());
  };

  return { isOnline, fetchData, mutateData };
}

// Add React import
import React from 'react';
