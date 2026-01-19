
import React, { useState, useEffect } from 'react';
import { Store, User } from '../types';
import { CollectionTemplate } from '../collectionTemplates';
import { CloseIcon } from './icons/CloseIcon';
import { ClipboardIcon } from './icons/ClipboardIcon';
import { UsersIcon } from './icons/UsersIcon';
import { SearchIcon } from './icons/SearchIcon';
import { formatDescription } from '../utils/textFormatter';
import { getPriceLabel } from '../utils/priceMapper';
import { cityCoordinates } from '../utils/geoCoordinates';
import { normalizeToKey } from '../utils/normalization';

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  allStores: Store[];
  selectedStoreIds: Set<string>;
  onExport: (stores: Store[], filename: string) => void;
  onSearchUsers: (searchTerm: string) => Promise<User[]>;
  onSendShare: (recipientId: string, store: Store, note: string) => Promise<void>;
  collectionTemplate?: CollectionTemplate | null;
}

const ShareModal: React.FC<ShareModalProps> = ({ isOpen, onClose, allStores, selectedStoreIds, onExport, onSearchUsers, onSendShare, collectionTemplate }) => {
  const [shareStep, setShareStep] = useState<'format' | 'selection' | 'message' | 'user-search' | 'compose'>('format');
  const [shareFormat, setShareFormat] = useState<'csv' | 'text' | 'social' | null>(null);
  const [generatedMessage, setGeneratedMessage] = useState('');
  const [copyButtonText, setCopyButtonText] = useState('Copy to Clipboard');
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState<User[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedRecipient, setSelectedRecipient] = useState<User | null>(null);
  const [personalNote, setPersonalNote] = useState('');

  useEffect(() => {
    if (!isOpen) {
      setTimeout(() => {
        setShareStep('format');
        setShareFormat(null);
        setSearchTerm('');
        setSearchResults([]);
        setSelectedRecipient(null);
        setPersonalNote('');
      }, 300);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const selectedStores = allStores.filter(store => selectedStoreIds.has(store.id));

  const generateTextMessage = (stores: Store[]): string => {
    return stores.map((store) => {
      // Clean Export Pipeline Logic
      const cleanDesc = formatDescription(store.description);
      const priceLabel = getPriceLabel(store.priceRange);
      
      // City Mapping Lookup
      const cityKey = normalizeToKey(store.city);
      let mappedCity = store.city;
      if (cityKey && cityCoordinates[cityKey]) {
        // Find entry with proper display name if possible, or just capitalize
        mappedCity = store.city.replace(/\b\w/g, l => l.toUpperCase());
      }

      let message = `${store.store_name.toUpperCase()}\n`;
      message += `• Details: ${cleanDesc || 'N/A'}\n`;
      message += `• Location: ${[mappedCity, store.country].filter(Boolean).join(', ') || 'N/A'}\n`;
      message += `• Price Tier: ${priceLabel || 'Not Specified'}\n`;
      
      if (store.website) {
        const website = store.website.startsWith('http') ? store.website : `https://${store.website}`;
        message += `• Website: ${website}\n`;
      }

      if (store.instagram_name) {
        let handle = store.instagram_name.trim().replace(/^@/, '');
        message += `• Instagram: https://instagram.com/${handle}\n`;
      }

      return message;
    }).join('\n---\n\n');
  };

  const handleFormatSelect = (format: 'csv' | 'text' | 'social') => {
    setShareFormat(format);
    if (format === 'social') setShareStep('user-search');
    else setShareStep('selection');
  };

  const handleSelection = (stores: Store[]) => {
    if (shareFormat === 'csv') {
      onExport(stores, `collection_export.csv`);
      onClose();
    } else if (shareFormat === 'text') {
      setGeneratedMessage(generateTextMessage(stores));
      setShareStep('message');
    }
  };
  
  const handleCopyToClipboard = () => {
    navigator.clipboard.writeText(generatedMessage).then(() => {
        setCopyButtonText('Copied!');
        setTimeout(() => setCopyButtonText('Copy to Clipboard'), 2000);
    });
  };

  const handleUserSearch = async () => {
      setIsSearching(true);
      const results = await onSearchUsers(searchTerm);
      setSearchResults(results);
      setIsSearching(false);
  };

  const handleBack = () => {
    if (shareStep === 'message') setShareStep('selection');
    else if (shareStep === 'selection') setShareStep('format');
    else if (shareStep === 'user-search') setShareStep('format');
    else if (shareStep === 'compose') setShareStep('user-search');
  };

  const renderContent = () => {
    if (shareStep === 'format') return (
        <>
          <h2 className="text-3xl font-bold mb-6 font-display text-brand-text-primary">Registry Export</h2>
          <div className="space-y-4">
              <button onClick={() => handleFormatSelect('social')} className="w-full text-left p-5 bg-brand-bg border border-brand-border rounded-xl hover:border-brand-primary flex items-center gap-5 group transition-all">
                  <div className="size-12 bg-brand-surface rounded-full text-brand-primary group-hover:bg-brand-secondary group-hover:text-white transition-colors flex items-center justify-center shadow-sm">
                      <UsersIcon className="size-6" />
                  </div>
                  <div>
                    <h3 className="font-bold text-base">Direct Social Send</h3>
                    <p className="text-sm text-brand-text-secondary">Notify another user inside the app.</p>
                  </div>
              </button>
              <button onClick={() => handleFormatSelect('text')} className="w-full text-left p-5 bg-brand-bg border border-brand-border rounded-xl hover:border-brand-primary flex items-center gap-5 group transition-all">
                   <div className="size-12 bg-brand-surface rounded-full text-brand-primary group-hover:bg-brand-secondary group-hover:text-white transition-colors flex items-center justify-center shadow-sm">
                      <ClipboardIcon />
                  </div>
                  <div>
                    <h3 className="font-bold text-base">Registry Summary</h3>
                    <p className="text-sm text-brand-text-secondary">Generate an editorialized report.</p>
                  </div>
              </button>
              <button onClick={() => handleSelection(allStores)} className="w-full text-left p-5 bg-brand-bg border border-brand-border rounded-xl hover:border-brand-primary flex items-center gap-5 group transition-all">
                   <div className="size-12 bg-brand-surface rounded-full text-brand-primary group-hover:bg-brand-secondary group-hover:text-white transition-colors flex items-center justify-center shadow-sm">
                      <svg className="size-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                  </div>
                  <div>
                    <h3 className="font-bold text-base">CSV Data Archive</h3>
                    <p className="text-sm text-brand-text-secondary">Export as-is for spreadsheet use.</p>
                  </div>
              </button>
          </div>
        </>
    );

    if (shareStep === 'selection') return (
      <>
          <div className="mb-6">
              <button onClick={handleBack} className="text-xs font-bold uppercase tracking-widest text-brand-text-secondary hover:text-brand-primary mb-4">&larr; Back</button>
              <h2 className="text-3xl font-bold font-display text-brand-text-primary">Registry Selection</h2>
          </div>
          <div className="space-y-4">
              <button onClick={() => handleSelection(allStores)} className="w-full text-left p-5 bg-brand-bg border border-brand-border rounded-xl hover:border-brand-primary transition-all">
                  <h3 className="font-bold text-base">Complete Registry</h3>
                  <p className="text-sm text-brand-text-secondary">{allStores.length} entries total</p>
              </button>
              <button onClick={() => handleSelection(selectedStores)} disabled={selectedStoreIds.size === 0} className="w-full text-left p-5 bg-brand-bg border border-brand-border rounded-xl hover:border-brand-primary disabled:opacity-50 transition-all">
                  <h3 className="font-bold text-base">Filtered Selection</h3>
                  <p className="text-sm text-brand-text-secondary">{selectedStoreIds.size} entries highlighted</p>
              </button>
          </div>
      </>
    );

    if (shareStep === 'message') return (
      <>
          <div className="mb-4">
              <button onClick={handleBack} className="text-xs font-bold uppercase tracking-widest text-brand-text-secondary hover:text-brand-primary mb-4">&larr; Back</button>
              <h2 className="text-3xl font-bold font-display text-brand-text-primary">Registry Report</h2>
          </div>
          <div className="relative">
              <textarea readOnly value={generatedMessage} className="w-full h-64 p-5 bg-brand-bg border border-brand-border rounded-2xl text-xs font-mono custom-scrollbar focus:ring-2 focus:ring-brand-secondary/30 outline-none" />
              <div className="absolute top-4 right-4 px-3 py-1 bg-brand-primary/10 text-brand-primary text-[10px] font-bold rounded-full border border-brand-primary/20 backdrop-blur-sm">
                  {selectedStoreIds.size || allStores.length} ITEMS
              </div>
          </div>
          <button onClick={handleCopyToClipboard} className="mt-6 w-full flex items-center justify-center gap-3 py-4 bg-brand-primary text-white font-bold rounded-xl hover:opacity-90 shadow-lg active:scale-95 transition-all">
              <ClipboardIcon />
              <span>{copyButtonText}</span>
          </button>
      </>
    );

    return null;
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-[2px] flex justify-center items-center z-[150] p-4" onClick={onClose}>
      <div className="bg-brand-surface rounded-3xl shadow-2xl w-full max-w-lg p-8 relative animate-in fade-in zoom-in-95 duration-200 border border-brand-border" onClick={(e) => e.stopPropagation()}>
        <button onClick={onClose} className="absolute top-6 right-6 text-brand-text-secondary hover:text-brand-primary transition-colors"><CloseIcon /></button>
        {renderContent()}
      </div>
    </div>
  );
};

export default ShareModal;
