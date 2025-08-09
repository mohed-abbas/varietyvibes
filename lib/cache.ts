// Simple in-memory cache for server-side operations
interface CacheEntry<T> {
  data: T
  timestamp: number
  ttl: number
}

class SimpleCache {
  private cache = new Map<string, CacheEntry<any>>()

  set<T>(key: string, data: T, ttlSeconds: number = 300): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl: ttlSeconds * 1000
    })
  }

  get<T>(key: string): T | null {
    const entry = this.cache.get(key)
    
    if (!entry) {
      return null
    }

    // Check if expired
    if (Date.now() - entry.timestamp > entry.ttl) {
      this.cache.delete(key)
      return null
    }

    return entry.data
  }

  delete(key: string): void {
    this.cache.delete(key)
  }

  clear(): void {
    this.cache.clear()
  }

  // Clean up expired entries
  cleanup(): void {
    const now = Date.now()
    for (const [key, entry] of this.cache.entries()) {
      if (now - entry.timestamp > entry.ttl) {
        this.cache.delete(key)
      }
    }
  }
}

// Global cache instance
export const cache = new SimpleCache()

// Cache utility functions
export async function getCachedOrFetch<T>(
  key: string,
  fetcher: () => Promise<T>,
  ttlSeconds: number = 300
): Promise<T> {
  // Try to get from cache first
  const cached = cache.get<T>(key)
  if (cached !== null) {
    return cached
  }

  // If not in cache, fetch and store
  try {
    const data = await fetcher()
    cache.set(key, data, ttlSeconds)
    return data
  } catch (error) {
    console.error(`Error fetching data for key ${key}:`, error)
    throw error
  }
}

// Cache keys
export const CACHE_KEYS = {
  ALL_POSTS: 'blog:posts:all',
  ALL_CATEGORIES: 'blog:categories:all',
  FEATURED_POSTS: 'blog:posts:featured',
  LATEST_POSTS: (limit: number) => `blog:posts:latest:${limit}`,
  POSTS_BY_CATEGORY: (slug: string) => `blog:posts:category:${slug}`,
  CATEGORY_BY_SLUG: (slug: string) => `blog:category:${slug}`,
  POST_BY_SLUG: (slug: string) => `blog:post:${slug}`,
  ALL_TAGS: 'blog:tags:all',
  SITE_STATS: 'site:stats'
}

// Cache TTL in seconds
export const CACHE_TTL = {
  SHORT: 60,      // 1 minute
  MEDIUM: 300,    // 5 minutes  
  LONG: 900,      // 15 minutes
  VERY_LONG: 3600 // 1 hour
}

// Clean up expired entries every 5 minutes
setInterval(() => {
  cache.cleanup()
}, 5 * 60 * 1000)