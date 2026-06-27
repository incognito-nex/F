import { ScriptBloxResponse, ScriptBloxDoc } from '../types/scriptblox';
import { Script } from '../types/script';
import { fetchWithRetry } from '../utils/fetchWithRetry';
import { sanitizeQuery } from '../utils/sanitizeQuery';

function normalizeScriptBlox(doc: ScriptBloxDoc): Script {
  if (!doc) return {} as Script;
  const gameImageUrl = doc.game?.imageUrl;
  const imageUrl = gameImageUrl && gameImageUrl.startsWith('/')
    ? `https://scriptblox.com${gameImageUrl}`
    : gameImageUrl || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=400&q=80';

  return {
    id: `sb-${doc._id || doc.slug || Math.random().toString(36).substring(2, 9)}`,
    title: doc.title || 'Untitled ScriptBlox Script',
    description: doc.features || 'A powerful Roblox script loaded from ScriptBlox.',
    gameName: doc.game?.name || 'Universal',
    gameImage: imageUrl,
    image: imageUrl,
    verified: doc.verified || false,
    universal: doc.game?.name?.toLowerCase().includes('universal') || false,
    key: doc.key || false,
    views: Number(doc.views) || 0,
    likes: Number(doc.likeCount) || 0,
    updatedAt: doc.updatedAt || doc.createdAt || new Date().toISOString(),
    source: 'ScriptBlox',
    script: doc.script || `-- Loader for ${doc.title || 'Script'}`
  };
}

export async function fetchScriptBlox(
  options: {
    page?: number;
    max?: number;
    verified?: boolean;
    patched?: boolean;
    universal?: boolean;
    key?: boolean;
    search?: string;
    sortBy?: 'views' | 'likes' | 'createdAt';
    order?: 'desc' | 'asc';
    trending?: boolean;
    signal?: AbortSignal;
  } = {}
): Promise<Script[]> {
  const page = options.page || 1;
  const max = options.max || 10;
  const rawSearch = options.search || '';
  const search = sanitizeQuery(rawSearch);
  const sortBy = options.sortBy || 'createdAt';
  const order = options.order || 'desc';

  const cacheKey = `scriptblox-${page}-${max}-${search}-${options.verified}-${options.patched}-${options.universal}-${options.key}-${options.trending}-${sortBy}-${order}`;

  // Build relative query path cleanly
  const params = new URLSearchParams();
  params.set('page', page.toString());
  params.set('max', max.toString());
  if (search) {
    params.set('q', search);
  }
  if (options.verified !== undefined) params.set('verified', options.verified.toString());
  if (options.patched !== undefined) params.set('patched', options.patched.toString());
  if (options.key !== undefined) params.set('key', options.key.toString());
  if (options.trending) params.set('trending', 'true');
  params.set('sortBy', sortBy);
  params.set('order', order);

  const url = `/api/scriptblox/fetch?${params.toString()}`;

  try {
    const json = await fetchWithRetry<any>(url, {
      cacheKey,
      signal: options.signal,
      timeout: 15000,
      retries: 1,
    });

    // 1. Verify the response from each API is actually reaching React
    console.log(`[Frontend ScriptBlox DevLog] Raw JSON response reached React successfully. Keys:`, Object.keys(json));

    // Support multiple format alternatives for absolute safety
    let docsArray: ScriptBloxDoc[] = [];
    if (json.result && json.result.docs && Array.isArray(json.result.docs)) {
      docsArray = json.result.docs;
    } else if (json.docs && Array.isArray(json.docs)) {
      docsArray = json.docs;
    } else if (json.data && Array.isArray(json.data)) {
      docsArray = json.data;
    } else if (Array.isArray(json)) {
      docsArray = json;
    }

    // 2. Console.log the normalized array immediately after mapping
    const normalized = docsArray.map(normalizeScriptBlox);
    console.log(`[Frontend ScriptBlox DevLog] Normalized ScriptBlox array (${normalized.length} items):`, normalized);

    return normalized;
  } catch (err: any) {
    if (err.name === 'AbortError' || options.signal?.aborted) {
      throw err;
    }
    console.error('[Frontend ScriptBlox DevLog] Fetch failed with error:', err);
    throw err;
  }
}
