
import React, { useState, useRef, useEffect } from 'react';
import { User, Collection, ThemeConfig } from '../types';
import { HomeIcon } from './icons/HomeIcon';
import { BellIcon } from './icons/BellIcon';
import { UsersIcon } from './icons/UsersIcon';
import { MailIcon } from './icons/MailIcon';
import { FolderIcon } from './icons/FolderIcon';
import { ChevronDownIcon } from './icons/ChevronDownIcon';
import { LIMITS } from '../utils/validation';

type ActiveView = 'collection' | 'folio' | 'brand' | 'social' | 'profile';

interface HeaderProps {
  user: User;
  activeView: ActiveView;
  setActiveView: (view: ActiveView) => void;
  unreadBrand: number;
  unreadSocial: number;
  backgroundColor: string;
  collections: Collection[];
  activeCollectionId: string | null;
  onSwitchCollection: (id: string) => void;
  onCreateCollection: () => void;
  onContactClick: () => void;
  theme: ThemeConfig;
}

const NavItem: React.FC<{
  label: string;
  icon: React.ReactNode;
  isActive: boolean;
  onClick: () => void;
  unreadCount?: number;
  hasDropdown?: boolean;
  theme: ThemeConfig;
}> = ({ label, icon, isActive, onClick, unreadCount, hasDropdown, theme }) => (
  <button
    onClick={onClick}
    style={{ 
        color: isActive ? theme.textPrimary : theme.textSecondary 
    }}
    className={`flex items-center gap-tight-md px-medium-sm py-tight-md 
      rounded-md transition-colors text-small font-semibold relative 
      hover:opacity-80`}
  >
    {icon}
    <span className="hidden sm:inline">{label}</span>
    {hasDropdown && <ChevronDownIcon />}
    {isActive && (
        <span 
            style={{ backgroundColor: theme.accent }}
            className="absolute bottom-0 left-1/2 -translate-x-1/2 w-4 h-0.5 
              rounded-full"
        />
    )}
    {unreadCount && unreadCount > 0 && (
      <span className="absolute top-1 right-1 block h-2 w-2 rounded-full 
        bg-red-500 ring-2 ring-brand-bg" />
    )}
  </button>
);

const Header: React.FC<HeaderProps> = ({ 
  user, 
  activeView, 
  setActiveView, 
  unreadBrand, 
  unreadSocial, 
  collections, 
  activeCollectionId, 
  onSwitchCollection, 
  onCreateCollection, 
  onContactClick,
  theme 
}) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  
  const isAtCollectionLimit = collections.length >= LIMITS.MAX_COLLECTIONS_PER_USER;

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [dropdownRef]);
  
  const initials = [user.firstName?.[0], user.lastName?.[0]].filter(Boolean).join('').toUpperCase() || 'GU';

  return (
    <header className="mb-large-lg">
      <div className="flex justify-between items-center">
        <div>
          <h1 
            className="text-display-md font-semibold tracking-tight 
              font-display transition-colors duration-500 leading-tight"
            style={{ color: theme.textPrimary }}
          >
            Brand Curator
          </h1>
        </div>
        <nav className="flex items-center gap-tight-md sm:gap-medium-lg">
          <div className="relative" ref={dropdownRef}>
            <NavItem 
              label="Collections"
              icon={<HomeIcon className="w-5 h-5" />}
              isActive={activeView === 'collection'}
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              hasDropdown={true}
              theme={theme}
            />
            {isDropdownOpen && (
              <div className="absolute top-full mt-tight-md w-64 
                bg-brand-surface rounded-lg shadow-lg border border-brand-border 
                z-20 py-tight-md animate-in fade-in zoom-in-95 duration-200">
                <div className="px-medium-sm py-tight-sm mb-tight-sm 
                  border-b border-brand-border">
                  <span className="text-[10px] font-semibold uppercase 
                    text-brand-text-secondary tracking-widest">
                    Your Collections ({collections.length}/{LIMITS.MAX_COLLECTIONS_PER_USER})
                  </span>
                </div>
                <div className="max-h-60 overflow-y-auto">
                  {collections.map(collection => (
                    <button 
                      key={collection.id}
                      onClick={() => { onSwitchCollection(collection.id); setIsDropdownOpen(false); setActiveView('collection'); }}
                      className={`w-full text-left px-medium-sm py-tight-md text-small flex items-center gap-tight-md ${activeCollectionId === collection.id ? 'font-semibold text-brand-primary bg-brand-secondary/5' : 'text-brand-text-secondary'} hover:bg-brand-secondary/10 transition-colors`}
                    >
                      <span className={`w-4 shrink-0 ${activeCollectionId === collection.id ? 'opacity-100' : 'opacity-0'}`}>✓</span>
                      <span className="truncate">{collection.name}</span>
                    </button>
                  ))}
                </div>
                <div className="my-tight-md border-t border-brand-border"></div>
                <button 
                    disabled={isAtCollectionLimit}
                    onClick={() => { onCreateCollection(); setIsDropdownOpen(false); }}
                    className={`w-full text-left px-medium-sm py-tight-md text-small flex items-center justify-between group transition-colors ${isAtCollectionLimit ? 'text-brand-text-secondary/50 cursor-not-allowed' : 'text-brand-text-secondary hover:bg-brand-secondary/10 hover:text-brand-primary'}`}
                >
                  <span>{isAtCollectionLimit ? '+ Create New (Limit Reached)' : '+ Create New Collection'}</span>
                </button>
              </div>
            )}
          </div>
          <NavItem 
            label="Folio"
            icon={<FolderIcon className="w-5 h-5" />}
            isActive={activeView === 'folio'}
            onClick={() => setActiveView('folio')}
            theme={theme}
          />
          <NavItem 
            label="Activity"
            icon={<BellIcon className="w-5 h-5" />}
            isActive={activeView === 'brand'}
            onClick={() => setActiveView('brand')}
            unreadCount={unreadBrand}
            theme={theme}
          />
          <NavItem 
            label="Feed"
            icon={<UsersIcon className="w-5 h-5" />}
            isActive={activeView === 'social'}
            onClick={() => setActiveView('social')}
            unreadCount={unreadSocial}
            theme={theme}
          />
          <button 
            onClick={onContactClick}
            style={{ color: theme.textSecondary }}
            className="hidden lg:flex items-center gap-tight-md px-medium-sm 
              py-tight-md rounded-md transition-colors text-small font-semibold 
              hover:opacity-80"
          >
            <MailIcon className="w-4 h-4" />
            <span>Contact</span>
          </button>
          <button 
            onClick={() => setActiveView('profile')} 
            className={`rounded-full transition-all ring-offset-brand-bg 
              ring-offset-2 hover:scale-105 active:scale-95 
              ${activeView === 'profile' ? 'ring-2 ring-brand-secondary' : 'ring-0'}`}
          >
            <div className="w-10 h-10 rounded-full bg-brand-surface border 
              border-brand-border flex items-center justify-center 
              overflow-hidden shadow-sm">
              {user.profilePicture ? (
                <img src={user.profilePicture} alt="Profile" 
                  className="w-full h-full object-cover" />
              ) : (
                <span className="text-base font-semibold text-brand-text-secondary">
                  {initials}
                </span>
              )}
            </div>
          </button>
        </nav>
      </div>
    </header>
  );
};

export default Header;
