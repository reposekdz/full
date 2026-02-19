// PWA Manager - Install, Offline, Sync
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface PWAState {
  isOnline: boolean;
  isInstalled: boolean;
  isInstallable: boolean;
  deferredPrompt: any;
  pendingActions: any[];
  syncStatus: 'idle' | 'syncing' | 'synced' | 'error';
  setOnline: (status: boolean) => void;
  setInstalled: (status: boolean) => void;
  setInstallable: (status: boolean) => void;
  setDeferredPrompt: (prompt: any) => void;
  addPendingAction: (action: any) => void;
  removePendingAction: (id: string) => void;
  setSyncStatus: (status: 'idle' | 'syncing' | 'synced' | 'error') => void;
  clearPendingActions: () => void;
}

export const usePWAStore = create<PWAState>()(
  persist(
    (set) => ({
      isOnline: navigator.onLine,
      isInstalled: false,
      isInstallable: false,
      deferredPrompt: null,
      pendingActions: [],
      syncStatus: 'idle',
      setOnline: (status) => set({ isOnline: status }),
      setInstalled: (status) => set({ isInstalled: status }),
      setInstallable: (status) => set({ isInstallable: status }),
      setDeferredPrompt: (prompt) => set({ deferredPrompt: prompt }),
      addPendingAction: (action) => set((state) => ({
        pendingActions: [...state.pendingActions, { ...action, id: Date.now().toString() }]
      })),
      removePendingAction: (id) => set((state) => ({
        pendingActions: state.pendingActions.filter(a => a.id !== id)
      })),
      setSyncStatus: (status) => set({ syncStatus: status }),
      clearPendingActions: () => set({ pendingActions: [] })
    }),
    { name: 'pwa-storage' }
  )
);

class PWAManager {
  private static instance: PWAManager;
  private registration: ServiceWorkerRegistration | null = null;
  private db: IDBDatabase | null = null;

  private constructor() {
    this.init();
  }

  static getInstance(): PWAManager {
    if (!PWAManager.instance) {
      PWAManager.instance = new PWAManager();
    }
    return PWAManager.instance;
  }

  private async init() {
    await this.registerServiceWorker();
    await this.initIndexedDB();
    this.setupEventListeners();
    this.checkInstallStatus();
  }

