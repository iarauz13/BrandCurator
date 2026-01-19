import React, { useState } from 'react';
import { Folio, Store, ThemeConfig } from '../types';
import FolioBinder from './FolioBinder';
import FolioBinderDetails from './FolioBinderDetails';
import FolioSelectionModal from './FolioSelectionModal';
import { THEME_PRESETS } from '../constants/themes';
import { PlusCircleIcon } from './icons/PlusCircleIcon';
import { CloseIcon } from './icons/CloseIcon';
import ConfirmationModal from './ConfirmationModal';

interface FolioSectionProps {
  folios: Folio[];
  stores: Store[];
  onAddFolio: (name: string, themeId: string) => void;
  onDeleteFolio: (folioId: string) => void;
  onSyncFolio: (folioId: string, storeIds: string[]) => void;
  theme: ThemeConfig;
  onRemoveFromFolio: (storeId: string, folioId: string) => void;
  onClearFolio: (folioId: string) => void;
}

const FolioSection: React.FC<FolioSectionProps> = ({
  folios,
  stores,
  onAddFolio,
  onDeleteFolio,
  onSyncFolio,
  onRemoveFromFolio,
  onClearFolio,
  theme
}) => {
  const [isAdding, setIsAdding] = useState(false);
  const [newFolioName, setNewFolioName] = useState('');
  const [selectedThemeId, setSelectedThemeId] = useState(THEME_PRESETS[0].id);
  const [activeFolioId, setActiveFolioId] = useState<string | null>(null);
  const [isSelecting, setIsSelecting] = useState(false);
  const [folioToDelete, setFolioToDelete] = useState<Folio | null>(null);

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newFolioName.trim()) {
      onAddFolio(newFolioName.trim(), selectedThemeId);
      setNewFolioName('');
      setIsAdding(false);
    }
  };

  const handleOpenSelection = (folioId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setActiveFolioId(folioId);
    setIsSelecting(true);
  };

  const handleDeleteRequest = (folio: Folio, e: React.MouseEvent) => {
    e.stopPropagation();
    setFolioToDelete(folio);
  };

  const confirmDeleteFolio = () => {
    if (folioToDelete) {
      onDeleteFolio(folioToDelete.id);
      setFolioToDelete(null);
      if (activeFolioId === folioToDelete.id) {
        setActiveFolioId(null);
      }
    }
  };

  const activeFolio = folios.find(f => f.id === activeFolioId);

  return (
    <div className="space-y-large-lg animate-in fade-in duration-700">
      <div className="flex justify-between items-center border-b 
        border-brand-border pb-medium-lg">
        <div>
          <h2 className="text-display-md font-semibold font-display 
            leading-tight">Folio Registry</h2>
          <p className="text-base text-brand-text-secondary mt-tight-md 
            font-normal">
            Organize items into curated architectural binders.
          </p>
        </div>
        <button 
          onClick={() => setIsAdding(true)}
          className="flex items-center gap-tight-md px-medium-lg py-medium-sm 
            bg-brand-primary text-white rounded-full font-semibold text-small 
            uppercase tracking-widest hover:opacity-90 transition-all 
            shadow-lg active:scale-95"
        >
          <PlusCircleIcon className="size-5" />
          <span>New Binder</span>
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 
        xl:grid-cols-4 gap-large-sm">
        {folios.map(folio => (
          <div key={folio.id} onClick={() => setActiveFolioId(folio.id)}>
            <FolioBinder 
              folio={folio} 
              storeCount={folio.storeIds.length}
              onAddClick={(e) => handleOpenSelection(folio.id, e)}
              onDeleteClick={(e) => handleDeleteRequest(folio, e)}
            />
          </div>
        ))}
        {folios.length === 0 && !isAdding && (
          <div className="col-span-full py-extra-large text-center border-2 
            border-dashed border-brand-border rounded-3xl opacity-40">
            <p className="font-display text-display-sm font-semibold">
              Registry empty.
            </p>
          </div>
        )}
      </div>

      {isAdding && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[110] 
          flex items-center justify-center p-medium-lg">
          <div className="bg-brand-surface rounded-2xl p-medium-lg w-full 
            max-w-md shadow-2xl animate-in zoom-in-95 duration-200 
            border border-brand-border">
            <div className="flex justify-between items-center mb-medium-lg">
              <h3 className="text-display-sm font-display font-semibold">
                Create Binder
              </h3>
              <button onClick={() => setIsAdding(false)}><CloseIcon /></button>
            </div>
            <form onSubmit={handleAddSubmit} className="space-y-medium-sm">
              <div>
                <label className="block text-small uppercase tracking-widest 
                  font-semibold text-brand-text-secondary mb-tight-md">
                  Binder Label
                </label>
                <input 
                  autoFocus
                  required
                  type="text" 
                  value={newFolioName}
                  onChange={(e) => setNewFolioName(e.target.value)}
                  placeholder="e.g., Summer Favorites"
                  className="w-full bg-brand-bg border border-brand-border 
                    rounded-xl p-medium-sm focus:ring-2 
                    focus:ring-brand-secondary outline-none transition-all 
                    font-display text-large font-semibold text-brand-text-primary"
                />
              </div>
              <div className="grid grid-cols-5 gap-tight-md">
                {THEME_PRESETS.map(p => (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => setSelectedThemeId(p.id)}
                    className={`h-10 rounded-lg border-2 
                      ${selectedThemeId === p.id 
                        ? 'border-brand-primary scale-110 shadow-md' 
                        : 'border-transparent'}`}
                    style={{ background: p.background }}
                  />
                ))}
              </div>
              <button 
                type="submit"
                className="w-full py-medium-lg bg-brand-primary text-white 
                  font-semibold rounded-xl shadow-lg hover:opacity-90 
                  active:scale-95 transition-all text-small uppercase"
              >
                Create Folio
              </button>
            </form>
          </div>
        </div>
      )}

      {activeFolio && (
        <FolioBinderDetails 
          folio={activeFolio}
          stores={stores}
          onClose={() => setActiveFolioId(null)}
          onRemoveFromFolio={(storeId) => 
            onRemoveFromFolio(storeId, activeFolio.id)
          }
          onClearFolio={() => onClearFolio(activeFolio.id)}
          onOpenSelection={() => setIsSelecting(true)}
          theme={THEME_PRESETS.find(p => p.id === activeFolio.themeId) || theme}
        />
      )}

      {activeFolio && isSelecting && (
        <FolioSelectionModal 
          isOpen={isSelecting}
          onClose={() => setIsSelecting(false)}
          allStores={stores}
          selectedStoreIds={activeFolio.storeIds}
          onSave={(ids) => {
            onSyncFolio(activeFolio.id, ids);
            setIsSelecting(false);
          }}
          theme={theme}
          folioName={activeFolio.name}
        />
      )}

      {folioToDelete && (
        <ConfirmationModal 
          isOpen={!!folioToDelete}
          onClose={() => setFolioToDelete(null)}
          onConfirm={confirmDeleteFolio}
          title="Remove Binder?"
          message={`This will permanently delete the binder "${folioToDelete.name}" and remove all internal categorization. The brands themselves will remain in your global collection.`}
          confirmVariant="danger"
          confirmButtonText="Delete Binder"
        />
      )}
    </div>
  );
};

export default FolioSection;