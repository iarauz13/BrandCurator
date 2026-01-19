
import React, { useState, useCallback, useEffect, useRef } from 'react';
import { Store, Collection } from '../types';
import { CloseIcon } from './icons/CloseIcon';
import { UploadIcon } from './icons/UploadIcon';
import { LIMITS } from '../utils/validation';
import { areStringsSimilar } from '../utils/normalization';
import { COLUMN_ALIASES } from '../utils/csvParser';
import { normalizeStoreName } from '../utils/textFormatter';
import TagDedupModal, { TagMergeGroup } from './TagDedupModal';
import DuplicateResolutionModal, { ResolutionAction } from './DuplicateResolutionModal';

interface ImportModalProps {
  isOpen: boolean;
  mode: 'import' | 'append';
  onClose: () => void;
  onComplete: (parsedStores: Omit<Store, 'collectionId' | 'addedBy' | 'favoritedBy' | 'privateNotes'>[], collectionId: string) => void;
  collections: Collection[];
  activeCollectionId: string | null;
}

const TemplateGuide = () => (
  <div className="bg-brand-bg/50 border border-brand-border rounded-2xl p-6 mb-6">
    <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-brand-primary mb-4">
      Visual Template Guide
    </h3>
    <div className="grid grid-cols-2 gap-x-6 gap-y-4">
      {Object.entries(COLUMN_ALIASES).map(([key, aliases]) => (
        <div key={key} className="space-y-1">
          <p className="text-xs font-bold text-brand-text-primary capitalize">
            {key.replace('_', ' ')}
          </p>
          <p className="text-[10px] text-brand-text-secondary italic leading-tight">
            Accepted: {aliases.slice(0, 3).join(', ')}...
          </p>
        </div>
      ))}
    </div>
  </div>
);

