import { saveToCache, getFromCache, addPendingSync, getPendingSync, clearPendingSync } from './offlineStorage';

const API_BASE = 'http://localhost:5000/api';

export const isOnline = () => navigator.onLine;

export async function offlineFetch<T>(
  url: string,
  options?: RequestInit,
  cacheStore?: string,
  studentId?: number
): Promise<T> {
  try {
    if (isOnline()) {
      const response = await fetch(`${API_BASE}${url}`, options);
      if (!response.ok) throw new Error('Network response failed');
      const data = await response.json();
      
      if (cacheStore && options?.method === 'GET') {
        await saveToCache(cacheStore as any, Array.isArray(data) ? data : [data]);
      }
      
      return data;
    } else {
      throw new Error('Offline');
    }
  } catch (error) {
    if (cacheStore && (!options?.method || options.method === 'GET')) {
      const cached = await getFromCache(cacheStore as any, studentId);
      if (cached && cached.length > 0) return cached as T;
    }
    
    if (options?.method && ['POST', 'PUT', 'DELETE'].includes(options.method)) {
      await addPendingSync(options.method, { url, options });
      throw new Error('Saved for sync when online');
    }
    
    throw error;
  }
}

export async function syncPendingRequests() {
  if (!isOnline()) return;
  
  const pending = await getPendingSync();
  const results = [];
  
  for (const item of pending) {
    try {
      const { url, options } = item.data;
      await fetch(`${API_BASE}${url}`, options);
      await clearPendingSync(item.id);
      results.push({ success: true, id: item.id });
    } catch (error) {
      results.push({ success: false, id: item.id, error });
    }
  }
  
  return results;
}

window.addEventListener('online', () => {
  syncPendingRequests();
});
