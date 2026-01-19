
import React, { useState, useEffect, KeyboardEvent } from 'react';
import { Store, User, ThemeConfig } from '../types';
import { CollectionTemplate } from '../collectionTemplates';
import { CloseIcon } from './icons/CloseIcon';
import { StarIcon } from './icons/StarIcon';
import TagPill from './TagPill';
import { formatDescription } from '../utils/textFormatter';
import ConfirmationModal from './ConfirmationModal';
import { t } from '../utils/localization';
import { findSimilarAestheticBrands } from '../services/geminiService';

interface EditModalProps {
  store: Store;
  user: User;
  onSave: (store: Store) => void;
  onClose: () => void;
  onDelete: (storeId: string) => void;
  onSelectStore?: (store: Store) => void;
  collectionTemplate: CollectionTemplate;
  theme: ThemeConfig;
  allCollectionStores: Store[];
}

const priceRanges: Store['priceRange'][] = ['<$100', '$100-500', '$500-1000', '>$1000'];
const sustainabilityOptions: Store['sustainability'][] = ['Yes', 'No', 'Unknown'];

const getInstagramHandle = (value: string): string => {
    if (!value) return '';
    try {
        if (value.includes('instagram.com')) {
            const url = new URL(value.startsWith('http') ? value : `https://${value}`);
            const pathParts = url.pathname.split('/').filter(p => p);
            return pathParts[0] || value;
        }
        return value.replace('@', '');
    } catch (e) {
        return value.replace('@', '');
    }
};

const RecommendationSkeleton: React.FC = () => (
  <div className="p-4 bg-brand-bg rounded-xl border border-brand-border h-32 flex flex-col justify-between">
    <div>
      <div className="h-6 w-3/4 shimmer-bg rounded mb-2" />
      <div className="h-3 w-1/2 shimmer-bg rounded" />
    </div>
    <div className="space-y-2">
      <div className="h-2 w-full shimmer-bg rounded" />
      <div className="h-2 w-5/6 shimmer-bg rounded" />
    </div>
  </div>
);