const ImportModal: React.FC<ImportModalProps> = ({ isOpen, mode, onClose, onComplete, collections, activeCollectionId }) => {
  const [selectedCollectionId, setSelectedCollectionId] = useState(activeCollectionId || '');
  const [file, setFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  
  // Dedup State
  const [dedupGroups, setDedupGroups] = useState<TagMergeGroup[]>([]);
  const [pendingStores, setPendingStores] = useState<Omit<Store, 'collectionId' | 'addedBy' | 'favoritedBy' | 'privateNotes'>[] | null>(null);
  const [conflicts, setConflicts] = useState<{ incoming: any, existing: Store }[]>([]);

  useEffect(() => {
    if (isOpen) {
      setSelectedCollectionId(activeCollectionId || (collections.length > 0 ? collections[0].id : ''));
      setFile(null);
      setError('');
      setIsProcessing(false);
      setProgress(0);
      setDedupGroups([]);
      setPendingStores(null);
      setConflicts([]);
    }
  }, [isOpen, activeCollectionId, collections]);

  const findSimilarTagGroups = (stores: any[]): TagMergeGroup[] => {
    const allTags = Array.from(new Set(stores.flatMap(s => s.tags)));
    const groups: TagMergeGroup[] = [];
    const processed = new Set<string>();

    for (let i = 0; i < allTags.length; i++) {
      const tag = allTags[i];
      if (processed.has(tag)) continue;

      const variants: string[] = [];
      for (let j = i + 1; j < allTags.length; j++) {
        const other = allTags[j];
        if (!processed.has(other) && areStringsSimilar(tag, other, 0.85)) {
          variants.push(other);
          processed.add(other);
        }
      }

      if (variants.length > 0) {
        groups.push({ primary: tag, variants });
        processed.add(tag);
      }
    }
    return groups;
  };

  const handleImport = useCallback(() => {
    if (!file || !selectedCollectionId) {
      setError("Please select a collection and a file.");
      return;
    }

    const targetCollection = collections.find(c => c.id === selectedCollectionId);
    if (!targetCollection) {
      setError("Selected collection not found.");
      return;
    }

    setError('');
    setIsProcessing(true);
    setProgress(10);

    const reader = new FileReader();
    reader.onload = async (e) => {
      const text = e.target?.result as string;
      const { parseCSV } = await import('../utils/csvParser');
      
      try {
        const result = parseCSV(text, JSON.parse(JSON.stringify(targetCollection.template)));
        setProgress(50);
        
        // Find collisions with existing stores in the collection
        const existingStores = targetCollection.stores;
        const newConflicts: { incoming: any, existing: Store }[] = [];
        const nonConflicting: any[] = [];

        result.stores.forEach(incoming => {
          const key = normalizeStoreName(incoming.store_name);
          const match = existingStores.find(s => normalizeStoreName(s.store_name) === key);
          if (match) {
            newConflicts.push({ incoming, existing: match });
          } else {
            nonConflicting.push(incoming);
          }
        });

        if (newConflicts.length > 0) {
          setConflicts(newConflicts);
          setPendingStores(nonConflicting);
          setIsProcessing(false);
        } else {
          const groups = findSimilarTagGroups(result.stores);
          if (groups.length > 0) {
            setPendingStores(result.stores);
            setDedupGroups(groups);
            setIsProcessing(false);
          } else {
            setProgress(100);
            onComplete(result.stores, selectedCollectionId);
          }
        }
      } catch (err: any) {
        setError(err.message || "Failed to parse CSV.");
        setIsProcessing(false);
      }
    };
    reader.readAsText(file);
  }, [file, selectedCollectionId, collections, onComplete]);

  const handleDedupConfirm = (mappings: Record<string, string>) => {
    if (!pendingStores) return;

    const cleanedStores = pendingStores.map(store => ({
      ...store,
      tags: Array.from(new Set(store.tags.map(tag => mappings[tag] || tag)))
    }));

    onComplete(cleanedStores, selectedCollectionId);
  };

  const handleResolveCollision = (action: ResolutionAction) => {
    if (conflicts.length === 0) return;

    const current = conflicts[0];
    const updatedConflicts = conflicts.slice(1);
    
    // Process the resolved store
    let resolvedStore: any = null;
    if (action === 'merge') {
      resolvedStore = {
        ...current.existing,
        tags: Array.from(new Set([...current.existing.tags, ...current.incoming.tags])),
        website: current.incoming.website || current.existing.website,
        instagram_name: current.incoming.instagram_name || current.existing.instagram_name,
        priceRange: current.incoming.priceRange || current.existing.priceRange
      };
    } else if (action === 'overwrite') {
      resolvedStore = {
        ...current.existing,
        ...current.incoming
      };
    }

    if (resolvedStore) {
      setPendingStores(prev => [...(prev || []), resolvedStore]);
    }

    setConflicts(updatedConflicts);

    // If that was the last conflict, finish the flow
    if (updatedConflicts.length === 0) {
      const finalStores = pendingStores || [];
      const groups = findSimilarTagGroups(finalStores);
      if (groups.length > 0) {
        setDedupGroups(groups);
      } else {
        onComplete(finalStores, selectedCollectionId);
      }
    }
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (selectedFile) {
      if (selectedFile.type !== 'text/csv' && !selectedFile.name.endsWith('.csv')) {
        setError('Invalid file type. Please upload a CSV file.');
        return;
      }
      setFile(selectedFile);
      setError('');
    }
  };

  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex justify-center items-center z-[150] transition-all" onClick={!isProcessing ? onClose : undefined}>
        <div className="bg-brand-surface rounded-3xl shadow-2xl w-full max-w-3xl m-4 p-8 relative overflow-hidden" onClick={(e) => e.stopPropagation()}>
          {!isProcessing && (
            <button onClick={onClose} className="absolute top-6 right-6 text-brand-text-secondary hover:text-brand-primary z-10 p-2 hover:bg-brand-bg rounded-full transition-all">
              <CloseIcon className="size-5" />
            </button>
          )}

          {isProcessing ? (
            <div className="py-12 flex flex-col items-center justify-center text-center">
              <div className="relative size-24 mb-8">
                <svg className="size-full -rotate-90" viewBox="0 0 36 36">
                  <path className="stroke-brand-border" strokeWidth="2" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                  <path className="stroke-brand-primary transition-all duration-500 ease-out" strokeDasharray={`${progress}, 100`} strokeLinecap="round" strokeWidth="2" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center font-display font-bold text-xl text-brand-primary">{progress}%</div>
              </div>
              <h2 className="text-2xl font-display font-bold mb-2">Analyzing Archive...</h2>
              <p className="text-brand-text-secondary max-w-xs text-sm">Validating records and identifying categories.</p>
            </div>
          ) : (
            <>
              <h2 className="text-4xl font-bold mb-2 text-brand-text-primary font-display">{mode === 'import' ? 'Import Registry' : 'Append Data'}</h2>
              <p className="text-brand-text-secondary mb-8 text-sm">Standardize your offline archives into your cloud database.</p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-6">
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-[0.2em] text-brand-text-secondary mb-3">Target Collection</label>
                    <select value={selectedCollectionId} onChange={e => setSelectedCollectionId(e.target.value)} className="w-full bg-brand-bg text-brand-text-primary border border-brand-border rounded-xl p-3 focus:ring-2 focus:ring-brand-primary/20 focus:outline-none font-medium">
                      {collections.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-[0.2em] text-brand-text-secondary mb-3">Upload File</label>
                    <div 
                      onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }} 
                      onDragLeave={() => setIsDragging(false)} 
                      onDrop={(e) => { e.preventDefault(); setIsDragging(false); const f = e.dataTransfer.files[0]; if(f) { setFile(f); setError(''); } }} 
                      className={`border-2 border-dashed rounded-2xl p-10 text-center transition-all ${isDragging ? 'border-brand-primary bg-brand-primary/5 scale-[1.02]' : 'border-brand-border'}`}
                    >
                      <div className="flex flex-col items-center justify-center">
                        <UploadIcon />
                        <p className="text-brand-text-primary font-bold text-sm mt-4 truncate w-full">{file ? file.name : 'Drop Archive CSV here'}</p>
                        <label className="mt-6 inline-block cursor-pointer px-6 py-2 bg-brand-primary text-white rounded-full text-xs font-bold">
                          Browse Files
                          <input type="file" accept=".csv" onChange={handleFileChange} className="hidden" />
                        </label>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col h-full">
                  <TemplateGuide />
                  <div className="bg-brand-bg/40 p-5 rounded-2xl border border-brand-border/60 flex-grow">
                    <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-brand-text-secondary mb-3">Data Integrity</h3>
                    <div className="space-y-2 text-xs text-brand-text-secondary leading-relaxed">
                      <p>• Descriptions formatted for editorial clarity.</p>
                      <p>• Website & Instagram handles normalized automatically.</p>
                    </div>
                  </div>
                </div>
              </div>

              {error && <p className="mt-6 text-xs text-red-500 font-bold text-center bg-red-50 p-3 rounded-xl border border-red-100">{error}</p>}

              <div className="mt-10 flex justify-end gap-4 pt-6 border-t border-brand-border">
                <button onClick={onClose} className="px-8 py-3 text-brand-text-secondary font-bold uppercase tracking-widest text-xs hover:bg-brand-bg rounded-full transition-all">Cancel</button>
                <button onClick={handleImport} disabled={!file || !selectedCollectionId} className="px-10 py-3 bg-brand-primary text-white font-bold uppercase tracking-widest text-xs rounded-full hover:opacity-95 transition-all disabled:opacity-30 shadow-xl active:scale-95">Confirm Archive</button>
              </div>
            </>
          )}
        </div>
      </div>

      {conflicts.length > 0 && (
        <DuplicateResolutionModal 
          incoming={conflicts[0].incoming}
          existing={conflicts[0].existing}
          onResolve={handleResolveCollision}
          onCancel={() => { setConflicts([]); setPendingStores([]); onClose(); }}
        />
      )}

      {dedupGroups.length > 0 && conflicts.length === 0 && (
        <TagDedupModal 
          groups={dedupGroups} 
          onConfirm={handleDedupConfirm} 
          onCancel={() => pendingStores && onComplete(pendingStores, selectedCollectionId)} 
        />
      )}
    </>
  );
};

export default ImportModal;
