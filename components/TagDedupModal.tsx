
import React, { useState } from 'react';
import { CloseIcon } from './icons/CloseIcon';

export interface TagMergeGroup {
  primary: string;
  variants: string[];
}

interface TagDedupModalProps {
  groups: TagMergeGroup[];
  onConfirm: (mappings: Record<string, string>) => void;
  onCancel: () => void;
}

const TagDedupModal: React.FC<TagDedupModalProps> = ({ groups, onConfirm, onCancel }) => {
  const [selections, setSelections] = useState<Record<number, string>>(
    groups.reduce((acc, group, idx) => ({ ...acc, [idx]: group.primary }), {})
  );

  const handleConfirm = () => {
    const mappings: Record<string, string> = {};
    groups.forEach((group, idx) => {
      const canonical = selections[idx];
      [group.primary, ...group.variants].forEach(variant => {
        mappings[variant] = canonical;
      });
    });
    onConfirm(mappings);
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-md z-[200] flex justify-center items-center p-4">
      <div className="bg-brand-surface rounded-3xl shadow-2xl w-full max-w-xl p-8 animate-in zoom-in-95 duration-300">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-3xl font-display font-bold text-brand-text-primary">Cleanse Categories</h2>
          <button onClick={onCancel} className="p-2 hover:bg-brand-bg rounded-full transition-colors">
            <CloseIcon className="size-5" />
          </button>
        </div>
        
        <p className="text-brand-text-secondary mb-8 text-sm leading-relaxed">
          We found several near-duplicate categories in your import. 
          Standardize them to keep your registry clean and searchable.
        </p>

        <div className="space-y-6 max-h-[50vh] overflow-y-auto pr-2 custom-scrollbar">
          {groups.map((group, idx) => {
            const allOptions = [group.primary, ...group.variants];
            return (
              <div key={idx} className="bg-brand-bg/50 p-5 rounded-2xl border border-brand-border">
                <p className="text-[10px] font-bold uppercase tracking-widest text-brand-text-secondary mb-4">
                  Group {idx + 1}: Near-duplicates detected
                </p>
                <div className="flex flex-wrap gap-2">
                  {allOptions.map(option => (
                    <button
                      key={option}
                      onClick={() => setSelections({ ...selections, [idx]: option })}
                      className={`px-4 py-2 rounded-full text-xs font-semibold transition-all border ${
                        selections[idx] === option
                          ? 'bg-brand-primary border-brand-primary text-white shadow-md'
                          : 'bg-white border-brand-border text-brand-text-secondary hover:border-brand-primary'
                      }`}
                    >
                      {option}
                    </button>
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-10 flex gap-4 pt-6 border-t border-brand-border">
          <button 
            onClick={onCancel} 
            className="flex-1 py-4 text-brand-text-secondary font-bold uppercase tracking-widest text-xs hover:bg-brand-bg rounded-xl transition-all"
          >
            Skip Cleaning
          </button>
          <button 
            onClick={handleConfirm}
            className="flex-1 py-4 bg-brand-primary text-white font-bold uppercase tracking-widest text-xs rounded-xl hover:opacity-95 shadow-xl active:scale-95 transition-all"
          >
            Apply Standardized Labels
          </button>
        </div>
      </div>
    </div>
  );
};

export default TagDedupModal;
