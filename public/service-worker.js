// Garden TVET PWA Service Worker - Advanced Offline Support (Silent Error Handling)
const CACHE_VERSION = 'v1.0.2';
const CACHE_NAME = `garden-tvet-${CACHE_VERSION}`;

// Assets to cache immediately
const PRECACHE_ASSETS = [
  '/',
  '/src/assets/logo/Gemini_Generated_Image_6gbu966gbu966gbu.ico',
  '/manifest.json',
  '/index.html'
];

// Cache strategies
const CACHE_STRATEGIES = {
  cacheFirst: ['images', 'fonts', 'styles', 'scripts'],
  networkFirst: ['api', 'data'],
  staleWhileRevalidate: ['pages']
};

// Install event - cache essential assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(PRECACHE_ASSETS);
    }).then(() => self.skipWaiting())
  );
});

// Activate event - clean old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Fetch event - handle requests with offline support
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET requests
  if (request.method !== 'GET') {
    return;
  }

  // Skip external domains (like Unsplash) to avoid CSP issues
  if (url.origin !== self.location.origin && !url.origin.includes('localhost')) {
    return;
  }

  // Skip WebSocket connections
  if (url.protocol === 'ws:' || url.protocol === 'wss:') {
    return;
  }

  // Skip hot module replacement
  if (url.searchParams.has('t=') || url.searchParams.has('hot=')) {
    return;
  }

  // API requests - Network first, cache fallback
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(networkFirstStrategy(request));
    return;
  }

  // Images - Cache first (only for same origin)
  if (request.destination === 'image') {
    event.respondWith(cacheFirstStrategy(request));
    return;
  }

  // Scripts and styles - Cache first
  if (request.destination === 'script' || request.destination === 'style') {
    event.respondWith(cacheFirstStrategy(request));
    return;
  }

  // Pages - Stale while revalidate
  event.respondWith(staleWhileRevalidateStrategy(request));
});

// Cache First Strategy - Silent error handling
async function cacheFirstStrategy(request) {
  try {
    const cache = await caches.open(CACHE_NAME);
    const cached = await cache.match(request);
    
    if (cached) {
      return cached;
    }

    const response = await fetch(request);
    if (response.ok && response.status < 400) {
      cache.put(request, response.clone()).catch(() => {});
    }
    return response;
  } catch (error) {
    // Silent fallback - no console output
    const cache = await caches.open(CACHE_NAME);
    const cached = await cache.match(request);
    if (cached) {
      return cached;
    }
    return new Response('', { 
      status: 408,
      statusText: 'Request Timeout'
    });
  }
}

// Network First Strategy - Silent error handling
async function networkFirstStrategy(request) {
  try {
    const cache = await caches.open(CACHE_NAME);
    
    const response = await fetch(request);
    if (response.ok && response.status < 400) {
      cache.put(request, response.clone()).catch(() => {});
    }
    return response;
  } catch (error) {
    // Silent fallback - try cache
    try {
      const cache = await caches.open(CACHE_NAME);
      const cached = await cache.match(request);
      if (cached) {
        return cached;
      }
    } catch (cacheError) {
      // Silent fail
    }
    
    return new Response(JSON.stringify({ offline: true }), {
      headers: { 'Content-Type': 'application/json' },
      status: 200
    });
  }
}

// Stale While Revalidate Strategy - Silent error handling
async function staleWhileRevalidateStrategy(request) {
  try {
    const cache = await caches.open(CACHE_NAME);
    const cached = await cache.match(request);

    // Always return cached if available, then fetch in background
    if (cached) {
      fetch(request).then((response) => {
        if (response.ok && response.status < 400) {
          cache.put(request, response.clone()).catch(() => {});
        }
      }).catch(() => {});
      return cached;
    }

    // No cache, try network
    const response = await fetch(request);
    if (response.ok && response.status < 400) {
      cache.put(request, response.clone()).catch(() => {});
    }
    return response;
  } catch (error) {
    // Silent fallback
    try {
      return await fetch(request);
    } catch (fetchError) {
      return new Response('', { 
        status: 408,
        statusText: 'Request Timeout'
      });
    }
  }
}

// Background sync for offline actions
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-data') {
    event.waitUntil(syncOfflineData());
  }
});

async function syncOfflineData() {
  try {
    const db = await openDB();
    const pendingActions = await db.getAll('pending-actions');
    
    for (const action of pendingActions) {
      try {
        await fetch(action.url, {
          method: action.method,
          headers: action.headers,
          body: action.body
        });
        await db.delete('pending-actions', action.id);
      } catch (error) {
        // Silent fail
      }
    }
  } catch (error) {
    // Silent fail
  }
}

// Push notifications
self.addEventListener('push', (event) => {
  const data = event.data ? event.data.json() : {};
  const options = {
    body: data.body || 'New notification',
    icon: '/src/assets/logo/Gemini_Generated_Image_6gbu966gbu966gbu.ico',
    badge: '/src/assets/logo/Gemini_Generated_Image_6gbu966gbu966gbu.ico',
    vibrate: [200, 100, 200],
    data: data,
    actions: data.actions || []
  };

  event.waitUntil(
    self.registration.showNotification(data.title || 'Garden TVET', options)
  );
});

// Notification click handler
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  event.waitUntil(
    clients.openWindow(event.notification.data.url || '/')
  );
});

// IndexedDB helper
function openDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('garden-tvet-db', 1);
    
    request.onerror = () => {};
    request.onsuccess = () => resolve(request.result);
    
    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      if (!db.objectStoreNames.contains('pending-actions')) {
        db.createObjectStore('pending-actions', { keyPath: 'id', autoIncrement: true });
      }
    };
  });
}
