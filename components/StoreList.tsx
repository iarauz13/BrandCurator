
import React, { useMemo, useState, useEffect, useRef } from 'react';
import { Store, User, Collection, ThemeConfig } from '../types';
import StoreCard from './StoreCard';
import { getStoreGroupingKey } from '../utils/textFormatter';
import QuickLookModal from './QuickLookModal';

interface StoreListProps {
  stores: Store[];
  user: User;
  theme: ThemeConfig;
  collections?: Collection[];
  onEdit: (store: Store) => void;
  onArchive: (storeId: string) => void;
  onRestore: (storeId: string) => void;
  onDeletePermanently: (storeId: string) => void;
  onMoveStore?: (storeId: string, targetCollectionId: string) => void;
  isArchivedView: boolean;
  hasActiveFilters: boolean;
  selectedStoreIds: Set<string>;
  onToggleSelection: (storeId: string) => void;
  generatingImageIds: Set<string>;
  onGenerateImage: (storeId: string, isAuto?: boolean) => void;
  scrapingStoreIds: Set<string>;
  onDragStart?: (id: string) => void;
}

const ALPHABET = [...'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split(''), '#'];
const CHUNK_SIZE = 12;

const StoreList: React.FC<StoreListProps> = ({
  stores,
  user,
  theme,
  collections = [],
  onEdit,
  onArchive,
  onRestore,
  onDeletePermanently,
  onMoveStore,
  isArchivedView,
  hasActiveFilters,
  selectedStoreIds,
  onToggleSelection,
  generatingImageIds,
  onGenerateImage,
  scrapingStoreIds,
  onDragStart
}) => {
  const [visibleCount, setVisibleCount] = useState(CHUNK_SIZE * 2);
  const [lastInteractedStoreId, setLastInteractedStoreId] = useState<string | null>(null);
  const [quickLookStore, setQuickLookStore] = useState<Store | null>(null);
  const observerTarget = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && visibleCount < stores.length) {
          setVisibleCount(prev => Math.min(prev + CHUNK_SIZE, stores.length));
        }
      },
      { threshold: 0.1, rootMargin: '400px' }
    );

    if (observerTarget.current) {
      observer.observe(observerTarget.current);
    }

    return () => observer.disconnect();
  }, [visibleCount, stores.length]);

  useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      // Spacebar logic for Quick Look
      if (e.code === 'Space' && lastInteractedStoreId && !quickLookStore) {
        // Prevent scroll
        if (document.activeElement?.tagName !== 'INPUT' && document.activeElement?.tagName !== 'TEXTAREA') {
          e.preventDefault();
          const store = stores.find(s => s.id === lastInteractedStoreId);
          if (store) setQuickLookStore(store);
        }
      }
    };

    window.addEventListener('keydown', handleGlobalKeyDown);
    return () => window.removeEventListener('keydown', handleGlobalKeyDown);
  }, [lastInteractedStoreId, quickLookStore, stores]);

  useEffect(() => {
    setVisibleCount(CHUNK_SIZE * 2);
    window.scrollTo({ top: 0 });
  }, [hasActiveFilters, stores.length]);

  const existingLetters = useMemo(() => {
    const letters = new Set<string>();
    stores.forEach(s => {
      letters.add(getStoreGroupingKey(s.store_name));
    });
    return letters;
  }, [stores]);

  const assignedAnchors = new Set<string>();

  const handleScrollTo = (letter: string) => {
    const index = stores.findIndex(s => getStoreGroupingKey(s.store_name) === letter);
    if (index >= visibleCount) {
      setVisibleCount(Math.max(visibleCount, index + CHUNK_SIZE));
    }

    setTimeout(() => {
      const element = document.getElementById(`alpha-anchor-${letter}`);
      if (element) {
        window.scrollTo({
          top: element.getBoundingClientRect().top + window.scrollY - 100,
          behavior: "smooth"
        });
      }
    }, 50);
  };

  if (stores.length === 0) {
    return (
      <div className="text-center py-20 font-display italic opacity-60">
        {hasActiveFilters ? "No matches found in registry." : (isArchivedView ? "Archival database is empty." : "No records found.")}
      </div>
    );
  }

  const visibleStores = stores.slice(0, visibleCount);

  return (
    <div className="relative">
      <div className="fixed right-2 top-1/2 -translate-y-1/2 z-30 flex flex-col items-center gap-0.5 pointer-events-none hidden sm:flex">
         <div className="bg-brand-surface/80 backdrop-blur-md rounded-full py-3 px-1.5 shadow-subtle border border-brand-border pointer-events-auto flex flex-col items-center gap-0.5 overflow-y-auto max-h-[80vh]">
            {ALPHABET.map(char => {
                const isActive = existingLetters.has(char);
                return (
                    <button
                        key={char}
                        onClick={() => isActive && handleScrollTo(char)}
                        disabled={!isActive}
                        style={isActive ? { color: theme.accent } : {}}
                        className={`text-[10px] w-5 h-5 flex items-center justify-center rounded-full transition-all duration-200 font-medium ${isActive ? 'hover:bg-brand-primary hover:text-brand-surface cursor-pointer font-bold' : 'text-brand-text-secondary/30 cursor-default'}`}
                    >
                        {char}
                    </button>
                );
            })}
         </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 pr-0 sm:pr-8">
        {visibleStores.map((store, index) => {
          const letter = getStoreGroupingKey(store.store_name);
          let anchorId = undefined;
          if (!assignedAnchors.has(letter)) {
              assignedAnchors.add(letter);
              anchorId = `alpha-anchor-${letter}`;
          }
          return (
            <div 
              key={store.id}
              className="animate-in fade-in slide-in-from-bottom-4 duration-700 fill-mode-both"
              style={{ animationDelay: `${(index % CHUNK_SIZE) * 60}ms` }}
              onMouseEnter={() => setLastInteractedStoreId(store.id)}
            >
              <StoreCard
                id={anchorId}
                store={store}
                user={user}
                collections={collections}
                onEdit={onEdit}
                onArchive={() => onArchive(store.id)}
                onRestore={() => onRestore(store.id)}
                onDeletePermanently={() => onDeletePermanently(store.id)}
                onMove={(targetId) => onMoveStore && onMoveStore(store.id, targetId)}
                isArchivedView={isArchivedView}
                isSelected={selectedStoreIds.has(store.id)}
                onToggleSelection={() => {
                  onToggleSelection(store.id);
                  setLastInteractedStoreId(store.id);
                }}
                isGeneratingImage={generatingImageIds.has(store.id)}
                onGenerateImage={() => onGenerateImage(store.id)}
                isScraping={scrapingStoreIds.has(store.id)}
                onDragStart={onDragStart}
              />
            </div>
          );
        })}
      </div>

      <div 
        ref={observerTarget} 
        className="h-20 w-full flex items-center justify-center mt-8 opacity-40 italic font-display text-sm"
      >
        {visibleCount < stores.length ? "Gathering more archival records..." : "End of registry reached."}
      </div>

      {quickLookStore && (
        <QuickLookModal 
          store={quickLookStore} 
          onClose={() => setQuickLookStore(null)} 
          theme={theme}
        />
      )}
    </div>
  );
};

export default StoreList;
