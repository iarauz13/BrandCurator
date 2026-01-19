
import React from 'react';
import { t } from '../utils/localization';

interface SelectionCounterProps {
  count: number;
  onClear: () => void;
}

/**
 * SelectionCounter component provides a floating indicator of how many items are currently selected.
 * 
 * Architectural Choice: 
 * Using 'fixed' positioning ensures it remains visible regardless of scroll depth.
 * The component is decoupled from the main list logic, only receiving the count.
 */
const SelectionCounter: React.FC<SelectionCounterProps> = ({ count, onClear }) => {
  if (count <= 1) return null;

  return (
    <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-[60] animate-in fade-in slide-in-from-bottom-4 duration-300">
      <div 
        style={{ backgroundColor: 'var(--brand-accent)', color: 'var(--brand-text-on-accent)' }}
        className="px-6 py-3 rounded-full shadow-2xl flex items-center gap-4 border border-white/10 backdrop-blur-md"
      >
        <div className="flex items-center gap-2">
          <span className="flex items-center justify-center w-6 h-6 bg-white/20 text-current rounded-full text-xs font-bold ring-2 ring-white/10">
            {count}
          </span>
          <span className="text-sm font-medium tracking-tight whitespace-nowrap">
            {t('stores_selected')}
          </span>
        </div>
        
        <div className="w-px h-4 bg-white/20" />
        
        <button 
          onClick={onClear}
          className="text-xs font-bold uppercase tracking-widest opacity-80 hover:opacity-100 transition-opacity"
        >
          {t('clear')}
        </button>
      </div>
    </div>
  );
};

export default SelectionCounter;
