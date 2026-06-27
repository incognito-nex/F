import { Script } from '../types/script';

/**
 * Merges scripts from multiple sources, removing duplicates by ID or slug.
 */
export function mergeResults(rscripts: Script[], scriptblox: Script[]): Script[] {
  const merged: Script[] = [];
  const seenIds = new Set<string>();

  // Helper to add unique scripts
  const addScripts = (list: Script[]) => {
    for (const item of list) {
      // Normalize comparison string to catch duplicate scripts
      const normalizedTitle = item.title.toLowerCase().replace(/[^a-z0-9]/g, '');
      const uniqueKey = item.id;
      
      if (!seenIds.has(uniqueKey)) {
        seenIds.add(uniqueKey);
        merged.push(item);
      }
    }
  };

  addScripts(rscripts);
  addScripts(scriptblox);

  return merged;
}
