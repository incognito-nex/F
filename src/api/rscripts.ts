import { RscriptsResponse, RscriptsScript } from '../types/rscripts';
import { Script } from '../types/script';
import { MOCK_SCRIPTS } from '../data/mockScripts';
import { cache } from '../utils/cache';

const BASE_URL = 'https://rscripts.net/api/v2';

function normalizeRscript(s: RscriptsScript): Script {
  return {
    id: `rs-${s._id || s.slug}`,
    title: s.title,
    description: s.description || 'No description provided.',
    gameName: s.game?.name || 'Universal',
    gameImage: s.game?.imageUrl || 'https://images.unsplash.com/photo-1614741118887-7a4ee193a5fa?w=400&q=80',
    image: s.image || s.game?.imageUrl || 'https://images.unsplash.com/photo-1614741118887-7a4ee193a5fa?w=400&q=80',
    verified: s.verified || false,
    universal: s.universal || false,
    key: s.keyRequired || false,
    views: s.views || 0,
    likes: s.likes || 0,
    updatedAt: s.updatedAt || new Date().toISOString(),
    source: 'Rscripts',
    script: s.script || `-- Code for ${s.title}`
  };
}

export async function fetchRscripts(options: {
  page?: number;
  orderBy?: 'date' | 'views' | 'likes';
  sort?: 'asc' | 'desc';
  search?: string;
} = {}): Promise<Script[]> {
  const page = options.page || 1;
  const orderBy = options.orderBy || 'date';
  const sort = options.sort || 'desc';
  const search = options.search || '';

  const cacheKey = `rscripts-${page}-${orderBy}-${sort}-${search}`;
  const cachedData = cache.get<Script[]>(cacheKey);
  if (cachedData) return cachedData;

  try {
    const url = new URL(`${BASE_URL}/scripts`);
    url.searchParams.set('page', page.toString());
    url.searchParams.set('orderBy', orderBy);
    url.searchParams.set('sort', sort);
    if (search) {
      url.searchParams.set('q', search);
    }

    const controller = new AbortController();
    const id = setTimeout(() => controller.abort(), 3500); // Fail fast to activate mock sandbox

    const response = await fetch(url.toString(), { signal: controller.signal });
    clearTimeout(id);

    if (!response.ok) throw new Error('Rscripts API status error');

    const json = (await response.json()) as RscriptsResponse;
    if (json.success && json.data) {
      const normalized = json.data.map(normalizeRscript);
      cache.set(cacheKey, normalized);
      return normalized;
    }
    throw new Error('Rscripts API format failure');
  } catch (err) {
    // CORS, timeout, or DNS issues -> return premium mock sandbox scripts
    // Filter & sort mock scripts corresponding to Rscripts
    let filtered = MOCK_SCRIPTS.filter(s => s.source === 'Rscripts');
    
    if (search) {
      const q = search.toLowerCase();
      filtered = filtered.filter(s => 
        s.title.toLowerCase().includes(q) || 
        s.description?.toLowerCase().includes(q) ||
        s.gameName.toLowerCase().includes(q)
      );
    }

    if (orderBy === 'views') {
      filtered.sort((a, b) => b.views - a.views);
    } else if (orderBy === 'likes') {
      filtered.sort((a, b) => (b.likes || 0) - (a.likes || 0));
    } else {
      filtered.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
    }

    if (sort === 'asc') {
      filtered.reverse();
    }

    // Paginate mock data (limit to 6 per page)
    const limit = 6;
    const startIndex = (page - 1) * limit;
    const paginated = filtered.slice(startIndex, startIndex + limit);

    cache.set(cacheKey, paginated);
    return paginated;
  }
}
