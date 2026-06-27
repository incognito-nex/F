import { Script } from '../types/script';

/**
 * Merges scripts from multiple sources, removing duplicates by ID or slug.
 */
export function mergeResults(rscripts: Script[], scriptblox: Script[]): Script[] {
  const merged: Script[] = [];
  const seenIds = new Set<string>();

  // Helper to add unique scripts
  const addScripts = (list: Script[]) => {
    if (!Array.isArray(list)) return;
    for (const item of list) {
      if (!item || !item.id) continue;
      const uniqueKey = item.id;
      
      if (!seenIds.has(uniqueKey)) {
        seenIds.add(uniqueKey);
        merged.push(item);
      }
    }
  };

  addScripts(rscripts);
  addScripts(scriptblox);

  // 3. Console.log the final array after merging
  console.log(`[mergeResults DevLog] Merged (${rscripts?.length || 0} Rscripts, ${scriptblox?.length || 0} ScriptBlox) -> Total merged: ${merged.length}`, merged);

  return merged;
}
