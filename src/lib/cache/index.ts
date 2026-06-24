import { unstable_cache } from "next/cache";

export const CACHE_TAGS = {
  products: "products",
  navigation: "navigation",
  homepage: "homepage",
  seo: "seo",
  blog: "blog",
} as const;

export function cached<T>(
  fn: () => Promise<T>,
  keys: string[],
  options: { revalidate?: number | false; tags?: string[] } = {}
) {
  return unstable_cache(fn, keys, {
    revalidate: options.revalidate ?? 300,
    tags: options.tags,
  });
}

const memoryCache = new Map<string, { value: unknown; expiresAt: number }>();

export function getMemoryCache<T>(key: string): T | null {
  const entry = memoryCache.get(key);
  if (!entry) return null;
  if (Date.now() > entry.expiresAt) {
    memoryCache.delete(key);
    return null;
  }
  return entry.value as T;
}

export function setMemoryCache<T>(key: string, value: T, ttlSec = 300) {
  memoryCache.set(key, { value, expiresAt: Date.now() + ttlSec * 1000 });
}

export function invalidateMemoryCache(prefix?: string) {
  if (!prefix) {
    memoryCache.clear();
    return;
  }
  for (const key of memoryCache.keys()) {
    if (key.startsWith(prefix)) memoryCache.delete(key);
  }
}
