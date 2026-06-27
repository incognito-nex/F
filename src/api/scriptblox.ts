import { ScriptBloxResponse, ScriptBloxDoc } from '../types/scriptblox';
import { Script } from '../types/script';
import { MOCK_SCRIPTS } from '../data/mockScripts';
import { cache } from '../utils/cache';

const BASE_URL = 'https://scriptblox.com/api';

function normalizeScriptBlox(doc: ScriptBloxDoc): Script {
  const imageUrl = doc.game.imageUrl && doc.game.imageUrl.startsWith('/')
    ? `https://scriptblox.com${doc.game.imageUrl}`
    : doc.game.imageUrl || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=400&q=80';

  return {
    id: `sb-${doc._id || doc.slug}`,
    title: doc.title,
    description: doc.features || 'A powerful Roblox script loaded from ScriptBlox.',
    gameName: doc.game.name || 'Universal',
    gameImage: imageUrl,
    image: imageUrl,
    verified: doc.verified || false,
    universal: doc.game.name?.toLowerCase().includes('universal') || false,
    key: doc.key || false,
    views: doc.views || 0,
    likes: doc.likeCount || 0,
    updatedAt: doc.updatedAt || doc.createdAt || new Date().toISOString(),
    source: 'ScriptBlox',
    script: doc.script || `-- Loader for ${doc.title}`
  };
}

export async function fetchScriptBlox(options: {
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
} = {}): Promise<Script[]> {
  const page = options.page || 1;
  const max = options.max || 20;
  const search = options.search || '';
  const sortBy = options.sortBy || 'createdAt';
  const order = options.order || 'desc';

  const cacheKey = `scriptblox-${page}-${max}-${search}-${sortBy}-${order}-${options.verified}-${options.patched}-${options.universal}-${options.key}-${options.trending}`;
  const cachedData = cache.get<Script[]>(cacheKey);
  if (cachedData) return cachedData;

  try {
    const url = new URL(`${BASE_URL}/script/fetch`);
    url.searchParams.set('page', page.toString());
    url.searchParams.set('max', max.toString());
    
    if (search) url.searchParams.set('search', search);
    if (options.verified !== undefined) url.searchParams.set('verified', options.verified.toString());
    if (options.patched !== undefined) url.searchParams.set('patched', options.patched.toString());
    if (options.key !== undefined) url.searchParams.set('key', options.key.toString());
    if (options.trending) url.searchParams.set('trending', 'true');

    // Handle sort
    url.searchParams.set('sortBy', sortBy);
    url.searchParams.set('order', order);

    const controller = new AbortController();
    const id = setTimeout(() => controller.abort(), 3500); // 3.5s timeout for fast UI fallback

    const response = await fetch(url.toString(), { signal: controller.signal });
    clearTimeout(id);

    if (!response.ok) throw new Error('ScriptBlox API status error');

    const json = (await response.json()) as ScriptBloxResponse;
    if (json.result && json.result.docs) {
      const normalized = json.result.docs.map(normalizeScriptBlox);
      cache.set(cacheKey, normalized);
      return normalized;
    }
    throw new Error('ScriptBlox API format failure');
  } catch (err) {
    // Fallback to offline premium local database on CORS or network error
    let filtered = MOCK_SCRIPTS.filter(s => s.source === 'ScriptBlox');

    if (search) {
      const q = search.toLowerCase();
      filtered = filtered.filter(s => 
        s.title.toLowerCase().includes(q) || 
        s.description?.toLowerCase().includes(q) ||
        s.gameName.toLowerCase().includes(q)
      );
    }

    if (options.verified !== undefined) {
      filtered = filtered.filter(s => s.verified === options.verified);
    }
    if (options.universal !== undefined) {
      filtered = filtered.filter(s => s.universal === options.universal);
    }
    if (options.key !== undefined) {
      filtered = filtered.filter(s => s.key === options.key);
    }

    // Sorting mock data
    if (sortBy === 'views') {
      filtered.sort((a, b) => b.views - a.views);
    } else if (sortBy === 'likes') {
      filtered.sort((a, b) => (b.likes || 0) - (a.likes || 0));
    } else {
      filtered.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
    }

    if (order === 'asc') {
      filtered.reverse();
    }

    // Paginate mock data
    const startIndex = (page - 1) * max;
    const paginated = filtered.slice(startIndex, startIndex + max);

    cache.set(cacheKey, paginated);
    return paginated;
  }
}
