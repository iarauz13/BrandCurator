
import React, { useState, useMemo } from 'react';
import { AppNotification, ThemeConfig } from '../types';
import { TagIcon } from './icons/TagIcon';
import { BellIcon } from './icons/BellIcon';
import { UsersIcon } from './icons/UsersIcon';
import { PlusCircleIcon } from './icons/PlusCircleIcon';

interface NotificationsPageProps {
  title: string;
  notifications: AppNotification[];
  onMarkAllAsRead: () => void;
  onAcceptShare?: (notification: AppNotification) => void;
  theme: ThemeConfig;
}

const timeSince = (date: Date): string => {
  const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);
  let interval = seconds / 31536000;
  if (interval > 1) return Math.floor(interval) + " years ago";
  interval = seconds / 2592000;
  if (interval > 1) return Math.floor(interval) + " months ago";
  interval = seconds / 86400;
  if (interval > 1) return Math.floor(interval) + " days ago";
  interval = seconds / 3600;
  if (interval > 1) return Math.floor(interval) + " hours ago";
  interval = seconds / 60;
  if (interval > 1) return Math.floor(interval) + " minutes ago";
  return Math.floor(seconds) + " seconds ago";
}

const BrandActivityFeed: React.FC<{ notifications: AppNotification[], theme: ThemeConfig }> = ({ notifications, theme }) => {
    const [activeFilter, setActiveFilter] = useState('all');

    const filters = [
        { key: 'all', label: 'All' },
        { key: 'new_collection', label: 'New Collections' },
        { key: 'sale', label: 'Sales' },
        { key: 'event', label: 'Events' },
    ];

    const filteredNotifications = useMemo(() => {
        if (activeFilter === 'all') {
            return notifications;
        }
        return notifications.filter(n => n.activityType === activeFilter);
    }, [notifications, activeFilter]);

    return (
        <div className="max-w-4xl mx-auto min-h-[60vh]">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-4xl font-light font-display transition-colors" style={{ color: theme.textPrimary }}>Brands Activity</h2>
            </div>
            
            <div className="flex gap-3 px-1 pb-8 overflow-x-auto whitespace-nowrap scrollbar-hide">
                {filters.map(filter => (
                    <button
                        key={filter.key}
                        onClick={() => setActiveFilter(filter.key)}
                        style={activeFilter === filter.key ? { backgroundColor: theme.textPrimary, color: theme.background.includes('gradient') ? '#FFF' : theme.textOnAccent } : {}}
                        className={`flex h-10 shrink-0 cursor-pointer items-center justify-center gap-x-2 rounded-full px-5 transition-all border ${
                            activeFilter === filter.key
                                ? 'shadow-sm border-transparent'
                                : 'bg-brand-surface hover:bg-black/5 text-brand-text-secondary border-brand-border'
                        }`}
                    >
                        <p className="text-sm font-medium">{filter.label}</p>
                    </button>
                ))}
            </div>
            
            {filteredNotifications.length > 0 ? (
                <main className="flex flex-col gap-10">
                    {filteredNotifications.map(notification => (
                        <div key={notification.id} className="flex flex-col gap-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
                            <div className="flex items-center gap-3">
                                <img className="h-10 w-10 rounded-full bg-brand-surface border border-brand-border object-cover" alt={`${notification.storeName} logo`} src={notification.brandImageUrl} />
                                <div>
                                    <p className="font-semibold text-sm" style={{ color: theme.textPrimary }}>{notification.storeName}</p>
                                    <p className="text-xs" style={{ color: theme.textSecondary }}>{timeSince(notification.timestamp)}</p>
                                </div>
                            </div>
                            <div className="flex flex-col overflow-hidden rounded-2xl border border-brand-border bg-brand-surface shadow-subtle hover:shadow-subtle-hover transition-shadow">
                                {notification.activityImageUrl && (
                                    <div className="h-64 w-full bg-cover bg-center" style={{ backgroundImage: `url('${notification.activityImageUrl}')` }}></div>
                                )}
                                <div className="flex flex-col gap-4 p-6">
                                    <div className="flex flex-col gap-2">
                                        <h2 className="font-display text-3xl font-semibold leading-tight text-brand-text-primary">{notification.title}</h2>
                                        <p className="text-base text-brand-text-secondary leading-relaxed">{notification.message}</p>
                                    </div>
                                    {notification.ctaLink && notification.ctaText && (
                                    <a 
                                        href={notification.ctaLink} 
                                        target="_blank" 
                                        rel="noopener noreferrer"
                                        className="h-12 w-full cursor-pointer rounded-lg border border-brand-border bg-brand-bg text-base font-semibold text-brand-text-primary transition-all hover:bg-brand-primary hover:text-white flex items-center justify-center shadow-sm"
                                    >
                                        <span>{notification.ctaText}</span>
                                    </a>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                </main>
            ) : (
                <div className="flex flex-col items-center justify-center py-24 text-center">
                    <div className="w-16 h-16 bg-brand-bg rounded-full flex items-center justify-center mb-6 text-brand-text-secondary opacity-40">
                        <BellIcon className="w-8 h-8" />
                    </div>
                    <h3 className="text-3xl font-semibold font-display mb-3" style={{ color: theme.textPrimary }}>All Quiet Here</h3>
                    <p className="max-w-sm leading-relaxed" style={{ color: theme.textSecondary }}>
                        New collection drops, restocks, and sales from your curated brands will appear here as they happen.
                    </p>
                </div>
            )}
        </div>
    );
};


const SocialFeed: React.FC<{ notifications: AppNotification[], onMarkAllAsRead: () => void, onAcceptShare?: (n: AppNotification) => void, theme: ThemeConfig }> = ({ notifications, onMarkAllAsRead, onAcceptShare, theme }) => {
    const unreadCount = notifications.filter(n => !n.read).length;
    
    return (
        <div className="max-w-4xl mx-auto min-h-[60vh]">
             <div className="flex justify-between items-center mb-8">
                <h2 className="text-4xl font-light font-display transition-colors" style={{ color: theme.textPrimary }}>Social Feed</h2>
                {unreadCount > 0 && (
                  <button
                    onClick={onMarkAllAsRead}
                    style={{ color: theme.accent }}
                    className="text-sm font-medium hover:underline transition-all"
                  >
                    Mark all as read
                  </button>
                )}
            </div>
            {notifications.length > 0 ? (
                <div className="space-y-4">
                    {notifications.map(notification => (
                        <div 
                            key={notification.id}
                            className={`p-5 bg-brand-surface rounded-xl border flex items-start gap-4 transition-all duration-300 ${notification.read ? 'border-brand-border opacity-80' : 'border-brand-secondary/30 bg-brand-secondary/5 shadow-sm'}`}
                        >
                            <div className="flex-shrink-0 w-12 h-12 bg-brand-bg rounded-full flex items-center justify-center overflow-hidden border border-brand-border shadow-inner">
                                {notification.brandImageUrl ? (
                                     <img src={notification.brandImageUrl} className="w-full h-full object-cover" alt="Sender" />
                                ) : (
                                     <div className="text-brand-secondary"><UsersIcon className="w-6 h-6" /></div>
                                )}
                            </div>
                            <div className="flex-grow">
                                <div className="flex justify-between items-start mb-1">
                                    <h3 className="font-bold text-brand-text-primary">{notification.title}</h3>
                                    <p className="text-[10px] font-bold text-brand-text-secondary/50 uppercase tracking-tighter">{timeSince(notification.timestamp)}</p>
                                </div>
                                <p className="text-brand-text-secondary text-sm leading-relaxed">{notification.message}</p>
                                
                                {notification.payload && (
                                    <div className="mt-4 p-4 bg-brand-surface rounded-lg border border-brand-border group shadow-subtle hover:border-brand-secondary transition-colors">
                                        <div className="flex gap-4 mb-3">
                                            {notification.payload.store.imageUrl ? (
                                                <img src={notification.payload.store.imageUrl} className="w-20 h-20 object-cover rounded-md border border-brand-border shadow-sm" alt={notification.payload.store.store_name} />
                                            ) : (
                                                <div className="w-20 h-20 bg-brand-bg rounded-md flex items-center justify-center border border-brand-border"><TagIcon /></div>
                                            )}
                                            <div className="flex flex-col justify-center">
                                                <p className="font-bold font-display text-xl text-brand-text-primary">{notification.payload.store.store_name}</p>
                                                <p className="text-[10px] font-bold text-brand-text-secondary/60 uppercase tracking-widest">{notification.payload.store.city}, {notification.payload.store.country}</p>
                                            </div>
                                        </div>
                                        {onAcceptShare && (
                                            <button 
                                                onClick={() => onAcceptShare(notification)}
                                                className="w-full flex items-center justify-center gap-2 text-sm bg-brand-primary text-white px-4 py-2.5 rounded-lg hover:bg-brand-secondary transition-all font-semibold"
                                            >
                                                <PlusCircleIcon className="w-5 h-5" /> Add to My Collection
                                            </button>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="flex flex-col items-center justify-center py-24 text-center border-2 border-dashed border-brand-border rounded-2xl bg-brand-surface/50">
                    <div className="w-16 h-16 bg-brand-bg rounded-full flex items-center justify-center mb-6 text-brand-text-secondary opacity-40">
                        <UsersIcon className="w-8 h-8" />
                    </div>
                    <h3 className="text-3xl font-semibold font-display mb-3" style={{ color: theme.textPrimary }}>Join the Conversation</h3>
                    <p className="max-w-sm leading-relaxed px-6" style={{ color: theme.textSecondary }}>
                        Items shared by your friends and collaborative collection activity will appear in this feed.
                    </p>
                </div>
            )}
        </div>
    );
};


const NotificationsPage: React.FC<NotificationsPageProps> = ({ title, notifications, onMarkAllAsRead, onAcceptShare, theme }) => {
  if (title === 'Brands Activity') {
    return <BrandActivityFeed notifications={notifications} theme={theme} />;
  }
  
  if (title === 'Social Feed') {
      return <SocialFeed notifications={notifications} onMarkAllAsRead={onMarkAllAsRead} onAcceptShare={onAcceptShare} theme={theme} />
  }

  return <div className="text-center py-20 font-display text-2xl">Page not found.</div>;
};

export default NotificationsPage;
