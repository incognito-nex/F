import { Script } from '../types/script';

/**
 * Sorts scripts by relevance when searching or by specified categories.
 */
export function sortResults(
  scripts: Script[],
  query: string,
  sortBy: 'relevance' | 'views' | 'likes' | 'newest' = 'relevance'
): Script[] {
  const result = [...scripts];

  if (sortBy === 'views') {
    return result.sort((a, b) => b.views - a.views);
  }

  if (sortBy === 'likes') {
    return result.sort((a, b) => (b.likes || 0) - (a.likes || 0));
  }

  if (sortBy === 'newest') {
    return result.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
  }

  // Relevance Sort
  if (!query) {
    // Default fallback sort: verified first, then views
    return result.sort((a, b) => {
      if (a.verified && !b.verified) return -1;
      if (!a.verified && b.verified) return 1;
      return b.views - a.views;
    });
  }

  const q = query.toLowerCase();

  return result.sort((a, b) => {
    const aTitle = a.title.toLowerCase();
    const bTitle = b.title.toLowerCase();

    // Direct startsWith gets top priority
    const aStarts = aTitle.startsWith(q);
    const bStarts = bTitle.startsWith(q);
    if (aStarts && !bStarts) return -1;
    if (!aStarts && bStarts) return 1;

    // Exact matches
    const aExact = aTitle === q;
    const bExact = bTitle === q;
    if (aExact && !bExact) return -1;
    if (!aExact && bExact) return 1;

    // Number of occurrences in title
    const aOccur = (aTitle.split(q).length - 1);
    const bOccur = (bTitle.split(q).length - 1);
    if (aOccur !== bOccur) return bOccur - aOccur;

    // Game name match
    const aGameMatch = a.gameName.toLowerCase().includes(q);
    const bGameMatch = b.gameName.toLowerCase().includes(q);
    if (aGameMatch && !bGameMatch) return -1;
    if (!aGameMatch && bGameMatch) return 1;

    // Default to views
    return b.views - a.views;
  });
}
