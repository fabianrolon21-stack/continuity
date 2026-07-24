// ═══════════════════════════════════════════════
// CONTEXT CACHE (Package 45)
// TTL-based cache for expensive context builders.
// Prevents redundant database queries within a
// 30-second window.
// ═══════════════════════════════════════════════

const DEFAULT_TTL = 30000; // 30 seconds

const _cache = new Map();
let _cacheHits = 0;
let _cacheMisses = 0;

export function getCached(name, ttl = DEFAULT_TTL) {
  const entry = _cache.get(name);
  if (!entry) {
    _cacheMisses++;
    return null;
  }
  if (Date.now() - entry.timestamp > ttl) {
    _cache.delete(name);
    _cacheMisses++;
    return null;
  }
  _cacheHits++;
  return entry.value;
}

export function setCached(name, value) {
  _cache.set(name, { value, timestamp: Date.now() });
}

export function invalidate(name) {
  _cache.delete(name);
}

export function invalidateAll() {
  _cache.clear();
}

export function getCacheStats() {
  return {
    hits: _cacheHits,
    misses: _cacheMisses,
    size: _cache.size,
    hitRate: _cacheHits + _cacheMisses > 0
      ? Math.round((_cacheHits / (_cacheHits + _cacheMisses)) * 100) / 100
      : 0,
  };
}

export function resetCacheStats() {
  _cacheHits = 0;
  _cacheMisses = 0;
}