const EditModal: React.FC<EditModalProps> = ({ store, user, onSave, onClose, onDelete, onSelectStore, collectionTemplate, theme, allCollectionStores }) => {
  const [formData, setFormData] = useState<Store>({ ...store });
  const [instagramUrlInput, setInstagramUrlInput] = useState(store.instagram_name ? `https://instagram.com/${store.instagram_name}` : '');
  const [tagInput, setTagInput] = useState('');
  const [isRevertConfirmOpen, setIsRevertConfirmOpen] = useState(false);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [recommendations, setRecommendations] = useState<Store[]>([]);
  const [isLoadingRecs, setIsLoadingRecs] = useState(false);
  const [isNavigating, setIsNavigating] = useState(false);
  
  const WORD_LIMIT = 100;
  const descriptionWordCount = formData.description.split(/\s+/).filter(Boolean).length;
  const privateNote = formData.privateNotes.find(n => n.userId === user.userId)?.note || '';

  // Trigger cross-fade when store changes
  useEffect(() => {
    setIsNavigating(true);
    const timer = setTimeout(() => {
      setFormData({ ...store });
      setInstagramUrlInput(store.instagram_name ? `https://instagram.com/${store.instagram_name}` : '');
      setIsNavigating(false);
    }, 150);
    return () => clearTimeout(timer);
  }, [store.id]);

  useEffect(() => {
    const handleKeyDown = (event: globalThis.KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  useEffect(() => {
    const fetchRecs = async () => {
      if (!store.description) {
        setRecommendations([]);
        return;
      }
      setIsLoadingRecs(true);
      const candidates = allCollectionStores.filter(s => s.id !== store.id && s.description);
      try {
        const recIds = await findSimilarAestheticBrands(store, candidates);
        const recStores = allCollectionStores.filter(s => recIds.includes(s.id));
        setRecommendations(recStores);
      } finally {
        setIsLoadingRecs(false);
      }
    };
    fetchRecs();
  }, [store.id, allCollectionStores]);

  const handleSave = () => {
    onSave({
      ...formData,
      description: formatDescription(formData.description),
      instagram_name: getInstagramHandle(instagramUrlInput),
    });
  };

  const handleRecommendationClick = (rec: Store) => {
    if (onSelectStore) {
        // Smoothly switch inside modal
        onSelectStore(rec);
        
        // Also scroll grid in background for spatial consistency
        const element = document.getElementById(`alpha-anchor-${rec.store_name.charAt(0).toUpperCase()}`);
        if (element) {
          window.scrollTo({
            top: element.getBoundingClientRect().top + window.scrollY - 200,
            behavior: "smooth"
          });
        }
    }
  };

  const handleDeleteClick = () => {
    setIsDeleteConfirmOpen(true);
  };
  
  const handleTagInput = (e: KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'Enter' || e.key === ',') {
          e.preventDefault();
          const value = (e.target as HTMLInputElement).value.trim();
          if (value && !formData.tags.includes(value)) {
              setFormData(prev => ({...prev, tags: [...prev.tags, value]}));
          }
          setTagInput('');
      }
  }
  
  const removeTag = (tagToRemove: string) => {
      setFormData(prev => ({...prev, tags: prev.tags.filter(t => t !== tagToRemove)}));
  }

  const handleCustomFieldChange = (fieldLabel: string, value: string) => {
    setFormData(prev => {
        const currentValues = prev.customFields[fieldLabel] || [];
        const newValues = currentValues.includes(value)
            ? currentValues.filter(v => v !== value)
            : [...currentValues, value];
        return {...prev, customFields: {...prev.customFields, [fieldLabel]: newValues}};
    });
  };

  const handlePrivateNoteChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newNote = e.target.value;
    setFormData(prev => {
        const otherNotes = prev.privateNotes.filter(n => n.userId !== user.userId);
        if (newNote) {
            return { ...prev, privateNotes: [...otherNotes, { userId: user.userId, note: newNote }] };
        } else {
            return { ...prev, privateNotes: otherNotes };
        }
    });
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex justify-center items-start z-50 p-4 overflow-y-auto" onClick={onClose}>
        <div className="bg-brand-surface rounded-xl shadow-xl w-full max-w-3xl m-4 relative transform transition-all" onClick={(e) => e.stopPropagation()}>
            <button onClick={onClose} className="absolute top-4 right-4 text-brand-text-secondary hover:text-brand-primary z-10"><CloseIcon /></button>
            
            <div className={`p-8 max-h-[90vh] overflow-y-auto custom-scrollbar transition-all duration-300 ${isNavigating ? 'opacity-0 translate-x-4' : 'opacity-100 translate-x-0'}`}>
                <h2 className="text-5xl font-light tracking-tight mb-6 text-brand-text-primary font-display">{formData.store_name}</h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                    {/* Column 1 */}
                    <div className="space-y-6">
                        <div>
                            <label className="block text-xs font-bold uppercase tracking-widest text-brand-text-secondary mb-2">Store Details</label>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-xs text-brand-text-secondary mb-1 ml-1">Store Name</label>
                                    <input type="text" value={formData.store_name} onChange={e => setFormData({...formData, store_name: e.target.value})} className="w-full bg-brand-bg text-brand-text-primary border border-brand-border rounded-lg p-2.5 focus:ring-2 focus:ring-brand-secondary/30 outline-none" />
                                </div>
                                <div>
                                    <label className="block text-xs text-brand-text-secondary mb-1 ml-1">Website URL</label>
                                    <input type="text" value={formData.website} onChange={e => setFormData({...formData, website: e.target.value})} className="w-full bg-brand-bg text-brand-text-primary border border-brand-border rounded-lg p-2.5 focus:ring-2 focus:ring-brand-secondary/30 outline-none" />
                                </div>
                                <div>
                                    <label className="block text-xs text-brand-text-secondary mb-1 ml-1">Instagram URL</label>
                                    <input type="text" value={instagramUrlInput} onChange={e => setInstagramUrlInput(e.target.value)} className="w-full bg-brand-bg text-brand-text-primary border border-brand-border rounded-lg p-2.5 focus:ring-2 focus:ring-brand-secondary/30 outline-none" />
                                </div>
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs text-brand-text-secondary mb-1 ml-1">Country</label>
                                <input 
                                    type="text" 
                                    value={t(formData.country)} 
                                    onChange={e => setFormData({...formData, country: e.target.value})} 
                                    className="w-full bg-brand-bg text-brand-text-primary border border-brand-border rounded-lg p-2.5 focus:ring-2 focus:ring-brand-secondary/30 outline-none" 
                                />
                            </div>
                            <div>
                                <label className="block text-xs text-brand-text-secondary mb-1 ml-1">City</label>
                                <input 
                                    type="text" 
                                    value={t(formData.city)} 
                                    onChange={e => setFormData({...formData, city: e.target.value})} 
                                    className="w-full bg-brand-bg text-brand-text-primary border border-brand-border rounded-lg p-2.5 focus:ring-2 focus:ring-brand-secondary/30 outline-none" 
                                />
                            </div>
                        </div>
                         <div>
                            <label className="flex justify-between text-xs text-brand-text-secondary mb-1 ml-1">
                                <span>Notes / Description</span>
                                <span className={descriptionWordCount > WORD_LIMIT ? 'text-red-500' : ''}>{descriptionWordCount}/{WORD_LIMIT} words</span>
                            </label>
                            <textarea value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} rows={5} className="w-full bg-brand-bg text-brand-text-primary border border-brand-border rounded-lg p-3 focus:ring-2 focus:ring-brand-secondary/30 outline-none resize-none" />
                        </div>
                    </div>

                    {/* Column 2 */}
                    <div className="space-y-6">
                         <div>
                            <label className="block text-xs font-bold uppercase tracking-widest text-brand-text-secondary mb-2">Categorization</label>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-xs text-brand-text-secondary mb-2 ml-1">Tags (press Enter to add)</label>
                                    <div className="flex flex-wrap gap-2 p-3 bg-brand-bg border border-brand-border rounded-lg min-h-[50px]">
                                        {formData.tags.map(tag => <TagPill key={tag} label={tag} onRemove={() => removeTag(tag)} />)}
                                        <input type="text" value={tagInput} onChange={e => setTagInput(e.target.value)} onKeyDown={handleTagInput} placeholder="Add a tag..." className="bg-transparent text-brand-text-primary focus:outline-none flex-grow text-sm" />
                                    </div>
                                </div>
                                
                                {collectionTemplate.fields.map(field => (
                                    <div key={field.label}>
                                        <label className="block text-xs text-brand-text-secondary mb-2 ml-1">{field.label}</label>
                                        <div className="flex flex-wrap gap-2">
                                            {field.options.map(option => (
                                                <button 
                                                    key={option}
                                                    onClick={() => handleCustomFieldChange(field.label, option)}
                                                    className={`px-3 py-1.5 text-xs rounded-full transition-all border ${formData.customFields[field.label]?.includes(option) ? 'bg-brand-primary border-brand-primary text-white shadow-sm' : 'bg-brand-bg hover:border-brand-secondary text-brand-text-primary border-brand-border'}`}
                                                >
                                                    {t(option)}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>
                         </div>
                    </div>
                </div>

                <div className="mt-12 pt-8 border-t border-brand-border">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="text-[10px] font-extrabold uppercase tracking-widest text-brand-text-secondary">Aesthetic DNA Recommendations</h4>
                    {isLoadingRecs && <div className="size-4 border-2 border-brand-secondary border-t-transparent rounded-full animate-spin" />}
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    {isLoadingRecs ? (
                      <>
                        <RecommendationSkeleton />
                        <RecommendationSkeleton />
                        <RecommendationSkeleton />
                      </>
                    ) : recommendations.length > 0 ? recommendations.map((rec, index) => (
                      <div 
                        key={rec.id} 
                        onClick={() => handleRecommendationClick(rec)}
                        style={{ animationDelay: `${index * 100}ms` }}
                        className="p-4 bg-brand-bg rounded-xl border border-brand-border hover:border-brand-secondary transition-all cursor-pointer group flex flex-col justify-between h-32 animate-in fade-in slide-in-from-bottom-2 fill-mode-both duration-500"
                      >
                        <div className="min-w-0">
                          <p className="font-display font-bold text-lg text-brand-text-primary group-hover:text-brand-primary truncate">{rec.store_name}</p>
                          <div className="flex flex-wrap gap-x-3 items-center opacity-60">
                             <p className="text-[9px] uppercase tracking-[0.2em] font-bold font-sans truncate whitespace-nowrap overflow-hidden text-ellipsis">{t(rec.city)}</p>
                             <div className="size-1 rounded-full bg-brand-text-secondary shrink-0" />
                             <p className="text-[9px] uppercase tracking-[0.2em] font-bold font-sans truncate whitespace-nowrap overflow-hidden text-ellipsis">{t(rec.country)}</p>
                          </div>
                        </div>
                        <p className="text-xs text-brand-text-secondary line-clamp-2 mt-2 font-light italic leading-relaxed">"{rec.description}"</p>
                      </div>
                    )) : (
                      <p className="col-span-full text-xs text-brand-text-secondary italic opacity-50">Providing an editorial summary enables DNA discovery.</p>
                    )}
                  </div>
                </div>

                 <hr className="my-8 border-brand-border"/>
                 
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6 pb-8">
                    <div className="space-y-6">
                         <div>
                            <label className="block text-xs font-bold uppercase tracking-widest text-brand-text-secondary mb-4">Rating & Pricing</label>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-xs text-brand-text-secondary mb-2 ml-1">Overall Rating</label>
                                    <div className="flex items-center gap-1">
                                    {[...Array(5)].map((_, i) => (
                                        <button key={i} onClick={() => setFormData({...formData, rating: i + 1})} className="transition-transform hover:scale-110">
                                        <StarIcon className="w-7 h-7" filled={i < formData.rating} />
                                        </button>
                                    ))}
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-xs text-brand-text-secondary mb-2 ml-1">Price Range</label>
                                    <div className="flex flex-wrap gap-2">
                                        {priceRanges.map(price => (
                                            <button key={price} onClick={() => setFormData({...formData, priceRange: price})} className={`px-3 py-1.5 text-xs rounded-md transition-all border ${formData.priceRange === price ? 'bg-brand-primary border-brand-primary text-white shadow-sm' : 'bg-brand-bg hover:border-brand-secondary text-brand-text-primary border-brand-border'}`}>{price}</button>
                                        ))}
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-xs text-brand-text-secondary mb-2 ml-1">Sustainability</label>
                                    <div className="flex flex-wrap gap-2">
                                        {sustainabilityOptions.map(option => (
                                            <button key={option} onClick={() => setFormData({...formData, sustainability: option})} className={`px-3 py-1.5 text-xs rounded-md transition-all border ${formData.sustainability === option ? 'bg-brand-primary border-brand-primary text-white shadow-sm' : 'bg-brand-bg hover:border-brand-secondary text-brand-text-primary border-brand-border'}`}>{option}</button>
                                        ))}
                                    </div>
                                </div>
                                <div className="pt-2">
                                    <label className="flex items-center space-x-3 cursor-pointer group">
                                        <input 
                                            type="checkbox" 
                                            checked={formData.onSale || false} 
                                            onChange={(e) => setFormData({ ...formData, onSale: e.target.checked })} 
                                            className="h-5 w-5 rounded-md bg-brand-bg text-brand-secondary focus:ring-brand-secondary border-brand-border accent-brand-secondary cursor-pointer" 
                                        />
                                        <span className="text-sm font-medium text-brand-text-primary group-hover:text-brand-secondary transition-colors">Has Active Sale</span>
                                    </label>
                                </div>
                            </div>
                         </div>
                    </div>
                    <div>
                         <label className="block text-xs font-bold uppercase tracking-widest text-brand-text-secondary mb-4">Personal Archive</label>
                         <div className="space-y-2">
                            <label className="block text-xs text-brand-text-secondary ml-1">Private Note (Only you see this)</label>
                            <textarea value={privateNote} onChange={handlePrivateNoteChange} rows={8} className="w-full bg-brand-bg text-brand-text-primary border border-brand-border rounded-lg p-3 focus:ring-2 focus:ring-brand-secondary/30 outline-none resize-none" placeholder="Draft your personal thoughts here..." />
                         </div>
                    </div>
                 </div>
            </div>

            <div className="p-6 bg-brand-bg border-t border-brand-border rounded-b-xl flex justify-between items-center">
                <button onClick={handleDeleteClick} className="text-sm font-bold text-red-600 hover:text-red-700 transition-colors px-2">Delete Brand</button>
                <div className="flex gap-3">
                    <button onClick={() => setIsRevertConfirmOpen(true)} className="px-5 py-2.5 bg-white border border-brand-border text-brand-text-primary font-bold rounded-lg hover:bg-gray-50 transition-all text-sm">Discard</button>
                    <button onClick={handleSave} className="px-8 py-2.5 bg-brand-primary text-white font-bold rounded-lg hover:opacity-90 transition-all text-sm shadow-sm">Save Brand</button>
                </div>
            </div>
            
            <ConfirmationModal 
                isOpen={isRevertConfirmOpen}
                onClose={() => setIsRevertConfirmOpen(false)}
                onConfirm={() => { setFormData({ ...store }); setIsRevertConfirmOpen(false); }}
                title="Discard Changes?"
                message="Are you sure you want to discard all your recent edits for this brand?"
            />

            <ConfirmationModal 
                isOpen={isDeleteConfirmOpen}
                onClose={() => setIsDeleteConfirmOpen(false)}
                onConfirm={() => onDelete(store.id)}
                title="Delete Permanently?"
                message={`Are you sure you want to remove "${store.store_name}" from your collection? This action is irreversible.`}
                confirmVariant="danger"
                confirmButtonText="Yes, Delete Permanently"
            />
        </div>
    </div>
  );
};

export default EditModal;