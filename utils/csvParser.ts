
import { Store } from '../types';
import { CollectionTemplate } from '../collectionTemplates';
import { LIMITS } from './validation';
import { getPriceBucket } from './priceMapper';

export const COLUMN_ALIASES: { [key: string]: string[] } = {
  store_name: ['store_name', 'name', 'brand', 'shop_name', 'store', 'title', 'brand_name'],
  website: ['website', 'url', 'link', 'site', 'web', 'shop_url', 'store_url', 'homepage', 'web_site', 'website_url', 'official_website'],
  instagram_name: ['instagram_name', 'instagram', 'ig', 'handle', 'insta', 'instagram_handle', 'social', 'ig_handle', 'instagram_url', 'instagram_link'],
  country: ['country', 'location_country', 'origin', 'nation'],
  city: ['city', 'location_city', 'location', 'town'],
  tags: ['tags', 'categories', 'type', 'tags_list', 'labels'],
  description: ['description', 'notes', 'about', 'bio', 'summary', 'details'],
  price_range: ['price_range', 'pricerange', 'price', 'pricing', 'cost', 'price_point']
};

const splitIntoRows = (text: string): string[] => {
  const rows: string[] = [];
  let currentRow = "";
  let insideQuotes = false;

  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    if (char === '"') insideQuotes = !insideQuotes;
    if ((char === '\n' || char === '\r') && !insideQuotes) {
      if (currentRow.trim()) rows.push(currentRow);
      currentRow = "";
      if (char === '\r' && text[i + 1] === '\n') i++;
    } else {
      currentRow += char;
    }
  }
  if (currentRow.trim()) rows.push(currentRow);
  return rows;
};

const splitRowIntoCells = (row: string): string[] => {
  const cells: string[] = [];
  let currentCell = "";
  let insideQuotes = false;

  for (let i = 0; i < row.length; i++) {
    const char = row[i];
    if (char === '"') {
      if (insideQuotes && row[i + 1] === '"') {
        currentCell += '"';
        i++;
      } else {
        insideQuotes = !insideQuotes;
      }
    } else if (char === ',' && !insideQuotes) {
      cells.push(currentCell.trim());
      currentCell = "";
    } else {
      currentCell += char;
    }
  }
  cells.push(currentCell.trim());
  return cells;
};

const extractNameFromUrl = (url: string): string => {
  try {
    const cleanUrl = url.startsWith('http') ? url : `https://${url}`;
    const domain = new URL(cleanUrl).hostname;
    const parts = domain.replace('www.', '').split('.');
    const name = parts[0];
    return name.charAt(0).toUpperCase() + name.slice(1);
  } catch {
    return 'Untitled Store';
  }
};

const cleanHeader = (h: string) => h.toLowerCase().trim().replace(/^\uFEFF/, '').replace(/^["']|["']$/g, '');

export const parseCSV = (csvText: string, template: CollectionTemplate) => {
  const allRows = splitIntoRows(csvText);
  if (allRows.length < 2) throw new Error("The file is empty or missing data rows.");

  const header = splitRowIntoCells(allRows[0]).map(cleanHeader);
  const dataRows = allRows.slice(1);

  const stores: Omit<Store, 'collectionId' | 'addedBy' | 'favoritedBy' | 'privateNotes'>[] = [];
  const errors: string[] = [];

  const getColValue = (cells: string[], key: string) => {
    const aliases = COLUMN_ALIASES[key] || [key];
    const index = header.findIndex(h => aliases.includes(h));
    return index !== -1 && cells[index] ? cells[index].trim() : '';
  };

  dataRows.forEach((rowText, idx) => {
    try {
      const cells = splitRowIntoCells(rowText);
      let storeName = getColValue(cells, 'store_name');
      const website = getColValue(cells, 'website');
      const instagram = getColValue(cells, 'instagram_name');

      if (!storeName && website) storeName = extractNameFromUrl(website);
      if (!storeName && !website) return;

      // NON-DESTRUCTIVE: Store original casing and full lengths
      stores.push({
        id: crypto.randomUUID(),
        store_name: storeName, 
        website: website, 
        instagram_name: instagram,
        country: getColValue(cells, 'country'),
        city: getColValue(cells, 'city'),
        description: getColValue(cells, 'description'), 
        tags: getColValue(cells, 'tags').split(/[|;,]/)
              .map(t => t.trim()) // Preserve original casing for tags in ingestion
              .filter(Boolean)
              .slice(0, LIMITS.MAX_TAGS_PER_STORE),
        rating: parseFloat(getColValue(cells, 'rating')) || 0,
        customFields: {},
        priceRange: getPriceBucket(getColValue(cells, 'price_range')) as Store['priceRange'],
        sustainability: '',
        imageUrl: '',
      });
    } catch (e) {
      errors.push(`Row ${idx + 2}: Error parsing row.`);
    }
  });

  return { stores, skippedCount: errors.length, errors };
};
