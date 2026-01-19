
import React, { useState } from 'react';
import { Folio, Store, ThemeConfig } from '../types';
import { CloseIcon } from './icons/CloseIcon';
import { TrashIcon } from './icons/TrashIcon';
import ConfirmationModal from './ConfirmationModal';

interface FolioBinderDetailsProps {
  folio: Folio;
  stores: Store[];
  onClose: () => void;
  onRemoveFromFolio: (storeId: string) => void;
  onClearFolio: () => void;
  onOpenSelection: () => void;
  theme: ThemeConfig;
}

const FolioBinderDetails: React.FC<FolioBinderDetailsProps> = ({
  folio,
  stores,
  onClose,
  onRemoveFromFolio,
  onClearFolio,
  onOpenSelection,
  theme
}) => {
  const folioStores = stores.filter(s => folio.storeIds.includes(s.id));
  const [isClearConfirmOpen, setIsClearConfirmOpen] = useState(false);

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-[110] 
      flex items-center justify-center p-medium-lg">
      <div className="bg-brand-surface rounded-3xl w-full max-w-4xl max-h-[85vh] 
        overflow-hidden flex flex-col shadow-2xl border border-brand-border animate-in zoom-in-95">
        
        {/* Folio Header */}
        <div 
          style={{ background: theme.background }}
          className="p-medium-lg flex justify-between items-end border-b 
            border-brand-border min-h-[160px] relative"
        >
          <div className="relative z-10">
            <h2 className="text-display-md font-semibold text-white 
              font-display leading-tight drop-shadow-md">
              {folio.name}
            </h2>
            <p className="text-white/80 text-small uppercase tracking-[0.2em] 
              font-semibold mt-tight-md">
              {folioStores.length} Entries in Registry
            </p>
          </div>
          <div className="flex gap-tight-md relative z-10">
            <button 
              onClick={onOpenSelection}
              className="px-medium-sm py-tight-md bg-white text-brand-primary 
                hover:bg-white/90 rounded-xl text-small font-semibold 
                transition-all shadow-lg"
            >
              Add Brands
            </button>
            <button 
              onClick={() => setIsClearConfirmOpen(true)}
              className="px-medium-sm py-tight-md bg-white/10 hover:bg-white/20 
                backdrop-blur-md text-white rounded-xl text-small font-semibold 
                transition-all border border-white/20"
            >
              Empty Binder
            </button>
            <button 
              onClick={onClose}
              className="p-tight-md bg-white/10 hover:bg-white/20 
                backdrop-blur-md text-white rounded-full transition-all"
            >
              <CloseIcon className="size-6" />
            </button>
          </div>
        </div>

        {/* Brand List */}
        <div className="flex-grow overflow-y-auto p-medium-lg custom-scrollbar">
          {folioStores.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-medium-sm">
              {folioStores.map(store => (
                <div 
                  key={store.id}
                  className="flex items-center justify-between p-medium-sm 
                    bg-brand-bg rounded-2xl border border-brand-border group 
                    hover:border-brand-secondary transition-colors"
                >
                  <div className="flex items-center gap-medium-sm overflow-hidden">
                    <div className="size-12 rounded-lg bg-white shrink-0 
                      overflow-hidden border border-brand-border">
                      {store.imageUrl ? (
                        <img src={store.imageUrl} alt="" className="size-full object-cover" />
                      ) : (
                        <div className="size-full bg-brand-secondary/10" />
                      )}
                    </div>
                    <div className="truncate">
                      <p className="font-display text-large font-semibold 
                        text-brand-text-primary truncate">
                        {store.store_name}
                      </p>
                      <p className="text-small text-brand-text-secondary 
                        truncate font-normal uppercase tracking-widest">
                        {store.city}
                      </p>
                    </div>
                  </div>
                  <button 
                    onClick={() => onRemoveFromFolio(store.id)}
                    className="p-tight-md text-brand-text-secondary 
                      hover:text-red-500 transition-colors"
                    title="Remove from Binder"
                  >
                    <TrashIcon className="size-5" />
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-extra-large text-center opacity-40">
              <p className="font-display text-display-sm font-semibold">
                Binder is empty.
              </p>
              <p className="text-base mt-tight-md font-normal">
                Select brands from your collection to organize them in this folio.
              </p>
            </div>
          )}
        </div>

        <div className="p-medium-lg border-t border-brand-border text-center">
          <span className="text-small uppercase tracking-[0.5em] 
            text-brand-text-secondary font-semibold opacity-30">
            Archival Registry System
          </span>
        </div>
      </div>

      <ConfirmationModal 
        isOpen={isClearConfirmOpen}
        onClose={() => setIsClearConfirmOpen(false)}
        onConfirm={onClearFolio}
        title="Empty this Binder?"
        message={`This will remove all ${folioStores.length} brands from "${folio.name}". Note: The brands will still remain in your global collection.`}
        confirmVariant="danger"
        confirmButtonText="Empty Binder"
      />
    </div>
  );
};

export default FolioBinderDetails;
