import { AppNotification } from './types';

export const mockNotifications: AppNotification[] = [
  {
    id: '1',
    type: 'brand',
    activityType: 'sale',
    title: 'Sale Alert!',
    message: 'Everlane is having a 25% off sitewide sale. Don\'t miss out!',
    storeName: 'Everlane',
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
    read: false,
    brandImageUrl: 'https://logo.clearbit.com/everlane.com',
    activityImageUrl: 'https://images.unsplash.com/photo-1483985988355-763728e1935b?q=80&w=2070&auto=format&fit=crop',
    ctaLink: 'https://www.everlane.com/promotions',
    ctaText: 'Shop Sale'
  },
  {
    id: '2',
    type: 'social',
    activityType: 'share',
    title: 'New Brands Shared',
    message: 'Your friend, Alex D., shared 5 new brands with you.',
    timestamp: new Date(Date.now() - 18 * 60 * 60 * 1000), // 18 hours ago
    read: false,
  },
  {
    id: '3',
    type: 'brand',
    activityType: 'new_collection',
    title: 'New Collection Drop',
    message: 'Ganni just released their new Fall/Winter collection.',
    storeName: 'Ganni',
    timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
    read: true,
    brandImageUrl: 'https://logo.clearbit.com/ganni.com',
    activityImageUrl: 'https://images.unsplash.com/photo-1617137968427-85924c800a22?q=80&w=1964&auto=format&fit=crop',
    ctaLink: 'https://www.ganni.com/en-us/new-in',
    ctaText: 'View Collection'
  },
  {
    id: '5',
    type: 'brand',
    activityType: 'event',
    title: 'Exclusive Trunk Show',
    message: 'Join us for an exclusive preview of our next collection in our SoHo store.',
    storeName: 'Acne Studios',
    timestamp: new Date(Date.now() - 2.5 * 24 * 60 * 60 * 1000), // 2.5 days ago
    read: false,
    brandImageUrl: 'https://logo.clearbit.com/acnestudios.com',
    activityImageUrl: 'https://images.unsplash.com/photo-1550963284-7262a9a7a735?q=80&w=1974&auto=format&fit=crop',
    ctaLink: '#',
    ctaText: 'Learn More'
  },
  {
    id: '4',
    type: 'brand',
    activityType: 'restock',
    title: 'Restock Alert',
    message: 'The popular Acne Studios Musubi bag is back in stock in all colors.',
    storeName: 'Acne Studios',
    timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
    read: true,
    brandImageUrl: 'https://logo.clearbit.com/acnestudios.com',
    activityImageUrl: 'https://images.unsplash.com/photo-1590737142025-56f693a383a8?q=80&w=1974&auto=format&fit=crop',
    ctaLink: '#',
    ctaText: 'Shop Now'
  },
];