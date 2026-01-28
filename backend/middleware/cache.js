const NodeCache = require('node-cache');

const cache = new NodeCache({
  stdTTL: 600,
  checkperiod: 120,
  useClones: false,
  deleteOnExpire: true,
  maxKeys: 1000
});

const createCacheKey = (req) => {
  const query = JSON.stringify(req.query || {});
  const params = JSON.stringify(req.params || {});
  const user = req.user ? req.user.id : 'guest';
  return `${req.path}:${query}:${params}:${user}`;
};

const cacheMiddleware = (duration = 300) => {
  return (req, res, next) => {
    if (req.method !== 'GET') {
      return next();
    }
    
    const key = createCacheKey(req);
    const cachedResponse = cache.get(key);
    
    if (cachedResponse) {
      console.log(`✅ Cache HIT: ${key.substring(0, 50)}`);
      return res.json(cachedResponse);
    }
    
    console.log(`❌ Cache MISS: ${key.substring(0, 50)}`);
    
    const originalJson = res.json.bind(res);
    
    res.json = (data) => {
      cache.set(key, data, duration);
      return originalJson(data);
    };
    
    next();
  };
};

const invalidateCache = (pattern) => {
  const keys = cache.keys();
  const matchedKeys = keys.filter(key => key.includes(pattern));
  matchedKeys.forEach(key => cache.del(key));
  console.log(`🗑️  Invalidated ${matchedKeys.length} cache entries for pattern: ${pattern}`);
  return matchedKeys.length;
};

const clearAllCache = () => {
  cache.flushAll();
  console.log('🗑️  All cache cleared');
};

const getCacheStats = () => {
  return {
    keys: cache.keys().length,
    hits: cache.getStats().hits,
    misses: cache.getStats().misses,
    ksize: cache.getStats().ksize,
    vsize: cache.getStats().vsize
  };
};

module.exports = {
  cache,
  cacheMiddleware,
  invalidateCache,
  clearAllCache,
  getCacheStats,
  createCacheKey
};
