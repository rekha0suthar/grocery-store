import { useState, useCallback, useRef } from 'react';
import { apiCache } from '../utils/cache.js';

export const useQuotaFriendlyPagination = (fetchFunction, options = {}) => {
  const {
    limit = 5,
    cacheKey = 'default',
    cacheTTL = 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus = false,
    refetchOnReconnect = false
  } = options;

  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [hasNext, setHasNext] = useState(true);
  const [hasPrev, setHasPrev] = useState(false);
  const [quotaExceeded, setQuotaExceeded] = useState(false);
  
  const cursors = useRef([]); // Stack of cursors for prev/next navigation
  const currentCursor = useRef(null);

  const getCacheKey = useCallback((cursor) => {
    return `${cacheKey}:${limit}:${cursor || 'first'}`;
  }, [cacheKey, limit]);

  const fetchPage = useCallback(async (cursor = null, direction = 'next') => {
    const key = getCacheKey(cursor);
    
    // Check cache first
    const cached = apiCache.get(key);
    if (cached && !quotaExceeded) {
      console.log('Cache hit for pagination');
      return cached;
    }

    setLoading(true);
    setError(null);

    try {
      const result = await fetchFunction({
        limit,
        cursor,
        ...options.params
      });

      // Handle quota exceeded response
      if (result.quotaExceeded || result.error?.includes('quota exceeded')) {
        setQuotaExceeded(true);
        setError('Service temporarily unavailable due to high demand. Please try again later.');
        return { items: [], hasNext: false, hasPrev: false };
      }

      // Cache the result
      apiCache.set(key, result);

      return result;
    } catch (err) {
      if (err.message?.includes('quota exceeded') || err.message?.includes('503')) {
        setQuotaExceeded(true);
        setError('Service temporarily unavailable due to high demand. Please try again later.');
        return { items: [], hasNext: false, hasPrev: false };
      }
      
      setError(err.message || 'Failed to fetch data');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [fetchFunction, limit, getCacheKey, options.params, quotaExceeded]);

  const loadFirst = useCallback(async () => {
    cursors.current = [];
    currentCursor.current = null;
    
    const result = await fetchPage(null, 'first');
    
    setData(result.items || []);
    setHasNext(result.hasNext || false);
    setHasPrev(false);
    setQuotaExceeded(false);
    
    return result;
  }, [fetchPage]);

  const loadNext = useCallback(async () => {
    if (!hasNext || loading || quotaExceeded) return;
    
    const result = await fetchPage(currentCursor.current, 'next');
    
    if (result.lastDoc) {
      cursors.current.push(currentCursor.current);
      currentCursor.current = result.lastDoc;
    }
    
    setData(prev => [...prev, ...(result.items || [])]);
    setHasNext(result.hasNext || false);
    setHasPrev(true);
    
    return result;
  }, [fetchPage, hasNext, loading, quotaExceeded]);

  const loadPrev = useCallback(async () => {
    if (!hasPrev || loading || quotaExceeded) return;
    
    // Go back to previous cursor
    const prevCursor = cursors.current.pop();
    currentCursor.current = prevCursor || null;
    
    const result = await fetchPage(currentCursor.current, 'prev');
    
    setData(result.items || []);
    setHasNext(result.hasNext || false);
    setHasPrev(cursors.current.length > 0);
    
    return result;
  }, [fetchPage, hasPrev, loading, quotaExceeded]);

  const refresh = useCallback(async () => {
    // Clear cache and reload
    apiCache.clear();
    setQuotaExceeded(false);
    setError(null);
    return loadFirst();
  }, [loadFirst]);

  const reset = useCallback(() => {
    setData([]);
    setLoading(false);
    setError(null);
    setHasNext(true);
    setHasPrev(false);
    setQuotaExceeded(false);
    cursors.current = [];
    currentCursor.current = null;
  }, []);

  return {
    data,
    loading,
    error,
    hasNext,
    hasPrev,
    quotaExceeded,
    loadFirst,
    loadNext,
    loadPrev,
    refresh,
    reset
  };
}; 