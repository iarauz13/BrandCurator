
import React, { useState } from 'react';
import { Collection } from '../types';
import { CloseIcon } from './icons/CloseIcon';
import { FolderIcon } from './icons/FolderIcon';

interface MoveCollectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onMove: (targetCollectionId: string) => void;
  collections: Collection[];
  currentCollectionId: string;
  storeName: string;
  // New props for reusability (Copy/Add flow)
  title?: string;
  message?: string;
  actionLabel?: string;
}

const MoveCollectionModal: React.FC<MoveCollectionModalProps> = ({ 
    isOpen, 
    onClose, 
    onMove, 
    collections, 
    currentCollectionId,
    storeName,
    title = "Move Item",
    message,
    actionLabel = "Move Item"
}) => {
  // Filter out the current collection from the list of targets.
  // If currentCollectionId is empty string (e.g. from a shared item), all collections are available.
  const availableCollections = collections.filter(c => c.id !== currentCollectionId);
  const [selectedId, setSelectedId] = useState<string>(availableCollections.length > 0 ? availableCollections[0].id : '');

  if (!isOpen) return null;

  const handleMove = () => {
      if (selectedId) {
          onMove(selectedId);
          onClose();
      }
  };

  const displayMessage = message || `Select a new collection for <strong>${storeName}</strong>. This will restore the item and move it to the selected collection.`;

  return (
    <div 
        className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 transition-opacity"
        onClick={onClose}
    >
      <div 
        className="bg-brand-surface rounded-lg shadow-xl w-full max-w-md m-4 p-6 relative"
        onClick={(e) => e.stopPropagation()}
      >
        <button onClick={onClose} className="absolute top-4 right-4 text-brand-text-secondary hover:text-brand-primary z-10">
            <CloseIcon />
        </button>

        <h3 className="text-xl font-bold mb-2 text-brand-text-primary font-display">{title}</h3>
        <p className="text-brand-text-secondary mb-6 text-sm" dangerouslySetInnerHTML={{ __html: displayMessage }}></p>

        {availableCollections.length === 0 ? (
            <div className="text-center py-4 bg-brand-bg rounded-md border border-brand-border mb-6">
                <p className="text-brand-text-secondary text-sm">No available collections.</p>
            </div>
        ) : (
            <div className="mb-6">
                <label className="block text-sm font-medium text-brand-text-secondary mb-2">Destination Collection</label>
                <div className="space-y-2 max-h-60 overflow-y-auto">
                    {availableCollections.map(collection => (
                        <button
                            key={collection.id}
                            onClick={() => setSelectedId(collection.id)}
                            className={`w-full flex items-center gap-3 p-3 rounded-md border text-left transition-all ${
                                selectedId === collection.id 
                                ? 'bg-brand-secondary/10 border-brand-secondary text-brand-primary ring-1 ring-brand-secondary' 
                                : 'bg-brand-bg border-brand-border text-brand-text-primary hover:border-brand-secondary'
                            }`}
                        >
                            <FolderIcon className={selectedId === collection.id ? "text-brand-secondary" : "text-brand-text-secondary"} />
                            <span className="font-medium">{collection.name}</span>
                            <span className="ml-auto text-xs text-brand-text-secondary">{collection.stores.length} items</span>
                        </button>
                    ))}
                </div>
            </div>
        )}

        <div className="flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-brand-border text-brand-text-primary font-semibold rounded-md hover:opacity-80 transition"
          >
            Cancel
          </button>
          <button
            onClick={handleMove}
            disabled={availableCollections.length === 0 || !selectedId}
            className="px-4 py-2 bg-brand-primary text-white font-semibold rounded-md hover:opacity-90 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {actionLabel}
          </button>
        </div>
      </div>
    </div>
  );
};

export default MoveCollectionModal;
