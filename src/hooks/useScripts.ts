import { useState, useEffect, useRef } from 'react';
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

  const controllerRef = useRef<AbortController | null>(null);

  useEffect(() => {
    // Abort the previous request if any
    if (controllerRef.current) {
      controllerRef.current.abort();
    }
    const controller = new AbortController();
    controllerRef.current = controller;

    setState(s => ({ ...s, loading: true, error: null }));

    async function load() {
      try {
        let scripts: Script[] = [];
        const signal = controller.signal;

        console.log(`[useScriptsCategory DevLog] Initiating load for category: ${category}`);

        if (category === 'trending') {
          const [sb, rs] = await Promise.all([
            fetchScriptBlox({ trending: true, max: 8, signal }).catch(() => []),
            fetchRscripts({ orderBy: 'likes', page: 1, signal }).catch(() => [])
          ]);
          console.log('[useScriptsCategory DevLog] trending fetched size - Rscripts:', rs.length, 'ScriptBlox:', sb.length);
          scripts = mergeResults(rs, sb).slice(0, 8);
        } else if (category === 'recent') {
          const [sb, rs] = await Promise.all([
            fetchScriptBlox({ sortBy: 'createdAt', max: 8, signal }).catch(() => []),
            fetchRscripts({ orderBy: 'date', page: 1, signal }).catch(() => [])
          ]);
          console.log('[useScriptsCategory DevLog] recent fetched size - Rscripts:', rs.length, 'ScriptBlox:', sb.length);
          scripts = mergeResults(rs, sb).slice(0, 8);
        } else if (category === 'popular') {
          const [sb, rs] = await Promise.all([
            fetchScriptBlox({ sortBy: 'views', max: 8, signal }).catch(() => []),
            fetchRscripts({ orderBy: 'views', page: 1, signal }).catch(() => [])
          ]);
          console.log('[useScriptsCategory DevLog] popular fetched size - Rscripts:', rs.length, 'ScriptBlox:', sb.length);
          scripts = mergeResults(rs, sb).slice(0, 8);
        } else if (category === 'verified') {
          const [sb, rs] = await Promise.all([
            fetchScriptBlox({ verified: true, max: 8, signal }).catch(() => []),
            fetchRscripts({ orderBy: 'date', signal }).catch(() => [])
          ]);
          console.log('[useScriptsCategory DevLog] verified fetched size - Rscripts:', rs.length, 'ScriptBlox:', sb.length);
          const rsFiltered = rs.filter(s => s.verified);
          console.log('[useScriptsCategory DevLog] Rscripts size after verified filter:', rsFiltered.length);
          scripts = mergeResults(rsFiltered, sb).slice(0, 8);
        } else if (category === 'universal') {
          const [sb, rs] = await Promise.all([
            fetchScriptBlox({ universal: true, max: 8, signal }).catch(() => []),
            fetchRscripts({ orderBy: 'views', signal }).catch(() => [])
          ]);
          console.log('[useScriptsCategory DevLog] universal fetched size - Rscripts:', rs.length, 'ScriptBlox:', sb.length);
          const rsFiltered = rs.filter(s => s.universal);
          console.log('[useScriptsCategory DevLog] Rscripts size after universal filter:', rsFiltered.length);
          scripts = mergeResults(rsFiltered, sb).slice(0, 8);
        } else {
          // recommended
          const [sb, rs] = await Promise.all([
            fetchScriptBlox({ sortBy: 'likes', max: 8, signal }).catch(() => []),
            fetchRscripts({ orderBy: 'likes', signal }).catch(() => [])
          ]);
          console.log('[useScriptsCategory DevLog] recommended fetched size - Rscripts:', rs.length, 'ScriptBlox:', sb.length);
          scripts = mergeResults(rs, sb).sort(() => 0.5 - Math.random()).slice(0, 8);
        }

        // 4. Console.log the array after filtering (for Home category state)
        console.log(`[useScriptsCategory DevLog] Final category [${category}] scripts after merging and category filters:`, scripts);

        if (!signal.aborted) {
          setState({ data: scripts, loading: false, error: null });
        }
      } catch (err: any) {
        if (err.name === 'AbortError' || controller.signal.aborted) {
          return;
        }
        console.error(`[useScriptsCategory DevLog] Failed for category: ${category}`, err);
        setState({ data: [], loading: false, error: err.message || 'Failed to fetch scripts.' });
      }
    }

    load();

    return () => {
      controller.abort();
    };
  }, [category]);

  return state;
}
