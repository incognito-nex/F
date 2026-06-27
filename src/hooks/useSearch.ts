import { useState, useEffect, useRef, useCallback } from 'react';
import { Script } from '../types/script';
import { fetchRscripts } from '../api/rscripts';
import { fetchScriptBlox } from '../api/scriptblox';
import { mergeResults } from '../utils/mergeResults';
import { sortResults } from '../utils/sortResults';
import { sanitizeQuery } from '../utils/sanitizeQuery';

interface SearchFilters {
  verified?: boolean;
  universal?: boolean;
  key?: boolean;
  patched?: boolean;
  sortBy?: 'relevance' | 'views' | 'likes' | 'newest';
}

export function useSearch(query: string, filters: SearchFilters = {}, page: number = 1) {
  const [loading, setLoading] = useState(false);
  const [rscriptsError, setRscriptsError] = useState<string | null>(null);
  const [scriptbloxError, setScriptbloxError] = useState<string | null>(null);
  const [results, setResults] = useState<Script[]>([]);
  const [suggestions, setSuggestions] = useState<Script[]>([]);
  const [retryCounter, setRetryCounter] = useState(0);

  const mainControllerRef = useRef<AbortController | null>(null);
  const suggestionsControllerRef = useRef<AbortController | null>(null);

  const forceRetry = useCallback(() => {
    setRetryCounter(prev => prev + 1);
  }, []);

  const retryRscripts = useCallback(() => {
    setRscriptsError(null);
    setRetryCounter(prev => prev + 1);
  }, []);

  const retryScriptBlox = useCallback(() => {
    setScriptbloxError(null);
    setRetryCounter(prev => prev + 1);
  }, []);

  // Suggestions search (instant debounce/live matching)
  useEffect(() => {
    const sanitizedQueryText = sanitizeQuery(query);
    if (!sanitizedQueryText) {
      setSuggestions([]);
      return;
    }

    if (suggestionsControllerRef.current) {
      suggestionsControllerRef.current.abort();
    }
    const controller = new AbortController();
    suggestionsControllerRef.current = controller;

    const timeout = setTimeout(async () => {
      try {
        const [rs, sb] = await Promise.all([
          fetchRscripts({ page: 1, search: sanitizedQueryText, signal: controller.signal }).catch(() => []),
          fetchScriptBlox({ page: 1, search: sanitizedQueryText, signal: controller.signal }).catch(() => [])
        ]);
        const merged = mergeResults(rs, sb);
        const sorted = sortResults(merged, sanitizedQueryText, 'relevance');
        setSuggestions(sorted.slice(0, 5));
      } catch (err: any) {
        if (err.name !== 'AbortError') {
          console.warn('[Suggestions] fetch failed:', err);
        }
      }
    }, 150);

    return () => {
      clearTimeout(timeout);
      controller.abort();
    };
  }, [query]);

  // Main debounced search results fetch
  useEffect(() => {
    const sanitizedQueryText = sanitizeQuery(query);

    if (!sanitizedQueryText && Object.keys(filters).length === 0) {
      setResults([]);
      setLoading(false);
      setRscriptsError(null);
      setScriptbloxError(null);
      return;
    }

    if (mainControllerRef.current) {
      mainControllerRef.current.abort();
    }
    const controller = new AbortController();
    mainControllerRef.current = controller;

    setLoading(true);

    const debounceTimeout = setTimeout(async () => {
      let rscriptsRes: Script[] = [];
      let scriptbloxRes: Script[] = [];
      let rError: string | null = null;
      let sError: string | null = null;

      try {
        rscriptsRes = await fetchRscripts({
          page,
          search: sanitizedQueryText,
          orderBy: filters.sortBy === 'views' ? 'views' : filters.sortBy === 'likes' ? 'likes' : 'date',
          signal: controller.signal
        });
        setRscriptsError(null);
      } catch (err: any) {
        if (err.name === 'AbortError') return;
        rError = err.message || 'Unable to connect to Rscripts.';
        setRscriptsError(rError);
      }

      try {
        scriptbloxRes = await fetchScriptBlox({
          page,
          search: sanitizedQueryText,
          verified: filters.verified,
          universal: filters.universal,
          key: filters.key,
          patched: filters.patched,
          sortBy: filters.sortBy === 'views' ? 'views' : filters.sortBy === 'likes' ? 'likes' : 'createdAt',
          signal: controller.signal
        });
        setScriptbloxError(null);
      } catch (err: any) {
        if (err.name === 'AbortError') return;
        sError = err.message || 'Unable to connect to ScriptBlox.';
        setScriptbloxError(sError);
      }

      if (!controller.signal.aborted) {
        let combined = mergeResults(rscriptsRes, scriptbloxRes);

        // Log active filters
        console.log('[useSearch DevLog] Active filters:', filters);
        console.log('[useSearch DevLog] Array size before client filtering:', combined.length);

        // Apply client-side filters
        if (filters.verified !== undefined) {
          combined = combined.filter(s => s.verified === filters.verified);
          console.log(`[useSearch DevLog] Array size after 'verified' filter (${filters.verified}):`, combined.length);
        }
        if (filters.universal !== undefined) {
          combined = combined.filter(s => s.universal === filters.universal);
          console.log(`[useSearch DevLog] Array size after 'universal' filter (${filters.universal}):`, combined.length);
        }
        if (filters.key !== undefined) {
          // If filters.key is true, it means the user checked "No Key Required" (key === false)
          // If filters.key is false, it means they want "Key Required" (key === true)
          // Let's adjust this logic to match the expected checkbox "No Key Required" label.
          combined = combined.filter(s => s.key === !filters.key);
          console.log(`[useSearch DevLog] Array size after 'key' filter (No Key = ${filters.key}):`, combined.length);
        }

        // 4. Console.log the final array after filtering
        console.log('[useSearch DevLog] Final array after all filtering:', combined);

        const sorted = sortResults(combined, sanitizedQueryText, filters.sortBy || 'relevance');
        setResults(sorted);
        setLoading(false);
      }
    }, 300); // 300ms debounce

    return () => {
      clearTimeout(debounceTimeout);
      controller.abort();
    };
  }, [query, JSON.stringify(filters), page, retryCounter]);

  return {
    loading,
    rscriptsError,
    scriptbloxError,
    results,
    suggestions,
    retryRscripts,
    retryScriptBlox,
    forceRetry
  };
}
