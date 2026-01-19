
import React, { useState, useEffect, useMemo } from 'react';
import { Store, ThemeConfig } from '../types';
import { CloseIcon } from './icons/CloseIcon';
import { SearchIcon } from './icons/SearchIcon';
import { PlusCircleIcon } from './icons/PlusCircleIcon';
import { findSimilarAestheticBrands } from '../services/geminiService';
import { t } from '../utils/localization';

interface FolioSelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  allStores: Store[];
  selectedStoreIds: string[];
  onSave: (storeIds: string[]) => void;
  theme: ThemeConfig;
  folioName: string;
}

const SuggestionSkeleton: React.FC = () => (
  <div className="flex items-center justify-between p-3 bg-brand-bg/50 rounded-xl border border-brand-border">
    <div className="flex items-center gap-3 flex-1">
      <div className="size-10 shimmer-bg rounded-lg shrink-0" />
      <div className="space-y-2 flex-1">
        <div className="h-3 w-1/3 shimmer-bg rounded" />
        <div className="h-2 w-1/4 shimmer-bg rounded" />
      </div>
    </div>
    <div className="size-6 shimmer-bg rounded-full ml-4" />
  </div>
);

const FolioSelectionModal: React.FC<FolioSelectionModalProps> = ({
  isOpen,
  onClose,
  allStores,
  selectedStoreIds,
  onSave,
  theme,
  folioName
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [localSelected, setLocalSelected] = useState<Set<string>>(
    new Set(selectedStoreIds)
  );
  const [suggestions, setSuggestions] = useState<Store[]>([]);
  const [isLoadingSuggestions, setIsLoadingSuggestions] = useState(false);

  // Discovery Engine: Fetch suggestions whenever the selection changes significantly
  useEffect(() => {
    const fetchSuggestions = async () => {
      // Need at least one item to find aesthetic DNA
      if (localSelected.size === 0) {
        setSuggestions([]);
        return;
      }
      
      setIsLoadingSuggestions(true);
      
      try {
        const selectedStores = allStores.filter(s => localSelected.has(s.id));
        // Use a random item from current selection as the anchor for variety in discovery
        const anchor = selectedStores[Math.floor(Math.random() * selectedStores.length)];
        const candidates = allStores.filter(s => !localSelected.has(s.id) && s.description);
        
        if (anchor && candidates.length > 0) {
          const recIds = await findSimilarAestheticBrands(anchor, candidates, 3);
          const recStores = allStores.filter(s => recIds.includes(s.id));
          setSuggestions(recStores);
        }
      } catch (err) {
        console.error("Folio suggestions failed:", err);
      } finally {
        setIsLoadingSuggestions(false);
      }
    };

    if (isOpen) {
      fetchSuggestions();
    }
  }, [isOpen, localSelected.size === 0]); // Re-run if selection was cleared or on initial open

  if (!isOpen) return null;

  const filteredStores = allStores.filter(s => {
    const searchLower = searchTerm.toLowerCase();
    return (
      s.store_name.toLowerCase().includes(searchLower) ||
      t(s.city).toLowerCase().includes(searchLower) ||
      s.tags.some(tag => tag.toLowerCase().includes(searchLower))
    );
  });

  const toggleStore = (id: string) => {
    const next = new Set(localSelected);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setLocalSelected(next);
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[130] 
      flex items-center justify-center p-medium-lg animate-in fade-in 
      duration-300">
      <div className="bg-brand-surface rounded-3xl w-full max-w-2xl 
        max-h-[85vh] flex flex-col shadow-2xl overflow-hidden border 
        border-brand-border">
        
        <div className="p-medium-lg border-b border-brand-border flex 
          justify-between items-center bg-brand-bg/20">
          <div>
            <h3 className="text-display-sm font-semibold font-display">
              Curate {folioName}
            </h3>
            <p className="text-small text-brand-text-secondary">
              {localSelected.size} Items in Binder
            </p>
          </div>
          <button onClick={onClose} className="p-tight-md hover:bg-brand-bg 
            rounded-full transition-colors">
            <CloseIcon />
          </button>
        </div>

        <div className="px-medium-lg py-medium-sm bg-brand-bg/50 border-b border-brand-border">
          <div className="relative">
            <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 
              size-4 text-brand-text-secondary" />
            <input 
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by name, city, or tags..."
              className="w-full pl-11 pr-4 py-3 bg-brand-surface border 
                border-brand-border rounded-xl text-base focus:ring-2 
                focus:ring-brand-secondary/30 outline-none shadow-sm"
            />
          </div>
        </div>

        <div className="flex-grow overflow-y-auto custom-scrollbar">
          {/* AI Discovery Hub: Only shows when no search is active to keep UI focused */}
          {!searchTerm && (
            <div className="p-medium-lg bg-brand-secondary/5 border-b border-brand-border">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="text-[10px] font-extrabold uppercase tracking-[0.3em] text-brand-primary">
                    AI Aesthetic Pairings
                  </p>
                  <p className="text-[9px] text-brand-text-secondary opacity-70 italic">
                    {localSelected.size > 0 ? "Guiding your curation based on selection DNA." : "Add a brand to unlock discovery DNA."}
                  </p>
                </div>
                {isLoadingSuggestions && <div className="size-3 border-2 border-brand-secondary border-t-transparent rounded-full animate-spin" />}
              </div>

              <div className="grid grid-cols-1 gap-3">
                {isLoadingSuggestions ? (
                  <>
                    <SuggestionSkeleton />
                    <SuggestionSkeleton />
                  </>
                ) : suggestions.length > 0 ? (
                  suggestions.map((s, idx) => (
                    <div 
                      key={s.id} 
                      style={{ animationDelay: `${idx * 100}ms` }}
                      className="flex items-center justify-between p-3 bg-brand-surface rounded-xl border border-brand-border shadow-sm hover:shadow-subtle hover:border-brand-secondary transition-all animate-in fade-in slide-in-from-top-2 fill-mode-both"
                    >
                      <div className="flex items-center gap-4 flex-1 min-w-0">
                        <div className="size-10 bg-brand-bg rounded-lg flex items-center justify-center shrink-0 border border-brand-border overflow-hidden">
                          {s.imageUrl ? (
                            <img src={s.imageUrl} alt="" className="size-full object-cover" />
                          ) : (
                            <div className="size-4 bg-brand-secondary/20 rounded-full" />
                          )}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="font-display font-bold text-base leading-tight truncate text-brand-text-primary">
                            {s.store_name}
                          </p>
                          <div className="flex flex-wrap gap-x-2 items-center">
                            <p className="text-[9px] uppercase tracking-widest text-brand-text-secondary truncate">
                              {t(s.city)}
                            </p>
                            <span className="size-0.5 bg-brand-text-secondary opacity-30 rounded-full" />
                            <p className="text-[9px] uppercase tracking-widest text-brand-text-secondary truncate">
                              {t(s.country)}
                            </p>
                          </div>
                        </div>
                      </div>
                      <button 
                        onClick={() => toggleStore(s.id)}
                        className="ml-4 p-2 text-brand-secondary hover:text-brand-primary hover:scale-110 active:scale-95 transition-all"
                        title="Add to Folio"
                      >
                        <PlusCircleIcon className="size-6" />
                      </button>
                    </div>
                  ))
                ) : localSelected.size > 0 && !isLoadingSuggestions && (
                  <div className="p-4 rounded-xl border border-dashed border-brand-border bg-white/40 text-center">
                    <p className="text-[10px] text-brand-text-secondary italic">The curator's eye is unique; no DNA matches found for this specific pairing yet.</p>
                  </div>
                )}
              </div>
            </div>
          )}

          <div className="p-medium-lg space-y-tight-md">
            {filteredStores.map(store => (
              <label 
                key={store.id}
                className={`flex items-center justify-between p-medium-sm 
                  rounded-xl border transition-all cursor-pointer group
                  ${localSelected.has(store.id) 
                    ? 'bg-brand-secondary/10 border-brand-secondary shadow-sm' 
                    : 'bg-brand-surface border-brand-border hover:bg-brand-bg'
                  }`}
              >
                <div className="flex items-center gap-medium-sm truncate">
                  <div className="relative flex items-center justify-center">
                    <input 
                      type="checkbox"
                      className="size-5 rounded border-brand-border 
                        text-brand-secondary focus:ring-brand-secondary cursor-pointer"
                      checked={localSelected.has(store.id)}
                      onChange={() => toggleStore(store.id)}
                    />
                  </div>
                  <div className="truncate">
                    <p className="font-display text-large font-bold 
                      text-brand-text-primary truncate leading-tight">
                      {store.store_name}
                    </p>
                    <div className="flex items-center gap-2 truncate">
                      <p className="text-[10px] text-brand-text-secondary uppercase tracking-widest truncate">
                        {t(store.city)}
                      </p>
                      {store.tags.length > 0 && (
                        <>
                          <span className="size-0.5 bg-brand-text-secondary opacity-30 rounded-full" />
                          <p className="text-[10px] text-brand-text-secondary uppercase tracking-widest truncate">
                            {t(store.tags[0])}
                          </p>
                        </>
                      )}
                    </div>
                  </div>
                </div>
                {store.imageUrl && (
                  <img src={store.imageUrl} alt="" className="size-10 
                    rounded-md object-cover border border-brand-border shadow-sm group-hover:scale-105 transition-transform" />
                )}
              </label>
            ))}
            
            {filteredStores.length === 0 && (
              <div className="py-12 text-center opacity-40 font-display italic">
                No matching records in archive.
              </div>
            )}
          </div>
        </div>

        <div className="p-medium-lg border-t border-brand-border bg-brand-bg/30 
          flex gap-medium-sm shadow-[0_-4px_20px_rgba(0,0,0,0.02)]">
          <button 
            onClick={onClose}
            className="flex-1 py-4 bg-brand-surface border 
              border-brand-border font-sans font-bold text-small 
              uppercase tracking-widest rounded-xl hover:bg-brand-bg transition-all active:scale-[0.98]"
          >
            Cancel
          </button>
          <button 
            onClick={() => onSave(Array.from(localSelected))}
            className="flex-1 py-4 bg-brand-primary text-white 
              font-sans font-bold text-small uppercase tracking-widest rounded-xl 
              shadow-lg hover:opacity-95 active:scale-[0.98] transition-all"
          >
            Save to Folio
          </button>
        </div>
      </div>
    </div>
  );
};

export default FolioSelectionModal;
