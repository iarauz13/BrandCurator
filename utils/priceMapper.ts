/**
 * Price Range Normalization Map
 * 
 * Maps inconsistent user inputs from CSVs or manual entry to a 
 * fixed set of IDs used by the filtering system.
 */

export const PRICE_BUCKETS = [
  { id: 'low', label: '$', values: ['$', 'low', 'cheap', 'budget', '<$100'] },
  { id: 'mid', label: '$$', values: ['$$', 'mid', 'average', 'moderate', '$100-500'] },
  { id: 'high', label: '$$$', values: ['$$$', 'high', 'premium', 'luxury', '$500-1000'] },
  { id: 'ultra', label: '$$$$', values: ['$$$$', 'ultra', 'exclusive', '>$1000'] }
];

export const getPriceBucket = (input: string): string => {
  if (!input) return 'unknown';
  const normalized = input.toLowerCase().trim();
  const bucket = PRICE_BUCKETS.find(b => 
    b.id === normalized || 
    b.label.toLowerCase() === normalized || 
    b.values.map(v => v.toLowerCase()).includes(normalized)
  );
  return bucket ? bucket.id : 'unknown';
};

export const getPriceLabel = (bucketId: string): string => {
  const bucket = PRICE_BUCKETS.find(b => b.id === bucketId);
  return bucket ? bucket.label : bucketId;
};
