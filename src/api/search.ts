import { Script } from '../types/script';
import { fetchRscripts } from './rscripts';
import { fetchScriptBlox } from './scriptblox';
import { mergeResults } from '../utils/mergeResults';
import { sortResults } from '../utils/sortResults';

/**
 * Searches both Rscripts.net and ScriptBlox APIs, combines results, removes duplicates, and sorts them.
 */
export async function searchAllScripts(
  query: string,
  options: {
    page?: number;
    verified?: boolean;
    universal?: boolean;
    key?: boolean;
    patched?: boolean;
    sortBy?: 'relevance' | 'views' | 'likes' | 'newest';
  } = {}
): Promise<Script[]> {
  const page = options.page || 1;

  // Fire both requests in parallel for maximum speed!
  const [rscriptsRes, scriptbloxRes] = await Promise.all([
    fetchRscripts({
      page,
      search: query,
      orderBy: options.sortBy === 'views' ? 'views' : options.sortBy === 'likes' ? 'likes' : 'date'
    }).catch(() => [] as Script[]), // recover silently

    fetchScriptBlox({
      page,
      search: query,
      verified: options.verified,
      universal: options.universal,
      key: options.key,
      patched: options.patched,
      sortBy: options.sortBy === 'views' ? 'views' : options.sortBy === 'likes' ? 'likes' : 'createdAt'
    }).catch(() => [] as Script[]) // recover silently
  ]);

  // Combine and deduplicate
  let combined = mergeResults(rscriptsRes, scriptbloxRes);

  // Apply filters that may not be supported directly by both APIs
  if (options.verified !== undefined) {
    combined = combined.filter(s => s.verified === options.verified);
  }
  if (options.universal !== undefined) {
    combined = combined.filter(s => s.universal === options.universal);
  }
  if (options.key !== undefined) {
    combined = combined.filter(s => s.key === options.key);
  }

  // Sort by relevance / specified criteria
  return sortResults(combined, query, options.sortBy || 'relevance');
}
