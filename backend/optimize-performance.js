const fs = require('fs');
const path = require('path');

console.log('🚀 Optimizing Performance...\n');

const cacheService = `class CacheService {
  constructor(db) {
    this.db = db;
    this.memoryCache = new Map();
  }

  async get(key) {
    if (this.memoryCache.has(key)) {
      return this.memoryCache.get(key);
    }

    const [rows] = await this.db.query(
      'SELECT cache_value FROM cache_entries WHERE cache_key = ? AND expires_at > NOW()',
      [key]
    );

    if (rows.length > 0) {
      const value = JSON.parse(rows[0].cache_value);
      this.memoryCache.set(key, value);
      return value;
    }

    return null;
  }

  async set(key, value, ttl = 3600) {
    const expiresAt = new Date(Date.now() + ttl * 1000);
    
    await this.db.query(
      'INSERT INTO cache_entries (cache_key, cache_value, expires_at) VALUES (?, ?, ?) ON DUPLICATE KEY UPDATE cache_value = ?, expires_at = ?',
      [key, JSON.stringify(value), expiresAt, JSON.stringify(value), expiresAt]
    );

    this.memoryCache.set(key, value);
  }

  async clear(pattern) {
    if (pattern) {
      await this.db.query('DELETE FROM cache_entries WHERE cache_key LIKE ?', [pattern]);
      for (const key of this.memoryCache.keys()) {
        if (key.includes(pattern.replace('%', ''))) {
          this.memoryCache.delete(key);
        }
      }
    } else {
      await this.db.query('DELETE FROM cache_entries');
      this.memoryCache.clear();
    }
  }
}

module.exports = CacheService;`;

const servicesDir = path.join(__dirname, 'services');
fs.mkdirSync(servicesDir, { recursive: true });
fs.writeFileSync(path.join(servicesDir, 'cache.js'), cacheService);

console.log('✅ Created cache service');
console.log('✨ Performance optimized!');
