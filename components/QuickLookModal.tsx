
import React, { useEffect } from 'react';
import { Store, ThemeConfig } from '../types';
import { CloseIcon } from './icons/CloseIcon';
import TagPill from './TagPill';
import { t } from '../utils/localization';

interface QuickLookModalProps {
  store: Store;
  onClose: () => void;
  theme: ThemeConfig;
}

const QuickLookModal: React.FC<QuickLookModalProps> = ({ store, onClose, theme }) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' || e.code === 'Space') {
        e.preventDefault();
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  const locationString = [t(store.city), t(store.country)].filter(Boolean).join(', ');

  return (
    <div 
      className="fixed inset-0 z-[200] flex items-center justify-center p-medium-lg animate-in fade-in duration-300 backdrop-blur-xl bg-black/20"
      onClick={onClose}
    >
      <div 
        className="bg-brand-surface w-full max-w-4xl rounded-3xl overflow-hidden shadow-2xl flex flex-col md:flex-row max-h-[85vh] border border-brand-border"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Left: Visual Section */}
        <div className="w-full md:w-1/2 h-64 md:h-auto relative bg-brand-bg">
          {store.imageUrl ? (
            <img 
              src={store.imageUrl} 
              alt={store.store_name} 
              className="w-full h-full object-cover animate-in zoom-in duration-700"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center opacity-20">
               <span className="font-display text-display-lg font-light italic">Preview</span>
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent pointer-events-none" />
        </div>

        {/* Right: Editorial Content */}
        <div className="w-full md:w-1/2 p-medium-lg md:p-large-sm flex flex-col overflow-y-auto custom-scrollbar">
          <div className="flex justify-between items-start mb-medium-lg">
             <div>
                <p className="text-[9px] uppercase tracking-[0.4em] font-bold opacity-70 font-sans mb-2">
                  Brand Insight
                </p>
                <h2 className="text-5xl font-light font-display italic tracking-tight text-brand-text-primary leading-none">
                  {store.store_name}
                </h2>
             </div>
             <button 
               onClick={onClose}
               className="p-tight-md hover:bg-brand-bg rounded-full transition-colors"
             >
               <CloseIcon />
             </button>
          </div>

          <div className="space-y-medium-lg">
            {locationString && (
              <div>
                <p className="text-[9px] uppercase tracking-[0.3em] font-bold opacity-70 font-sans mb-1">Location</p>
                <p className="text-large font-display italic text-brand-text-primary">{locationString}</p>
              </div>
            )}

            <div>
              <p className="text-[9px] uppercase tracking-[0.3em] font-bold opacity-70 font-sans mb-1">Synthesis</p>
              <p className="text-base text-brand-text-secondary leading-relaxed font-normal">
                {store.description || "The curator has not yet provided an editorial summary for this brand."}
              </p>
            </div>

            <div className="pt-medium-sm border-t border-brand-border">
              <p className="text-[9px] uppercase tracking-[0.3em] font-bold opacity-70 font-sans mb-3">Classifications</p>
              <div className="flex flex-wrap gap-2">
                {store.tags.map(tag => (
                  <TagPill key={tag} label={tag} />
                ))}
              </div>
            </div>
          </div>

          <div className="mt-auto pt-large-sm flex items-center justify-between opacity-40">
             <span className="text-[9px] uppercase tracking-[0.5em] font-sans font-bold">Quick Look MMXXV</span>
             <span className="text-[9px] uppercase tracking-[0.2em] font-sans font-bold">Press Space to close</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuickLookModal;
