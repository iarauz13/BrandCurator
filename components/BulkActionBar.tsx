
import React, { useState, useMemo } from 'react';
import { Folio, ThemeConfig, Store } from '../types';
import { FolderIcon } from './icons/FolderIcon';
import { ShareIcon } from './icons/ShareIcon';
import { TrashIcon } from './icons/TrashIcon';
import { ChevronDownIcon } from './icons/ChevronDownIcon';
import { SparklesIcon } from './icons/SparklesIcon';

interface BulkActionBarProps {
  count: number;
  folios: Folio[];
  selectedStores: Store[];
  onClear: () => void;
  onAddToFolio: (folioId: string) => void;
  onShare: () => void;
  onDelete: () => void;
  onEnrich: () => void;
  theme: ThemeConfig;
}

const BulkActionBar: React.FC<BulkActionBarProps> = ({
  count,
  folios,
  selectedStores,
  onClear,
  onAddToFolio,
  onShare,
  onDelete,
  onEnrich,
  theme
}) => {
  const [showFolioDropdown, setShowFolioDropdown] = useState(false);

  // Requirement: Button should only be active if at least one selected item is missing data
  const needsEnrichment = useMemo(() => {
    return selectedStores.some(s => {
      const websiteEmpty = !s.website || /^(none|n\/a|na|false)$/i.test(s.website.trim());
      const descEmpty = !s.description || s.description.length < 10 || /^(none|n\/a|na|false)$/i.test(s.description.trim());
      return websiteEmpty || descEmpty;
    });
  }, [selectedStores]);

  if (count <= 1) return null;

  return (
    <div className="fixed bottom-medium-lg left-1/2 -translate-x-1/2 z-[70] 
      animate-in fade-in slide-in-from-bottom-4 duration-500 w-full 
      max-w-3xl px-medium-sm">
      <div 
        style={{ 
          backgroundColor: theme.textPrimary, 
          color: theme.background.includes('gradient') ? '#FFF' : theme.textOnAccent 
        }}
        className="flex items-center justify-between p-tight-md px-medium-lg 
          rounded-2xl shadow-2xl border border-white/10 backdrop-blur-md"
      >
        <div className="flex items-center gap-medium-sm">
          <span className="flex items-center justify-center size-8 
            bg-white/20 rounded-full text-small font-semibold">
            {count}
          </span>
          <span className="text-small font-semibold uppercase tracking-widest 
            hidden sm:inline">
            Brands Selected
          </span>
        </div>

        <div className="flex items-center gap-tight-md">
          {/* Enrich with AI */}
          <button 
            onClick={onEnrich}
            disabled={!needsEnrichment}
            className={`flex items-center gap-tight-sm px-medium-sm py-tight-md 
              rounded-lg transition-all text-small font-semibold
              ${needsEnrichment 
                ? 'text-brand-secondary hover:bg-white/10' 
                : 'text-white/20 cursor-not-allowed grayscale'}`}
            title={needsEnrichment ? "Research missing data with AI" : "All selected brands have data"}
          >
            <SparklesIcon />
            <span className="hidden md:inline">Enrich</span>
          </button>

          {/* Add to Folio Dropdown */}
          <div className="relative">
            <button 
              onClick={() => setShowFolioDropdown(!showFolioDropdown)}
              className="flex items-center gap-tight-sm px-medium-sm py-tight-md 
                hover:bg-white/10 rounded-lg transition-colors text-small 
                font-semibold"
            >
              <FolderIcon className="size-5" />
              <span className="hidden md:inline">Folio</span>
              <ChevronDownIcon className="size-4" />
            </button>
            
            {showFolioDropdown && (
              <div className="absolute bottom-full mb-tight-md right-0 w-48 
                bg-brand-surface rounded-xl shadow-2xl border border-brand-border 
                py-tight-md overflow-hidden animate-in fade-in slide-in-from-bottom-2">
                <p className="px-medium-sm py-tight-sm text-[10px] uppercase 
                  font-semibold text-brand-text-secondary tracking-widest">
                  Assign to Folio
                </p>
                {folios.length > 0 ? (
                  folios.map(f => (
                    <button
                      key={f.id}
                      onClick={() => {
                        onAddToFolio(f.id);
                        setShowFolioDropdown(false);
                      }}
                      className="w-full text-left px-medium-sm py-tight-md 
                        text-brand-text-primary text-small hover:bg-brand-bg 
                        transition-colors"
                    >
                      {f.name}
                    </button>
                  ))
                ) : (
                  <p className="px-medium-sm py-tight-md text-small 
                    text-brand-text-secondary italic">No folios available</p>
                )}
              </div>
            )}
          </div>

          <button 
            onClick={onShare}
            className="flex items-center gap-tight-sm px-medium-sm py-tight-md 
              hover:bg-white/10 rounded-lg transition-colors text-small 
              font-semibold"
          >
            <ShareIcon className="size-5" />
            <span className="hidden md:inline">Share</span>
          </button>

          <button 
            onClick={onDelete}
            className="flex items-center gap-tight-sm px-medium-sm py-tight-md 
              hover:bg-red-500/20 text-red-400 rounded-lg transition-colors 
              text-small font-semibold"
          >
            <TrashIcon className="size-5" />
            <span className="hidden md:inline">Delete</span>
          </button>

          <div className="w-px h-6 bg-white/10 mx-tight-sm" />

          <button 
            onClick={onClear}
            className="text-small font-semibold uppercase tracking-widest 
              opacity-60 hover:opacity-100 transition-opacity px-tight-md"
          >
            Clear
          </button>
        </div>
      </div>
    </div>
  );
};

export default BulkActionBar;
