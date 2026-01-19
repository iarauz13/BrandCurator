
import React, { useMemo } from 'react';
import { Collection, Store } from '../types';
import { GridIcon } from './icons/GridIcon';
import { WorldIcon } from './icons/WorldIcon';
import { CloseIcon } from './icons/CloseIcon';
import { t } from '../utils/localization';
import { StoreFilters } from '../App';
import { PRICE_BUCKETS, getPriceBucket } from '../utils/priceMapper';

type CollectionView = 'grid' | 'map';

interface DynamicFilterSidebarProps {
  isOpen: boolean;
  collection: Collection;
  filteredStores: Store[]; 
  filters: StoreFilters;
  onFilterChange: (filters: StoreFilters) => void;
  collectionView: CollectionView;
  onCollectionViewChange: (view: CollectionView) => void;
  onClose: () => void;
}

const FilterSection: React.FC<{ 
  title: string; 
  children: React.ReactNode 
}> = ({ title, children }) => (
  <div className="space-y-medium-sm">
    <label className="text-[10px] font-bold uppercase text-brand-primary tracking-[0.2em]">
      {title}
    </label>
    <div className="grid grid-cols-1 gap-tight-md">
      {children}
    </div>
  </div>
);

const FilterButton: React.FC<{
  label: string;
  count: number;
  isActive: boolean;
  onClick: () => void;
}> = ({ label, count, isActive, onClick }) => (
  <button
    onClick={onClick}
    disabled={count === 0 && !isActive}
    className={`flex items-center justify-between px-medium-sm py-medium-sm rounded-lg border transition-all text-left group
      ${isActive 
        ? 'bg-brand-primary border-brand-primary text-white shadow-md' 
        : 'bg-brand-bg border-brand-border text-brand-text-primary hover:border-brand-secondary'
      }
      ${count === 0 && !isActive ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer'}
    `}
  >
    <span className="text-base font-normal truncate pr-medium-sm">
      {t(label)}
    </span>
    <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-full 
      ${isActive ? 'bg-white/20 text-white' : 'bg-brand-border text-brand-primary'}
    `}>
      {count}
    </span>
  </button>
);

const DynamicFilterSidebar: React.FC<DynamicFilterSidebarProps> = ({ 
  isOpen,
  collection: activeCollection, 
  filteredStores,
  filters, 
  onFilterChange, 
  collectionView, 
  onCollectionViewChange, 
  onClose 
}) => {
  /**
   * Faceted Statistics Logic
   * Calculates attribute frequency BASED ON CURRENT FILTERS.
   */
  const stats = useMemo(() => {
    const allStores = activeCollection.stores as Store[];
    const uniqueTags: Record<string, number> = {};
    const fieldCounts: Record<string, Record<string, number>> = {};
    const priceRangeCounts: Record<string, number> = {};
    let saleCount = 0;

    // Initialize map with all possible options
    allStores.forEach(s => {
      s.tags.forEach(tag => { if (!uniqueTags[tag]) uniqueTags[tag] = 0; });
      Object.entries(s.customFields).forEach(([field, values]) => {
        if (!fieldCounts[field]) fieldCounts[field] = {};
        values.forEach(val => { if (!fieldCounts[field][val]) fieldCounts[field][val] = 0; });
      });
      PRICE_BUCKETS.forEach(b => { if (!priceRangeCounts[b.id]) priceRangeCounts[b.id] = 0; });
    });

    // Populate counts based on the filtered result set
    filteredStores.forEach((s: Store) => {
      if (s.onSale) saleCount++;
      
      const pBucket = getPriceBucket(s.priceRange);
      if (pBucket !== 'unknown') {
        priceRangeCounts[pBucket] = (priceRangeCounts[pBucket] || 0) + 1;
      }

      s.tags.forEach(tag => {
        uniqueTags[tag] = (uniqueTags[tag] || 0) + 1;
      });

      Object.entries(s.customFields).forEach(([field, values]) => {
        if (!fieldCounts[field]) fieldCounts[field] = {};
        values.forEach(val => {
          fieldCounts[field][val] = (fieldCounts[field][val] || 0) + 1;
        });
      });
    });

    return { uniqueTags, fieldCounts, saleCount, priceRangeCounts };
  }, [activeCollection.stores, filteredStores]);

  const toggleTag = (tag: string) => {
    const nextTags = filters.tags.includes(tag)
      ? filters.tags.filter(t => t !== tag)
      : [...filters.tags, tag];
    onFilterChange({ ...filters, tags: nextTags });
  };

  const togglePriceRange = (rangeId: string) => {
    const nextRanges = filters.priceRanges.includes(rangeId)
      ? filters.priceRanges.filter(r => r !== rangeId)
      : [...filters.priceRanges, rangeId];
    onFilterChange({ ...filters, priceRanges: nextRanges });
  };

  const toggleCustomField = (field: string, option: string) => {
    const currentOptions = filters.customFields[field] || [];
    const nextOptions = currentOptions.includes(option)
      ? currentOptions.filter(o => o !== option)
      : [...currentOptions, option];
    onFilterChange({
      ...filters,
      customFields: { ...filters.customFields, [field]: nextOptions }
    });
  };

  return (
    <>
      <div 
        className={`fixed inset-0 bg-black/30 backdrop-blur-[2px] z-[120] transition-opacity duration-500 ease-in-out ${isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}
        onClick={onClose}
      />

      <div className={`fixed top-0 right-0 h-full w-full sm:max-w-sm bg-brand-surface shadow-2xl z-[121] transform transition-transform duration-500 ease-[cubic-bezier(0.4,0,0.2,1)] border-l border-brand-border flex flex-col ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}>
        <div className="p-medium-lg border-b border-brand-border flex justify-between items-center bg-brand-bg/50">
          <h3 className="text-display-sm font-semibold text-brand-primary font-display">Curation</h3>
          <button onClick={onClose} className="p-tight-md hover:bg-brand-bg rounded-full text-brand-primary transition-colors">
            <CloseIcon className="size-5" />
          </button>
        </div>
        
        <div className="flex-grow overflow-y-auto p-medium-lg space-y-large-lg custom-scrollbar">
          <FilterSection title="Display Architecture">
            <div className="grid grid-cols-2 gap-medium-sm">
              <button onClick={() => onCollectionViewChange('grid')} className={`flex flex-col items-center justify-center p-medium-sm rounded-xl border transition-all ${collectionView === 'grid' ? 'bg-brand-primary text-white shadow-md' : 'bg-brand-bg text-brand-primary border-brand-border hover:border-brand-secondary'}`}>
                <GridIcon /> 
                <span className="text-[10px] uppercase mt-2 font-bold">Grid</span>
              </button>
              <button onClick={() => onCollectionViewChange('map')} className={`flex flex-col items-center justify-center p-medium-sm rounded-xl border transition-all ${collectionView === 'map' ? 'bg-brand-primary text-white shadow-md' : 'bg-brand-bg text-brand-primary border-brand-border hover:border-brand-secondary'}`}>
                <WorldIcon /> 
                <span className="text-[10px] uppercase mt-2 font-bold">Map</span>
              </button>
            </div>
          </FilterSection>

          <FilterSection title="Registry Status">
            <FilterButton label="Has Active Sales" count={stats.saleCount} isActive={filters.onSale} onClick={() => onFilterChange({ ...filters, onSale: !filters.onSale })} />
          </FilterSection>

          <FilterSection title="Price Threshold">
            {PRICE_BUCKETS.map(bucket => {
              const count = stats.priceRangeCounts[bucket.id] || 0;
              if (count === 0 && !filters.priceRanges.includes(bucket.id)) return null;
              return (
                <FilterButton key={bucket.id} label={bucket.label} count={count} isActive={filters.priceRanges.includes(bucket.id)} onClick={() => togglePriceRange(bucket.id)} />
              );
            })}
          </FilterSection>

          {activeCollection.template.fields.map(field => {
            const options = stats.fieldCounts[field.label] || {};
            if (Object.keys(options).length === 0) return null;
            return (
              <FilterSection key={field.label} title={field.label}>
                {Object.entries(options)
                  .sort(([a], [b]) => t(a).localeCompare(t(b)))
                  .filter(([opt, count]) => (count as number) > 0 || (filters.customFields[field.label] || []).includes(opt))
                  .map(([opt, count]) => (
                    <FilterButton key={opt} label={opt} count={count as number} isActive={(filters.customFields[field.label] || []).includes(opt)} onClick={() => toggleCustomField(field.label, opt)} />
                  ))}
              </FilterSection>
            );
          })}

          {Object.keys(stats.uniqueTags).length > 0 && (
            <FilterSection title="Collection Tags">
              <div className="flex flex-wrap gap-tight-md">
                {Object.entries(stats.uniqueTags)
                  .sort(([a], [b]) => t(a).localeCompare(t(b)))
                  .filter(([tag, count]) => (count as number) > 0 || filters.tags.includes(tag))
                  .map(([tag, count]) => (
                    <button key={tag} onClick={() => toggleTag(tag)} className={`px-3 py-1.5 rounded-full border text-small font-semibold transition-all ${filters.tags.includes(tag) ? 'bg-brand-primary text-white shadow-sm' : 'bg-brand-bg text-brand-primary border-brand-border hover:border-brand-secondary'}`}>
                      {t(tag)} ({count})
                    </button>
                  ))}
              </div>
            </FilterSection>
          )}
        </div>

        <div className="p-medium-lg border-t border-brand-border bg-brand-bg/50">
          <button onClick={onClose} className="w-full py-medium-lg bg-brand-primary text-white font-semibold rounded-xl text-small uppercase tracking-[0.1em] shadow-lg active:scale-95 transition-all hover:opacity-95">
            View {filteredStores.length} Results
          </button>
        </div>
      </div>
    </>
  );
};

export default DynamicFilterSidebar;
