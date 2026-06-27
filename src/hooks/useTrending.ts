import { useState, useEffect } from 'react';
import { Script } from '../types/script';
import { fetchScriptBlox } from '../api/scriptblox';
import { fetchRscripts } from '../api/rscripts';
import { mergeResults } from '../utils/mergeResults';

export function useTrending() {
  const [data, setData] = useState<Script[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    async function load() {
      try {
        setLoading(true);
        const [sb, rs] = await Promise.all([
          fetchScriptBlox({ trending: true, max: 10 }).catch(() => []),
          fetchRscripts({ orderBy: 'views', page: 1 }).catch(() => [])
        ]);

        if (active) {
          const merged = mergeResults(rs, sb).slice(0, 10);
          setData(merged);
          setError(null);
        }
      } catch (err: any) {
        if (active) {
          setError(err.message || 'Failed to fetch trending scripts');
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    load();
    return () => {
      active = false;
    };
  }, []);

  return { data, loading, error };
}
