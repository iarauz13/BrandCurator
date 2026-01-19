/**
 * Defensive programming validation rules for store and collection data.
 */
export const LIMITS = {
  MAX_STORES_PER_COLLECTION: 2000,
  MAX_COLLECTIONS_PER_USER: 10, 
  MAX_CSV_ROWS: 500, // Maximum data rows per single upload
  MAX_TAGS_PER_STORE: 20,
  MAX_NAME_LENGTH: 100,
  MAX_DESCRIPTION_WORDS: 150,
};

export interface ValidationResult {
  isValid: boolean;
  error?: string;
}

export const validateStoreInput = (data: {
  store_name: string;
  website: string;
  tags: string[];
}): ValidationResult => {
  if (!data.store_name || data.store_name.trim().length === 0) {
    return { isValid: false, error: "Store name is required." };
  }
  
  if (data.store_name.length > LIMITS.MAX_NAME_LENGTH) {
    return { isValid: false, error: `Store name exceeds ${LIMITS.MAX_NAME_LENGTH} characters.` };
  }

  if (data.website && !isValidUrl(data.website)) {
    return { isValid: false, error: "Invalid website URL format." };
  }

  if (data.tags.length > LIMITS.MAX_TAGS_PER_STORE) {
    return { isValid: false, error: `Too many tags (max ${LIMITS.MAX_TAGS_PER_STORE}).` };
  }

  return { isValid: true };
};

const isValidUrl = (url: string): boolean => {
  try {
    const check = url.startsWith('http') ? url : `https://${url}`;
    new URL(check);
    return true;
  } catch {
    return false;
  }
};