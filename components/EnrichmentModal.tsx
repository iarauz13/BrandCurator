
import React, { useState, useEffect } from 'react';
import { Store, ThemeConfig } from '../types';
import { CloseIcon } from './icons/CloseIcon';
import { SparklesIcon } from './icons/SparklesIcon';
import { enrichStoreData } from '../services/geminiService';
import { formatDescription } from '../utils/textFormatter';

interface EnrichmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedStores: Store[];
  onComplete: (updatedStores: Store[]) => void;
  theme: ThemeConfig;
}

interface SkipReason {
  name: string;
  reason: string;
}

const EnrichmentModal: React.FC<EnrichmentModalProps> = ({
  isOpen,
  onClose,
  selectedStores,
  onComplete,
  theme
}) => {
  const [phase, setPhase] = useState<'confirm' | 'research' | 'results'>('confirm');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [skipped, setSkipped] = useState<SkipReason[]>([]);
  const [results, setResults] = useState<Store[]>([]);
  const [isKeyRequired, setIsKeyRequired] = useState(false);

  useEffect(() => {
    const checkKey = async () => {
      const hasKey = await (window as any).aistudio.hasSelectedApiKey();
      setIsKeyRequired(!hasKey);
    };
    if (isOpen) checkKey();
  }, [isOpen]);

  const handleStartEnrichment = async () => {
    if (isKeyRequired) {
      await (window as any).aistudio.openSelectKey();
      setIsKeyRequired(false);
      return;
    }

    setPhase('research');
    const updatedStores: Store[] = [];
    
    // We only want to research stores that actually have missing data to save on API usage
    const targets = selectedStores.filter(s => {
      const websiteEmpty = !s.website || /^(none|n\/a|na|false)$/i.test(s.website.trim());
      const descEmpty = !s.description || s.description.length < 10 || /^(none|n\/a|na|false)$/i.test(s.description.trim());
      return websiteEmpty || descEmpty;
    });

    for (let i = 0; i < targets.length; i++) {
      const store = targets[i];
      setCurrentIndex(i);

      try {
        const enrichment = await enrichStoreData(store);
        
        // Rule: Non-destructive update. Only fill empty fields.
        const updatedStore = { ...store };
        const websiteEmpty = !store.website || /^(none|n\/a|na|false)$/i.test(store.website.trim());
        const descEmpty = !store.description || store.description.length < 10 || /^(none|n\/a|na|false)$/i.test(store.description.trim());

        if (enrichment.website && websiteEmpty) {
          updatedStore.website = enrichment.website;
        }
        if (enrichment.description && descEmpty) {
          updatedStore.description = formatDescription(enrichment.description);
        }

        updatedStores.push(updatedStore);
      } catch (err: any) {
        let reason = "Search results inconclusive";
        if (err.message?.includes('429')) reason = "429: Rate limit reached (retrying later)";
        else if (err.message?.includes('ambiguous') || err.message?.includes('grounding')) reason = "Search was inconclusive";
        else reason = err.message || "Technical error during lookup";
        
        setSkipped(prev => [...prev, { name: store.store_name, reason }]);
      }
    }

    setResults(updatedStores);
    setPhase('results');
  };

  if (!isOpen) return null;

  const currentStore = selectedStores[currentIndex] || selectedStores[0];

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-md z-[200] flex justify-center items-center p-4">
      <div className="bg-brand-surface rounded-3xl shadow-2xl w-full max-w-xl overflow-hidden border border-brand-border flex flex-col max-h-[80vh]">
        
        {/* Header */}
        <div className="p-8 border-b border-brand-border flex justify-between items-center bg-brand-bg/30">
          <div>
            <h2 className="text-3xl font-display font-bold text-brand-text-primary flex items-center gap-3">
              <SparklesIcon />
              Registry Researcher
            </h2>
            <p className="text-xs font-bold uppercase tracking-widest text-brand-text-secondary mt-1">
              AI Enrichment Engine
            </p>
          </div>
          {phase !== 'research' && (
            <button onClick={onClose} className="p-2 hover:bg-brand-bg rounded-full transition-all">
              <CloseIcon className="size-5" />
            </button>
          )}
        </div>

        <div className="p-8 flex-grow overflow-y-auto custom-scrollbar">
          {phase === 'confirm' && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2">
              <p className="text-base text-brand-text-secondary leading-relaxed">
                Our AI Curator is researching <strong className="text-brand-primary">{selectedStores.length} brands</strong>. This involves real-time web lookups and may take 2-3 minutes.
              </p>
              
              <div className="bg-brand-bg p-5 rounded-2xl border border-brand-border space-y-4">
                <h4 className="text-[10px] font-extrabold uppercase tracking-widest text-brand-primary">Process Disclosure</h4>
                <p className="text-xs text-brand-text-secondary leading-relaxed italic">
                  "I will act as a luxury brand archivist to find official websites and professional editorial summaries. I only populate empty fields."
                </p>
                <a href="https://ai.google.dev/gemini-api/docs/billing" target="_blank" className="inline-block text-[10px] font-bold text-brand-secondary underline underline-offset-4">
                  View billing & project requirements &rarr;
                </a>
              </div>

              <div className="pt-4">
                <button 
                  onClick={handleStartEnrichment}
                  className="w-full py-4 bg-brand-primary text-white font-bold uppercase tracking-widest text-xs rounded-xl shadow-xl hover:opacity-90 active:scale-95 transition-all"
                >
                  {isKeyRequired ? 'Select API Key to Begin' : 'Commence Research'}
                </button>
              </div>
            </div>
          )}

          {phase === 'research' && (
            <div className="flex flex-col items-center justify-center py-12 text-center animate-in zoom-in-95 duration-500">
              <div className="relative size-32 mb-8">
                <svg className="size-full -rotate-90" viewBox="0 0 36 36">
                  <path className="stroke-brand-border" strokeWidth="2" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                  <path 
                    className="stroke-brand-secondary transition-all duration-700 ease-out" 
                    strokeDasharray={`${((currentIndex + 1) / selectedStores.length) * 100}, 100`} 
                    strokeLinecap="round" 
                    strokeWidth="2" 
                    fill="none" 
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" 
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center font-display font-bold text-2xl text-brand-primary">
                  {Math.round(((currentIndex + 1) / selectedStores.length) * 100)}%
                </div>
              </div>
              <h3 className="text-xl font-display font-semibold mb-2">Researching Brand {currentIndex + 1} of {selectedStores.length}</h3>
              
              {/* Progress Ticker Requirement */}
              <div className="bg-brand-bg px-4 py-2 rounded-full border border-brand-border animate-pulse">
                <p className="text-brand-text-secondary text-[10px] uppercase tracking-widest font-bold">
                  Now Curating: <span className="text-brand-primary">"{currentStore.store_name}"</span>
                </p>
              </div>
              
              <p className="mt-8 text-[10px] text-brand-text-secondary/50 uppercase tracking-widest">Please do not close this window</p>
            </div>
          )}

          {phase === 'results' && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2">
              <div className="bg-green-50 p-6 rounded-2xl border border-green-100 text-center shadow-sm">
                 <div className="size-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3 text-green-600 shadow-inner">
                    <svg className="size-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                 </div>
                 <h3 className="text-lg font-bold text-green-800">Enrichment Complete</h3>
                 <p className="text-sm text-green-700">{results.length} records successfully updated.</p>
              </div>

              {/* Debug Report Requirement */}
              {skipped.length > 0 && (
                <div className="space-y-3">
                  <h4 className="text-[10px] font-extrabold uppercase tracking-widest text-brand-text-secondary">Skipped Items (Diagnostic Log)</h4>
                  <div className="space-y-2 bg-brand-bg rounded-2xl p-4 border border-brand-border max-h-48 overflow-y-auto custom-scrollbar shadow-inner">
                    {skipped.map((s, i) => (
                      <div key={i} className="flex flex-col sm:flex-row justify-between sm:items-center text-xs py-2 border-b border-brand-border/50 last:border-0 gap-1">
                        <span className="font-bold text-brand-text-primary">{s.name}</span>
                        <span className="text-red-500/80 font-medium italic">{s.reason}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="pt-4">
                <button 
                  onClick={() => onComplete(results)}
                  className="w-full py-4 bg-brand-primary text-white font-bold uppercase tracking-widest text-xs rounded-xl shadow-xl hover:opacity-90 active:scale-95 transition-all"
                >
                  Finalize Registry Updates
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default EnrichmentModal;
