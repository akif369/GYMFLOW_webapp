/**
 * usePresignedUrl — production-grade presigned S3 URL resolver
 *
 * Features:
 *  - In-memory LRU cache (max 200 entries) — avoids hammering the sign endpoint
 *  - Expiry tracking — auto-refreshes 60 s before the signed URL expires
 *  - Request deduplication — concurrent callers for the same key share one in-flight fetch
 *  - Graceful fallback for legacy full-URL records (returns the URL as-is)
 */

import { useState, useEffect, useRef } from 'react';
import { api } from '@/lib/api';

// ── Types ─────────────────────────────────────────────────────────────────────

interface CacheEntry {
  url: string;
  /** Unix timestamp (ms) when the URL expires */
  expiresAtMs: number;
}

// ── LRU Cache ─────────────────────────────────────────────────────────────────

const MAX_CACHE_SIZE = 200;
/** Seconds before expiry to proactively refresh (1 min safety buffer) */
const REFRESH_BEFORE_EXPIRY_SEC = 60;

/** key → CacheEntry */
const cache = new Map<string, CacheEntry>();
/** key → Promise<string> for in-flight requests (deduplication) */
const inflight = new Map<string, Promise<string>>();

function evictOldestIfNeeded() {
  if (cache.size >= MAX_CACHE_SIZE) {
    // Map preserves insertion order — first entry is oldest
    const firstKey = cache.keys().next().value;
    if (firstKey !== undefined) {
      cache.delete(firstKey);
    }
  }
}

function isEntryFresh(entry: CacheEntry): boolean {
  const bufferMs = REFRESH_BEFORE_EXPIRY_SEC * 1000;
  return Date.now() < entry.expiresAtMs - bufferMs;
}

// ── API call ──────────────────────────────────────────────────────────────────

async function fetchPresignedUrl(key: string): Promise<string> {
  const res = await api.get<{ url: string; expiresAt: string; ttl: number }>(
    '/storage/sign',
    { params: { key } },
  );
  const { url, expiresAt } = res.data;
  const expiresAtMs = new Date(expiresAt).getTime();

  evictOldestIfNeeded();
  cache.set(key, { url, expiresAtMs });
  return url;
}

/**
 * Resolve an S3 key (or legacy full URL) to a presigned URL.
 * Returns null if the key is empty/null.
 *
 * @internal — use `usePresignedUrl` instead.
 */
async function resolveUrl(key: string): Promise<string> {
  // Legacy full-URL records — return as-is (proxy route still serves them)
  if (key.startsWith('http://') || key.startsWith('https://')) {
    return key;
  }

  // Check cache first
  const cached = cache.get(key);
  if (cached && isEntryFresh(cached)) {
    return cached.url;
  }

  // Deduplicate concurrent requests for the same key
  const existing = inflight.get(key);
  if (existing) return existing;

  const promise = fetchPresignedUrl(key).finally(() => {
    inflight.delete(key);
  });
  inflight.set(key, promise);
  return promise;
}

// ── Hook ──────────────────────────────────────────────────────────────────────

interface UsePresignedUrlResult {
  url: string | null;
  loading: boolean;
  error: boolean;
}

/**
 * Resolves an S3 key to a presigned URL with automatic refresh before expiry.
 *
 * @param key  - The S3 object key stored in the DB, or null/undefined to skip.
 *
 * @example
 * const { url, loading } = usePresignedUrl(member.photoUrl);
 * <Avatar src={url ?? undefined} />
 */
export function usePresignedUrl(key: string | null | undefined): UsePresignedUrlResult {
  const [url, setUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<boolean>(false);
  const refreshTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!key) {
      setUrl(null);
      setLoading(false);
      setError(false);
      return;
    }

    let cancelled = false;

    function scheduleRefresh(expiresAtMs: number) {
      if (refreshTimerRef.current) clearTimeout(refreshTimerRef.current);
      const refreshInMs = expiresAtMs - Date.now() - REFRESH_BEFORE_EXPIRY_SEC * 1000;
      if (refreshInMs > 0) {
        refreshTimerRef.current = setTimeout(() => {
          if (!cancelled) load();
        }, refreshInMs);
      }
    }

    async function load() {
      setLoading(true);
      setError(false);
      try {
        const resolved = await resolveUrl(key!);
        if (!cancelled) {
          setUrl(resolved);
          setLoading(false);
          // Schedule auto-refresh if we have a cache entry with expiry info
          const entry = cache.get(key!);
          if (entry) scheduleRefresh(entry.expiresAtMs);
        }
      } catch (err) {
        if (!cancelled) {
          console.error('[usePresignedUrl] Failed to sign URL for key:', key, err);
          setError(true);
          setLoading(false);
        }
      }
    }

    load();

    return () => {
      cancelled = true;
      if (refreshTimerRef.current) clearTimeout(refreshTimerRef.current);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  return { url, loading, error };
}

/**
 * Prefetch presigned URLs for a batch of keys, warming the cache.
 * Call this after fetching a page of members so avatars load instantly.
 */
export async function prefetchPresignedUrls(keys: (string | null | undefined)[]): Promise<void> {
  const toFetch = keys.filter((k): k is string => !!k && !k.startsWith('http'));
  await Promise.allSettled(toFetch.map(resolveUrl));
}
