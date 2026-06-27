import { useState, useEffect } from 'react';
import { Script } from '../types/script';
import { fetchRscripts } from '../api/rscripts';
import { fetchScriptBlox } from '../api/scriptblox';
import { mergeResults } from '../utils/mergeResults';

interface ScriptsState {
  data: Script[];
  loading: boolean;
  error: string | null;
}

export function useScriptsCategory(category: 'trending' | 'recent' | 'popular' | 'verified' | 'universal' | 'recommended') {
  const [state, setState] = useState<ScriptsState>({
    data: [],
    loading: true,
    error: null,
  });

  useEffect(() => {
    let active = true;
    setState(s => ({ ...s, loading: true, error: null }));

    async function load() {
      try {
        let scripts: Script[] = [];

        if (category === 'trending') {
          // Fetch trending scripts from scriptblox + rscripts popular
          const [sb, rs] = await Promise.all([
            fetchScriptBlox({ trending: true, max: 8 }).catch(() => []),
            fetchRscripts({ orderBy: 'likes', page: 1 }).catch(() => [])
          ]);
          scripts = mergeResults(rs, sb).slice(0, 8);
        } else if (category === 'recent') {
          // Recently added scripts
          const [sb, rs] = await Promise.all([
            fetchScriptBlox({ sortBy: 'createdAt', max: 8 }).catch(() => []),
            fetchRscripts({ orderBy: 'date', page: 1 }).catch(() => [])
          ]);
          scripts = mergeResults(rs, sb).slice(0, 8);
        } else if (category === 'popular') {
          // Most Popular
          const [sb, rs] = await Promise.all([
            fetchScriptBlox({ sortBy: 'views', max: 8 }).catch(() => []),
            fetchRscripts({ orderBy: 'views', page: 1 }).catch(() => [])
          ]);
          scripts = mergeResults(rs, sb).slice(0, 8);
        } else if (category === 'verified') {
          // Only verified
          const [sb, rs] = await Promise.all([
            fetchScriptBlox({ verified: true, max: 8 }).catch(() => []),
            fetchRscripts({ orderBy: 'date' }).catch(() => [])
          ]);
          scripts = mergeResults(rs.filter(s => s.verified), sb).slice(0, 8);
        } else if (category === 'universal') {
          // Only Universal
          const [sb, rs] = await Promise.all([
            fetchScriptBlox({ universal: true, max: 8 }).catch(() => []),
            fetchRscripts({ orderBy: 'views' }).catch(() => [])
          ]);
          scripts = mergeResults(rs.filter(s => s.universal), sb).slice(0, 8);
        } else {
          // Recommended
          const [sb, rs] = await Promise.all([
            fetchScriptBlox({ sortBy: 'likes', max: 8 }).catch(() => []),
            fetchRscripts({ orderBy: 'likes' }).catch(() => [])
          ]);
          scripts = mergeResults(rs, sb).sort(() => 0.5 - Math.random()).slice(0, 8);
        }

        if (active) {
          setState({ data: scripts, loading: false, error: null });
        }
      } catch (err: any) {
        if (active) {
          setState({ data: [], loading: false, error: err.message || 'Failed to fetch scripts.' });
        }
      }
    }

    load();
    return () => {
      active = false;
    };
  }, [category]);

  return state;
}
