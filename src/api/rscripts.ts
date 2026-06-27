import { RscriptsResponse, RscriptsScript } from '../types/rscripts';
import { Script } from '../types/script';
import { fetchWithRetry } from '../utils/fetchWithRetry';
import { sanitizeQuery } from '../utils/sanitizeQuery';

function normalizeRscript(s: RscriptsScript): Script {
  if (!s) return {} as Script;
  return {
    id: `rs-${s._id || s.slug || Math.random().toString(36).substring(2, 9)}`,
    title: s.title || 'Untitled Rscripts Script',
    description: s.description || 'No description provided.',
    gameName: s.game?.name || 'Universal',
    gameImage: s.game?.imageUrl || 'https://images.unsplash.com/photo-1614741118887-7a4ee193a5fa?w=400&q=80',
    image: s.image || s.game?.imageUrl || 'https://images.unsplash.com/photo-1614741118887-7a4ee193a5fa?w=400&q=80',
    verified: s.verified || false,
    universal: s.universal || false,
    key: s.keyRequired || false,
    views: Number(s.views) || 0,
    likes: Number(s.likes) || 0,
    updatedAt: s.updatedAt || s.createdAt || new Date().toISOString(),
    source: 'Rscripts',
    script: s.script || `-- Code for ${s.title || 'Script'}`
  };
}

export async function fetchRscripts(
  options: {
    page?: number;
    orderBy?: 'date' | 'views' | 'likes';
    sort?: 'asc' | 'desc';
    search?: string;
    signal?: AbortSignal;
  } = {}
): Promise<Script[]> {
  const page = options.page || 1;
  const orderBy = options.orderBy || 'date';
  const sort = options.sort || 'desc';
  const rawSearch = options.search || '';
  const search = sanitizeQuery(rawSearch);

  const cacheKey = `rscripts-${page}-${orderBy}-${sort}-${search}`;

  // Build relative query path cleanly
  const params = new URLSearchParams();
  params.set('page', page.toString());
  params.set('orderBy', orderBy);
  params.set('sort', sort);
  if (search) {
    params.set('q', search);
  }

  const url = `/api/rscripts/scripts?${params.toString()}`;

  try {
    const json = await fetchWithRetry<any>(url, {
      cacheKey,
      signal: options.signal,
      timeout: 15000,
      retries: 1,
    });

    // 1. Verify the response from each API is actually reaching React
    console.log(`[Frontend Rscripts DevLog] Raw JSON response reached React successfully. Keys:`, Object.keys(json));

    // Support multiple format alternatives for absolute safety
    let scriptsArray: RscriptsScript[] = [];
    if (json.data && Array.isArray(json.data)) {
      scriptsArray = json.data;
    } else if (json.scripts && Array.isArray(json.scripts)) {
      scriptsArray = json.scripts;
    } else if (Array.isArray(json)) {
      scriptsArray = json;
    } else if (json.success && json.data && Array.isArray(json.data)) {
      scriptsArray = json.data;
    }

    // 2. Console.log the normalized array immediately after mapping
    const normalized = scriptsArray.map(normalizeRscript);
    console.log(`[Frontend Rscripts DevLog] Normalized Rscripts array (${normalized.length} items):`, normalized);

    return normalized;
  } catch (err: any) {
    if (err.name === 'AbortError' || options.signal?.aborted) {
      throw err;
    }
    console.error('[Frontend Rscripts DevLog] Fetch failed with error:', err);
    throw err;
  }
}
