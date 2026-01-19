
/**
 * Data Normalization Engine.
 */

/**
 * Standardizes raw strings into persistent keys.
 */
export const normalizeToKey = (str: string): string => {
  if (!str) return '';
  return str
    .trim()
    .toLowerCase()
    .replace(/\s+/g, '_')
    .replace(/[^\w\s_]/g, '')
    .replace(/_+/g, '_');
};

/**
 * Calculates the Levenshtein distance between two strings.
 * Used for fuzzy matching to detect near-duplicates.
 */
export const getLevenshteinDistance = (a: string, b: string): number => {
  const matrix = Array.from({ length: a.length + 1 }, () => 
    Array.from({ length: b.length + 1 }, (_, j) => j)
  );
  for (let i = 1; i <= a.length; i++) matrix[i][0] = i;

  for (let i = 1; i <= a.length; i++) {
    for (let j = 1; j <= b.length; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      matrix[i][j] = Math.min(
        matrix[i - 1][j] + 1,      // deletion
        matrix[i][j - 1] + 1,      // insertion
        matrix[i - 1][j - 1] + cost // substitution
      );
    }
  }
  return matrix[a.length][b.length];
};

/**
 * Checks if two strings are similar based on a threshold (0 to 1).
 */
export const areStringsSimilar = (a: string, b: string, threshold = 0.8): boolean => {
  const distance = getLevenshteinDistance(a.toLowerCase(), b.toLowerCase());
  const maxLength = Math.max(a.length, b.length);
  if (maxLength === 0) return true;
  const similarity = 1 - distance / maxLength;
  return similarity >= threshold;
};

export const normalizeUrl = (url: string): string => {
    if (!url) return '';
    const trimmed = url.trim();
    if (!trimmed || /^(none|na|false)$/i.test(trimmed)) return '';
    if (/^https?:\/\/|^\/\//i.test(trimmed)) return trimmed;
    return `https://${trimmed}`;
};

export const normalizeInstagramHandle = (input: string): string => {
    if (!input) return '';
    let handle = input.trim();
    if (handle.includes('instagram.com/')) {
        handle = handle.split('instagram.com/')[1].split('/')[0].split('?')[0];
    }
    return handle.replace(/^@/, '');
};
