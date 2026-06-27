/**
 * Sanitizes search input to prevent Unicode corruption or invisible accents
 */
export function sanitizeQuery(query: string): string {
  if (!query) return '';
  return query
    .trim()
    .normalize("NFKC")
    // Remove invisible and control characters, zero-width characters, as well as modifier circumflex accent \u02C6
    .replace(/[\u200B-\u200D\uFEFF\u02C6\u00A0]/g, '')
    // Strip combining diacritical marks
    .replace(/[\u0300-\u036f]/g, '');
}