  private async registerServiceWorker() {
    if ('serviceWorker' in navigator) {
      try {
        this.registration = await navigator.serviceWorker.register('/service-worker.js', { scope: '/' });
        console.log('✅ Service Worker registered');
        this.registration.addEventListener('updatefound', () => {
          const newWorker = this.registration?.installing;
          newWorker?.addEventListener('statechange', () => {
            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
              this.showUpdateNotification();
            }
          });
        });
      } catch (error) {
        console.error('❌ Service Worker failed:', error);
      }
    }
  }

  private async initIndexedDB() {
    return new Promise<void>((resolve, reject) => {
      const request = indexedDB.open('garden-tvet-db', 1);
      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        this.db = request.result;
        resolve();
      };
      request.onupgradeneeded = (event: any) => {
        const db = event.target.result;
        if (!db.objectStoreNames.contains('pending-actions')) {
          db.createObjectStore('pending-actions', { keyPath: 'id', autoIncrement: true });
        }
        if (!db.objectStoreNames.contains('cached-data')) {
          const store = db.createObjectStore('cached-data', { keyPath: 'key' });
          store.createIndex('timestamp', 'timestamp', { unique: false });
        }
        if (!db.objectStoreNames.contains('offline-queue')) {
          db.createObjectStore('offline-queue', { keyPath: 'id', autoIncrement: true });
        }
      };
    });
  }

  private setupEventListeners() {
    window.addEventListener('online', () => {
      usePWAStore.getState().setOnline(true);
      this.syncOfflineData();
      this.showNotification('Back Online', 'Syncing your data...');
    });
    window.addEventListener('offline', () => {
      usePWAStore.getState().setOnline(false);
      this.showNotification('Offline Mode', 'Changes will sync when online');
    });
    window.addEventListener('beforeinstallprompt', (e: any) => {
      e.preventDefault();
      usePWAStore.getState().setDeferredPrompt(e);
      usePWAStore.getState().setInstallable(true);
    });
    window.addEventListener('appinstalled', () => {
      usePWAStore.getState().setInstalled(true);
      usePWAStore.getState().setInstallable(false);
      this.showNotification('App Installed', 'Garden TVET is now installed!');
    });
  }

  private checkInstallStatus() {
    if (window.matchMedia('(display-mode: standalone)').matches) {
      usePWAStore.getState().setInstalled(true);
    }
  }

  async showInstallPrompt(): Promise<boolean> {
    const { deferredPrompt } = usePWAStore.getState();
    if (!deferredPrompt) return false;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      usePWAStore.getState().setDeferredPrompt(null);
      return true;
    }
    return false;
  }

  async cacheData(key: string, data: any) {
    if (!this.db) return;
    const transaction = this.db.transaction(['cached-data'], 'readwrite');
    const store = transaction.objectStore('cached-data');
    await store.put({ key, data, timestamp: Date.now() });
  }

  async getCachedData(key: string): Promise<any> {
    if (!this.db) return null;
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['cached-data'], 'readonly');
      const store = transaction.objectStore('cached-data');
      const request = store.get(key);
      request.onsuccess = () => resolve(request.result?.data);
      request.onerror = () => reject(request.error);
    });
  }

  async addToOfflineQueue(action: any) {
    if (!this.db) return;
    const transaction = this.db.transaction(['offline-queue'], 'readwrite');
    const store = transaction.objectStore('offline-queue');
    await store.add({ ...action, timestamp: Date.now() });
    usePWAStore.getState().addPendingAction(action);
  }

  async syncOfflineData() {
    if (!this.db || !navigator.onLine) return;
    usePWAStore.getState().setSyncStatus('syncing');
    try {
      const transaction = this.db.transaction(['offline-queue'], 'readwrite');
      const store = transaction.objectStore('offline-queue');
      const request = store.getAll();
      request.onsuccess = async () => {
        const actions = request.result;
        for (const action of actions) {
          try {
            const response = await fetch(action.url, {
              method: action.method,
              headers: action.headers,
              body: action.body
            });
            if (response.ok) {
              await store.delete(action.id);
              usePWAStore.getState().removePendingAction(action.id);
            }
          } catch (error) {
            console.error('Sync failed:', action, error);
          }
        }
        usePWAStore.getState().setSyncStatus('synced');
        this.showNotification('Sync Complete', 'All changes synced');
      };
    } catch (error) {
      usePWAStore.getState().setSyncStatus('error');
    }
  }

  private async showNotification(title: string, body: string) {
    if ('Notification' in window && Notification.permission === 'granted') {
      if (this.registration) {
        await this.registration.showNotification(title, {
          body,
          icon: '/src/assets/logo/Gemini_Generated_Image_6gbu966gbu966gbu.ico',
          badge: '/src/assets/logo/Gemini_Generated_Image_6gbu966gbu966gbu.ico',
          vibrate: [200, 100, 200]
        });
      }
    }
  }

  async requestNotificationPermission(): Promise<boolean> {
    if ('Notification' in window) {
      const permission = await Notification.requestPermission();
      return permission === 'granted';
    }
    return false;
  }

  private showUpdateNotification() {
    const updateBanner = document.createElement('div');
    updateBanner.innerHTML = `
      <div style="position: fixed; top: 0; left: 0; right: 0; background: #eab308; color: white; padding: 16px; text-align: center; z-index: 9999;">
        <p style="margin: 0 0 8px 0;">New version available!</p>
        <button onclick="window.location.reload()" style="background: white; color: #eab308; border: none; padding: 8px 16px; border-radius: 4px; cursor: pointer; font-weight: bold;">Update Now</button>
      </div>
    `;
    document.body.appendChild(updateBanner);
  }

  async clearAllCaches() {
    const cacheNames = await caches.keys();
    await Promise.all(cacheNames.map(name => caches.delete(name)));
  }

  async getCacheSize(): Promise<number> {
    if ('storage' in navigator && 'estimate' in navigator.storage) {
      const estimate = await navigator.storage.estimate();
      return estimate.usage || 0;
    }
    return 0;
  }
}

export const pwaManager = PWAManager.getInstance();
export default pwaManager;
