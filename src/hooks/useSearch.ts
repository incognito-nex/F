import { useState, useEffect, useRef } from 'react';
import { Script } from '../types/script';
import { searchAllScripts } from '../api/search';

interface SearchFilters {
  verified?: boolean;
  universal?: boolean;
  key?: boolean;
  patched?: boolean;
  sortBy?: 'relevance' | 'views' | 'likes' | 'newest';
}

export function useSearch(query: string, filters: SearchFilters = {}, page: number = 1) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [results, setResults] = useState<Script[]>([]);
  const [suggestions, setSuggestions] = useState<Script[]>([]);
  const activeRequest = useRef<string>('');

  // Suggestions search (instant debounce/live matching)
  useEffect(() => {
    if (!query.trim()) {
      setSuggestions([]);
      return;
    }

    let active = true;
    const timeout = setTimeout(async () => {
      try {
        const list = await searchAllScripts(query, { page: 1 });
        if (active) {
          setSuggestions(list.slice(0, 5));
        }
      } catch {
        // quiet fail for suggestions
      }
    }, 150);

    return () => {
      active = false;
      clearTimeout(timeout);
    };
  }, [query]);

  // Main debounced search results fetch
  useEffect(() => {
    let active = true;
    const requestId = `${query}-${JSON.stringify(filters)}-${page}`;
    activeRequest.current = requestId;

    if (!query.trim() && Object.keys(filters).length === 0) {
      setResults([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    const debounceTimeout = setTimeout(async () => {
      try {
        const data = await searchAllScripts(query, {
          page,
          ...filters
        });

        if (active && activeRequest.current === requestId) {
          setResults(data);
          setLoading(false);
        }
      } catch (err: any) {
        if (active && activeRequest.current === requestId) {
          setError(err.message || 'Error executing search.');
          setLoading(false);
        }
      }
    }, 300); // 300ms debounce as requested!

    return () => {
      active = false;
      clearTimeout(debounceTimeout);
    };
  }, [query, JSON.stringify(filters), page]);

  return { loading, error, results, suggestions };
}
