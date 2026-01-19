
import { CollectionTemplate } from './collectionTemplates';

export interface User {
  userId: string;
  firstName: string;
  middleName?: string;
  lastName: string;
  email?: string; // Added for auth
  profilePicture?: string; // data URL
  notificationSettings?: {
    enabled: boolean;
  };
  activeCollectionId?: string; // Persistence for last open collection
}

export interface ThemeConfig {
  id: string;
  name: string;
  background: string; // CSS value (hex or linear-gradient)
  accent: string;     // Hex for primary buttons/accents
  textOnAccent: string; // Hex for text sitting on accents
  textPrimary: string;  // Explicit primary text color
  textSecondary: string; // Hierarchical text color (tinted by background, not generic grey)
  isDarkBackground: boolean; // Pre-calculated to ensure accessibility
}

export interface Folio {
  id: string;
  name: string;
  themeId: string;
  storeIds: string[];
  createdAt: string;
}

export interface Folio {
  id: string;
  name: string;
  themeId: string;
  storeIds: string[];
  createdAt: string;
}

export interface Collection {
  id: string;
  ownerId: string; // Cloud security: who owns this collection
  name: string;
  template: CollectionTemplate;
  stores: Store[];
  folios?: Folio[];
  createdAt: string;
}

export interface Store {
  id: string;
  collectionId: string;
  folioId?: string; // New: Optional reference to a Folio binder
  store_name: string;
  isArchived?: boolean;
  website: string;
  instagram_name: string;
  description: string;
  country: string;
  city: string;
  tags: string[];
  priceRange: '' | '<$100' | '$100-500' | '$500-1000' | '>$1000';
  sustainability: '' | 'Yes' | 'No' | 'Unknown';
  rating: number; // 0 to 5
  imageUrl?: string;
  onSale?: boolean;
  addedBy: { userId: string; userName: string };
  favoritedBy: string[]; // Array of user IDs
  privateNotes: { userId: string; note: string }[];
  // AI Metadata Storage (Non-destructive)
  scraped_data?: {
    city?: string;
    country?: string;
    description?: string;
    instagram_name?: string;
  };
  // DYNAMIC FIELDS
  customFields: {
    [key: string]: string[]; // e.g., { "Styles": ["Minimalist", "Vintage"], "Occasions": ["Casual"] }
  };
}

export interface ErrorReport {
  errorId: string;
  userId?: string;
  userFeedback: string;
  timestamp: string;
  error: {
    name: string;
    message: string;
    stack?: string;
  };
  environment: {
    url: string;
    locale: string;
    userAgent: string;
  };
}

export interface CategorizedStore {
  website: string;
  reason: string;
}

export interface AppNotification {
  id: string;
  type: 'brand' | 'social';
  activityType: 'sale' | 'new_collection' | 'restock' | 'event' | 'share';
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
  storeName?: string;
  // Fields for rich brand activity cards
  brandImageUrl?: string;
  activityImageUrl?: string;
  ctaLink?: string;
  ctaText?: string;
  // Payload for social sharing
  payload?: {
    store: Store;
    senderName: string;
    senderId: string;
  };
  toUserId?: string; // ID of the recipient
}

export interface LocationPin {
  lat: number;
  lon: number;
  count: number;
  label: string;
  storesInPin: Store[];
}
