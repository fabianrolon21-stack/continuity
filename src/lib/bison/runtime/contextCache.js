// ═══════════════════════════════════════════════
// CONTEXT CACHE (Package 45 + Part VI)
// TTL-based cache for expensive context builders.
// Tracks hits, misses, and evictions.
// All metrics reported to RuntimeAuthority.
// ═══════════════════════════════════════════════

import { recordCacheHit, recordCacheMiss, recordCacheEviction } from './runtimeAuthority';

const DEFAULT_TTL = 30000; // 30 seconds

const _cache = new Map();
let _cacheHits = 0;
let _cacheMisses = 0;
let _cacheEvictions = 0;

export function getCached(name, ttl = DEFAULT_TTL) {
  const entry = _cache.get(name);
  if (!entry) {
    _cacheMisses++;
    recordCacheMiss();
    return null;
  }
  if (Date.now() - entry.timestamp > ttl) {
    _cache.delete(name);
    _cacheEvictions++;
    recordCacheEviction();
    _cacheMisses++;
    recordCacheMiss();
    return null;
  }
  _cacheHits++;
  recordCacheHit();
  return entry.value;
}

export function setCached(name, value) {
  _cache.set(name, { value, timestamp: Date.now() });
}

export function invalidate(name) {
  if (_cache.has(name)) {
    _cache.delete(name);
    _cacheEvictions++;
    recordCacheEviction();
  }
}

export function invalidateAll() {
  const count = _cache.size;
  _cache.clear();
  _cacheEvictions += count;
  for (let i = 0; i < count; i++) recordCacheEviction();
}

export function getCacheStats() {
  return {
    hits: _cacheHits,
    misses: _cacheMisses,
    evictions: _cacheEvictions,
    size: _cache.size,
    hitRate: _cacheHits + _cacheMisses > 0
      ? Math.round((_cacheHits / (_cacheHits + _cacheMisses)) * 100) / 100
      : 0,
  };
}

export function resetCacheStats() {
  _cacheHits = 0;
  _cacheMisses = 0;
  _cacheEvictions = 0;
}