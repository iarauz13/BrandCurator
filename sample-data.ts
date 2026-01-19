import { Store } from './types';

const baseStores: Omit<Store, 'addedBy' | 'collectionId'>[] = [
  {
    id: 'sample-1',
    store_name: 'Everlane',
    website: 'https://www.everlane.com',
    instagram_name: 'everlane',
    description: 'Modern basics with a focus on radical transparency.',
    country: 'USA',
    city: 'San Francisco',
    tags: ['minimalist', 'basics', 'ethical'],
    customFields: {
        'Product Categories': ['Tops', 'Bottoms', 'Outerwear'],
        'Occasions': ['Casual', 'Work'],
        'Styles': ['Minimalist', 'Modern']
    },
    priceRange: '$100-500',
    sustainability: 'Yes',
    rating: 4,
    imageUrl: 'https://logo.clearbit.com/everlane.com',
    favoritedBy: [],
    privateNotes: [],
  },
  {
    id: 'sample-2',
    store_name: 'Ganni',
    website: 'https://www.ganni.com',
    instagram_name: 'ganni',
    description: 'Copenhagen-based brand known for playful, print-heavy designs.',
    country: 'Denmark',
    city: 'Copenhagen',
    tags: ['scandi', 'print', 'contemporary'],
    customFields: {
        'Product Categories': ['Dresses', 'Shoes', 'Bags'],
        'Occasions': ['Casual', 'Special Events'],
        'Styles': ['Maximalist', 'Modern']
    },
    priceRange: '$100-500',
    sustainability: 'Unknown',
    rating: 5,
    imageUrl: 'https://logo.clearbit.com/ganni.com',
    favoritedBy: [],
    privateNotes: [],
  },
  {
    id: 'sample-3',
    store_name: 'Acne Studios',
    website: 'https://www.acnestudios.com',
    instagram_name: 'acnestudios',
    description: 'A Stockholm-based fashion house with a multidisciplinary approach.',
    country: 'Sweden',
    city: 'Stockholm',
    tags: ['luxury', 'avant-garde', 'scandi'],
    customFields: {
        'Product Categories': ['Outerwear', 'Shoes', 'Bags'],
        'Occasions': [],
        'Styles': ['Modern', 'Luxury']
    },
    priceRange: '$500-1000',
    sustainability: 'No',
    rating: 5,
    imageUrl: 'https://logo.clearbit.com/acnestudios.com',
    favoritedBy: [],
    privateNotes: [],
  },
];

export const sampleStores: Omit<Store, 'addedBy' | 'collectionId'>[] = baseStores;