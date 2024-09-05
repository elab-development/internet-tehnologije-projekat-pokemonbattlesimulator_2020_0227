// utils/cache.js
class Cache {
    constructor(ttlSeconds) {
        this.cache = new Map();
        this.ttlSeconds = ttlSeconds;
    }

    _getCacheKey(key, model) {
        return `${model}:${key}`;
    }

    set(key, value, model) {
        const cacheKey = this._getCacheKey(key, model);
        const expirationTime = Date.now() + this.ttlSeconds * 1000;
        this.cache.set(cacheKey, { value, expirationTime });
    }

    get(key, model) {
        const cacheKey = this._getCacheKey(key, model);
        const cachedItem = this.cache.get(cacheKey);
        if (!cachedItem) return null;

        if (Date.now() > cachedItem.expirationTime) {
            this.cache.delete(cacheKey);
            return null;
        }

        return cachedItem.value;
    }

    invalidate(key, model) {
        const cacheKey = this._getCacheKey(key, model);
        this.cache.delete(cacheKey);
    }

    clear() {
        this.cache.clear();
    }
}

// Cache for 2 hours
module.exports = new Cache(60 * 60 * 2);
