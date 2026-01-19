
import React, { useState, useEffect, KeyboardEvent } from 'react';
import { Store } from '../types';
import { CloseIcon } from './icons/CloseIcon';
import TagPill from './TagPill';
import { validateStoreInput, LIMITS } from '../utils/validation';
import { normalizeStoreName } from '../utils/textFormatter';
import DuplicateResolutionModal, { ResolutionAction } from './DuplicateResolutionModal';

interface AddStoreModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddStore: (newStore: any) => void;
  onUpdateStore?: (updatedStore: Store) => void;
  existingStores: Store[];
}

const PRICE_RANGES: Store['priceRange'][] = ['<$100', '$100-500', '$500-1000', '>$1000'];

const AddStoreModal: React.FC<AddStoreModalProps> = ({ isOpen, onClose, onAddStore, onUpdateStore, existingStores }) => {
  const [storeName, setStoreName] = useState('');
  const [website, setWebsite] = useState('');
  const [instagram, setInstagram] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [priceRange, setPriceRange] = useState<Store['priceRange']>('');
  const [tagInput, setTagInput] = useState('');
  const [error, setError] = useState('');

  // Conflict State
  const [conflict, setConflict] = useState<{ incoming: Partial<Store>, existing: Store } | null>(null);

  const isAtCapacity = existingStores.length >= LIMITS.MAX_STORES_PER_COLLECTION;

  useEffect(() => {
    if (!isOpen) {
      setStoreName(''); 
      setWebsite(''); 
      setInstagram(''); 
      setTags([]); 
      setPriceRange('');
      setTagInput(''); 
      setError('');
      setConflict(null);
    }
  }, [isOpen]);
  
  const handleAdd = () => {
    if (isAtCapacity) {
      setError(`Collection capacity reached (${LIMITS.MAX_STORES_PER_COLLECTION.toLocaleString()} items max).`);
      return;
    }

    const validation = validateStoreInput({ store_name: storeName, website, tags });
    if (!validation.isValid) {
      setError(validation.error || "Invalid input.");
      return;
    }

    const incomingData = {
      store_name: storeName.trim(),
      website: website.trim().toLowerCase(),
      instagram_name: instagram.replace('@', '').trim(),
      tags: tags,
      priceRange: priceRange
    };

    // Check for collisions
    const incomingKey = normalizeStoreName(incomingData.store_name);
    const existingMatch = existingStores.find(s => normalizeStoreName(s.store_name) === incomingKey);

    if (existingMatch) {
      setConflict({ incoming: incomingData, existing: existingMatch });
      return;
    }

    onAddStore(incomingData);
  };

  const handleResolve = (action: ResolutionAction) => {
    if (!conflict || !onUpdateStore) return;

    if (action === 'merge') {
      const merged: Store = {
        ...conflict.existing,
        tags: Array.from(new Set([...conflict.existing.tags, ...(conflict.incoming.tags || [])])),
        website: conflict.incoming.website || conflict.existing.website,
        instagram_name: conflict.incoming.instagram_name || conflict.existing.instagram_name,
        priceRange: (conflict.incoming.priceRange as Store['priceRange']) || conflict.existing.priceRange
      };
      onUpdateStore(merged);
    } else if (action === 'overwrite') {
      const overwritten: Store = {
        ...conflict.existing,
        ...conflict.incoming,
        store_name: conflict.incoming.store_name || conflict.existing.store_name,
      };
      onUpdateStore(overwritten);
    }
    // 'skip' does nothing but close the flow
    onClose();
  };
  
  const handleTagInputKeydown = (e: KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'Enter' || e.key === ',') {
          e.preventDefault();
          const value = tagInput.trim();
          if (value && !tags.includes(value) && tags.length < LIMITS.MAX_TAGS_PER_STORE) {
              setTags(prev => [...prev, value]);
          }
          setTagInput('');
      }
  }

  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-[150] p-4" onClick={onClose}>
        <div className="bg-brand-surface rounded-2xl shadow-2xl w-full max-w-lg p-8 relative animate-in fade-in zoom-in-95 duration-200" onClick={e => e.stopPropagation()}>
          <button onClick={onClose} className="absolute top-6 right-6 text-brand-text-secondary hover:text-brand-primary transition-colors"><CloseIcon /></button>
          <h2 className="text-3xl font-bold mb-2 font-display text-brand-text-primary">Add Brand</h2>
          <p className="text-xs text-brand-text-secondary mb-8 uppercase tracking-widest font-bold">Capacity: {existingStores.length.toLocaleString()} / {LIMITS.MAX_STORES_PER_COLLECTION.toLocaleString()}</p>
          
          <div className="space-y-6">
            <div>
                <label className="block text-xs font-bold uppercase tracking-[0.2em] text-brand-text-secondary mb-2">Identity</label>
                <div className="space-y-3">
                  <input 
                    maxLength={LIMITS.MAX_NAME_LENGTH} 
                    type="text" 
                    value={storeName} 
                    onChange={e => setStoreName(e.target.value)} 
                    placeholder="Brand Name"
                    className="w-full bg-brand-bg border border-brand-border rounded-xl p-3 focus:ring-2 focus:ring-brand-secondary/50 outline-none text-brand-text-primary" 
                  />
                  <input 
                    type="text" 
                    value={website} 
                    onChange={e => setWebsite(e.target.value)} 
                    placeholder="Website URL"
                    className="w-full bg-brand-bg border border-brand-border rounded-xl p-3 focus:ring-2 focus:ring-brand-secondary/50 outline-none text-brand-text-primary" 
                  />
                </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-[0.2em] text-brand-text-secondary mb-3">Price Tier</label>
              <div className="flex flex-wrap gap-2">
                {PRICE_RANGES.map(range => (
                  <button
                    key={range}
                    type="button"
                    onClick={() => setPriceRange(range === priceRange ? '' : range)}
                    className={`px-4 py-2 rounded-full border text-xs font-bold transition-all ${
                      priceRange === range 
                      ? 'bg-brand-primary border-brand-primary text-white shadow-md' 
                      : 'bg-brand-bg border-brand-border text-brand-text-secondary hover:border-brand-secondary'
                    }`}
                  >
                    {range}
                  </button>
                ))}
              </div>
            </div>

            <div>
               <label className="block text-xs font-bold uppercase tracking-[0.2em] text-brand-text-secondary mb-2">Categorization</label>
               <div className="flex flex-wrap gap-2 p-3 bg-brand-bg border border-brand-border rounded-xl min-h-[50px]">
                  {tags.map(tag => <TagPill key={tag} label={tag} onRemove={() => setTags(tags.filter(t => t !== tag))} />)}
                  <input 
                    disabled={tags.length >= LIMITS.MAX_TAGS_PER_STORE} 
                    type="text" 
                    value={tagInput} 
                    onChange={(e) => setTagInput(e.target.value)} 
                    onKeyDown={handleTagInputKeydown} 
                    placeholder={tags.length === 0 ? "Add tags..." : ""}
                    className="bg-transparent text-brand-text-primary focus:outline-none flex-grow text-sm placeholder:text-brand-text-secondary/40" 
                  />
               </div>
            </div>
          </div>

          {error && <p className="mt-6 text-xs text-red-500 font-bold text-center bg-red-50 p-3 rounded-xl border border-red-100">{error}</p>}

          <div className="mt-8 flex gap-3">
              <button onClick={onClose} className="flex-1 py-4 text-brand-text-secondary font-bold uppercase tracking-widest text-xs hover:bg-brand-bg rounded-xl transition-all">Cancel</button>
              <button 
                onClick={handleAdd} 
                disabled={isAtCapacity || !storeName.trim()} 
                className="flex-1 py-4 bg-brand-primary text-white font-bold uppercase tracking-widest text-xs rounded-xl hover:opacity-90 disabled:opacity-30 transition-all shadow-lg active:scale-95"
              >
                Confirm Addition
              </button>
          </div>
        </div>
      </div>

      {conflict && (
        <DuplicateResolutionModal 
          incoming={conflict.incoming}
          existing={conflict.existing}
          onResolve={handleResolve}
          onCancel={() => setConflict(null)}
        />
      )}
    </>
  );
};

export default AddStoreModal;
