import { translations } from '../i18n/translations';

export const getCurrentLanguage = (): string => {
  const lang = navigator.language.split('-')[0];
  return translations[lang] ? lang : 'en';
};

/**
 * Translates a key or provides a "pretty" fallback.
 * It aggressively cleans up dot-notation keys for the UI.
 */
export const t = (key: string): string => {
  if (!key) return '';
  
  const lang = getCurrentLanguage();
  const dictionary = translations[lang] || translations['en'];

  // 1. Direct dictionary match
  if (dictionary[key]) {
    return dictionary[key];
  }

  // 2. Direct dictionary match on lowercase version
  const lowerKey = key.toLowerCase();
  if (dictionary[lowerKey]) {
    return dictionary[lowerKey];
  }

  // 3. Fallback prettification for technical keys (e.g., "country.finland")
  if (key.includes('.')) {
    return key.split('.')
              .pop()!
              .replace(/_/g, ' ')
              .replace(/\b\w/g, l => l.toUpperCase());
  }

  // 4. Default case formatting for raw strings
  return key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
};