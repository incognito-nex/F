import { useState, useEffect, useRef } from 'react';
import { Script } from '../types/script';
import { fetchScriptBlox } from '../api/scriptblox';
import { fetchRscripts } from '../api/rscripts';
import { mergeResults } from '../utils/mergeResults';

export function useTrending() {
  const [data, setData] = useState<Script[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const controllerRef = useRef<AbortController | null>(null);

  useEffect(() => {
    if (controllerRef.current) {
      controllerRef.current.abort();
    }
    const controller = new AbortController();
    controllerRef.current = controller;

    async function load() {
      try {
        setLoading(true);
        const signal = controller.signal;

        const [sb, rs] = await Promise.all([
          fetchScriptBlox({ trending: true, max: 10, signal }).catch(() => []),
          fetchRscripts({ orderBy: 'views', page: 1, signal }).catch(() => [])
        ]);

        if (!signal.aborted) {
          const merged = mergeResults(rs, sb).slice(0, 10);
          setData(merged);
          setError(null);
        }
      } catch (err: any) {
        if (err.name === 'AbortError' || controller.signal.aborted) {
          return;
        }
        setError(err.message || 'Failed to fetch trending scripts');
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    }

    load();
    return () => {
      controller.abort();
    };
  }, []);

  return { data, loading, error };
}
