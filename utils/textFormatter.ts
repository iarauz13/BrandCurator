/**
 * Natural sorting and categorization for store names.
 */

/**
 * Determines the index key for a store name.
 * If starts with A-Z, returns uppercase letter. Otherwise, returns '#'.
 */
export const getStoreGroupingKey = (name: string): string => {
  if (!name) return '#';
  const trimmed = name.trim();
  if (trimmed.length === 0) return '#';
  
  const firstChar = trimmed.charAt(0);
  // Strictly check if the first character is a letter
  if (/^[a-zA-Z]/.test(firstChar)) {
    return firstChar.toUpperCase();
  }
  return '#';
};

/**
 * Natural comparison for sorting store lists.
 * Rules: 
 * 1. A-Z comes before #.
 * 2. Alphabetical within A-Z.
 * 3. Alphabetical within #.
 */
export const compareStoreNames = (a: string, b: string): number => {
  const keyA = getStoreGroupingKey(a);
  const keyB = getStoreGroupingKey(b);

  // If one is '#' and the other is a letter
  if (keyA === '#' && keyB !== '#') return 1; // # goes to end
  if (keyA !== '#' && keyB === '#') return -1; // letters go to start

  // Otherwise compare normally
  return a.localeCompare(b, undefined, { sensitivity: 'base', numeric: true });
};

export const formatDescription = (text: string): string => {
  if (!text) return '';

  let formattedText = text.trim();

  const letters = formattedText.replace(/[^a-zA-Z]/g, '');
  if (letters.length > 10) { 
    const upperCaseLetters = letters.replace(/[^A-Z]/g, '');
    const upperCaseRatio = upperCaseLetters.length / letters.length;
    if (upperCaseRatio > 0.7) {
      formattedText = formattedText.toLowerCase();
      formattedText = formattedText.replace(/(^\w{1})|(\.\s*\w{1})|(\!\s*\w{1})|(\?\s*\w{1})/g, (char) => char.toUpperCase());
    }
  }

  formattedText = formattedText.replace(/(!){2,}/g, '!');
  formattedText = formattedText.replace(/(\?){2,}/g, '?');
  formattedText = formattedText.replace(/\*([^*]+)\*/g, '$1');
  formattedText = formattedText.replace(/_([^_]+)_/g, '$1');

  return formattedText;
};

export const normalizeStoreName = (name: string): string => {
  if (!name) return '';
  return name
    .toLowerCase()
    .replace(/['’]/g, '')
    .replace(/[&,\-_\s]/g, '');
};

export const isMeaningfulDescription = (description: string): boolean => {
  if (!description) return false;
  const lowercased = description.toLowerCase().trim();
  const placeholders = ['none', 'n/a', 'na', 'false', 'no description yet.', ''];
  if (placeholders.includes(lowercased)) return false;
  const words = lowercased.split(/\s+/).filter(Boolean);
  return lowercased.length > 15 && words.length > 3;
};