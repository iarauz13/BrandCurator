import React from 'react';
import { Folio } from '../types';
import { THEME_PRESETS } from '../constants/themes';
import { PlusCircleIcon } from './icons/PlusCircleIcon';
import { TrashIcon } from './icons/TrashIcon';

interface FolioBinderProps {
  folio: Folio;
  storeCount: number;
  onAddClick: (e: React.MouseEvent) => void;
  onDeleteClick: (e: React.MouseEvent) => void;
}

const FolioBinder: React.FC<FolioBinderProps> = ({ 
  folio, 
  storeCount, 
  onAddClick,
  onDeleteClick
}) => {
  const theme = THEME_PRESETS.find(p => p.id === folio.themeId) || THEME_PRESETS[0];

  return (
    <div 
      className="group relative h-80 rounded-lg flex flex-col overflow-hidden 
        transition-all duration-500 border-[1px] border-brand-border 
        hover:shadow-subtle-hover bg-brand-surface cursor-pointer"
    >
      <div 
        style={{ background: theme.background }}
        className="absolute inset-0 opacity-100 transition-opacity"
      >
        <div className="absolute top-0 left-tight-md w-px h-full bg-white/20" />
        <div className="absolute top-0 left-[0.75rem] w-px h-full bg-black/5" />
      </div>

      {/* Action Overlay - Similar to StoreCard */}
      <div className="absolute top-4 right-4 z-20 flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
        <button
          onClick={onDeleteClick}
          className="bg-black/40 backdrop-blur-md text-white hover:text-red-400 transition-colors p-2 rounded-lg shadow-sm"
          title="Remove Binder"
        >
          <TrashIcon className="size-5" />
        </button>
      </div>

      <div className="relative z-10 flex-grow flex flex-col items-center 
        justify-center p-medium-lg text-center">
        <div className="bg-white/95 backdrop-blur-md p-medium-sm rounded-lg 
          border-[1px] border-black/5 w-full max-w-[85%] shadow-sm 
          transition-transform duration-500 group-hover:scale-[1.02]">
          <h3 className="text-display-sm font-display font-semibold 
            text-brand-text-primary leading-tight truncate px-tight-md">
            {folio.name}
          </h3>
          <div className="mt-medium-sm pt-tight-md border-t border-black/5 
            flex justify-between items-center text-[10px] uppercase 
            font-semibold tracking-[0.2em] text-brand-text-secondary">
            <span>{storeCount} Entries</span>
            <span className="opacity-40">MMXXV</span>
          </div>
        </div>
      </div>

      <div className="relative z-10 bg-white/40 backdrop-blur-sm border-t 
        border-brand-border p-medium-sm flex gap-tight-md">
        <button 
          onClick={onAddClick}
          className="flex-1 flex items-center justify-center gap-tight-md 
            py-tight-md bg-brand-primary text-white rounded-md text-small 
            font-semibold uppercase tracking-widest hover:opacity-90 
            transition-all active:scale-95 shadow-sm"
        >
          <PlusCircleIcon className="size-4" />
          <span>Add Brands</span>
        </button>
      </div>
    </div>
  );
};

export default FolioBinder;