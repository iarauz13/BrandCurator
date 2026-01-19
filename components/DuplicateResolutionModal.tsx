
import React from 'react';
import { Store } from '../types';
import { CloseIcon } from './icons/CloseIcon';

export type ResolutionAction = 'merge' | 'overwrite' | 'skip';

interface DuplicateResolutionModalProps {
  incoming: Partial<Store>;
  existing: Store;
  onResolve: (action: ResolutionAction) => void;
  onCancel: () => void;
}

const DuplicateResolutionModal: React.FC<DuplicateResolutionModalProps> = ({ incoming, existing, onResolve, onCancel }) => {
  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-md z-[300] flex justify-center items-center p-4">
      <div className="bg-brand-surface rounded-3xl shadow-2xl w-full max-w-lg p-8 animate-in zoom-in-95 duration-300 border border-brand-border">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-3xl font-display font-bold text-brand-text-primary">Collision Detected</h2>
          <button onClick={onCancel} className="p-2 hover:bg-brand-bg rounded-full transition-colors">
            <CloseIcon className="size-5" />
          </button>
        </div>
        
        <p className="text-brand-text-secondary mb-8 text-sm leading-relaxed">
          The brand <strong className="text-brand-primary">"{existing.store_name}"</strong> already exists in your registry. How would you like to handle this conflict?
        </p>

        <div className="space-y-4 mb-10">
          <button 
            onClick={() => onResolve('merge')}
            className="w-full text-left p-4 bg-brand-bg border border-brand-border rounded-xl hover:border-brand-primary transition-all group"
          >
            <h4 className="font-bold text-brand-primary text-sm group-hover:text-brand-secondary">Merge Identities</h4>
            <p className="text-xs text-brand-text-secondary">Combine new tags and notes with the existing entry. Preserves your history.</p>
          </button>
          
          <button 
            onClick={() => onResolve('overwrite')}
            className="w-full text-left p-4 bg-brand-bg border border-brand-border rounded-xl hover:border-brand-primary transition-all group"
          >
            <h4 className="font-bold text-brand-primary text-sm group-hover:text-brand-secondary">Overwrite Existing</h4>
            <p className="text-xs text-brand-text-secondary">Replace all current data with the incoming record. Use for bulk updates.</p>
          </button>

          <button 
            onClick={() => onResolve('skip')}
            className="w-full text-left p-4 bg-brand-bg border border-brand-border rounded-xl hover:border-brand-primary transition-all group"
          >
            <h4 className="font-bold text-brand-primary text-sm group-hover:text-brand-secondary">Skip Incoming</h4>
            <p className="text-xs text-brand-text-secondary">Keep your current record exactly as it is and ignore the duplicate.</p>
          </button>
        </div>

        <div className="flex gap-4">
          <button 
            onClick={onCancel} 
            className="flex-1 py-4 text-brand-text-secondary font-bold uppercase tracking-widest text-xs hover:bg-brand-bg rounded-xl transition-all"
          >
            Abort Import
          </button>
        </div>
      </div>
    </div>
  );
};

export default DuplicateResolutionModal;
