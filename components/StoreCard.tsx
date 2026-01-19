
import React, { useState } from 'react';
import { Store, User, Collection } from '../types';
import { EditIcon } from './icons/EditIcon';
import { HeartIcon } from './icons/HeartIcon';
import { StarIcon } from './icons/StarIcon';
import { SparklesIcon } from './icons/SparklesIcon';
import { TrashIcon } from './icons/TrashIcon';
import { UndoIcon } from './icons/UndoIcon';
import { ArchiveIcon } from './icons/ArchiveIcon';
import { FolderIcon } from './icons/FolderIcon';
import TagPill from './TagPill';
import ConfirmationModal from './ConfirmationModal';
import MoveCollectionModal from './MoveCollectionModal';
import { t } from '../utils/localization';

export interface StoreCardProps {
  store: Store;
  user: User;
  collections?: Collection[];
  onEdit: (store: Store) => void;
  onArchive: () => void;
  onRestore?: () => void;
  onDeletePermanently?: () => void;
  onMove?: (targetCollectionId: string) => void;
  isArchivedView?: boolean;
  isSelected: boolean;
  onToggleSelection: () => void;
  isGeneratingImage: boolean;
  onGenerateImage: () => void;
  isScraping: boolean;
  onDragStart?: (id: string) => void;
  id?: string;
}

const StoreCard: React.FC<StoreCardProps> = ({ 
  store, 
  user, 
  collections = [],
  onEdit, 
  onArchive, 
  onRestore, 
  onDeletePermanently, 
  onMove,
  isArchivedView = false,
  isSelected, 
  onToggleSelection, 
  isGeneratingImage, 
  onGenerateImage, 
  isScraping,
  onDragStart,
  id 
}) => {
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [isMoveModalOpen, setIsMoveModalOpen] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  const cleanCity = t(store.city);
  const cleanCountry = t(store.country);
  const locationParts = [cleanCity, cleanCountry].filter(Boolean);
  const locationString = locationParts.join(', ');

  const formatUrl = (url: string) => {
    if (!url) return '';
    const trimmed = url.trim();
    if (!trimmed || trimmed.toLowerCase() === 'none' || trimmed.toLowerCase() === 'n/a') return '';
    if (/^https?:\/\//i.test(trimmed)) return trimmed;
    return `https://${trimmed}`;
  };

  const getInstagramLink = (val: string) => {
    if (!val) return null;
    const trimmed = val.trim();
    if (!trimmed || trimmed.toLowerCase() === 'none' || trimmed.toLowerCase() === 'n/a') return null;
    if (/^https?:\/\//i.test(trimmed)) return null;
    const handle = trimmed.replace(/^@/, '');
    return `https://instagram.com/${handle}`;
  };

  const websiteLink = formatUrl(store.website);
  const instagramLink = getInstagramLink(store.instagram_name);
  const isFavoritedByUser = store.favoritedBy.includes(user.userId);

  const cardHeaderStyle = store.imageUrl 
    ? { backgroundImage: `url(${store.imageUrl})` } 
    : { background: 'linear-gradient(135deg, #f3f4f6 0%, #e5e7eb 100%)' };

  const handleDragStart = (e: React.DragEvent) => {
    setIsDragging(true);
    e.dataTransfer.setData('storeId', store.id);
    onDragStart?.(store.id);
  };

  const handleDragEnd = () => {
    setIsDragging(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      onToggleSelection();
    }
  };

  return (
    <>
      <div 
        id={id}
        draggable
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
        onClick={onToggleSelection}
        onKeyDown={handleKeyDown}
        tabIndex={0}
        className={`bg-brand-surface rounded-xl flex flex-col transition-all duration-700 ease-in-out hover:shadow-subtle-hover transform overflow-hidden cursor-grab active:cursor-grabbing group h-full outline-none focus:ring-2 focus:ring-brand-secondary/50
          ${isDragging ? 'opacity-50 scale-105 shadow-2xl rotate-1' : (isSelected ? 'ring-2 ring-brand-secondary shadow-lg' : 'shadow-subtle')} 
          ${isArchivedView ? 'opacity-90 grayscale-[30%]' : 'hover:-translate-y-1'}`}
      >
        <div 
          className="h-48 bg-gray-100 bg-cover bg-center p-3 flex flex-col justify-between relative"
          style={cardHeaderStyle}
        >
           {store.imageUrl && <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-60"></div>}
           {isGeneratingImage && (
                <div className="absolute inset-0 bg-black/70 flex items-center justify-center z-20">
                    <div className="w-6 h-6 border-2 border-brand-secondary border-t-transparent rounded-full animate-spin"></div>
                </div>
            )}
           <div className="relative z-10 flex justify-between items-start">
               <div className={`h-5 w-5 rounded-md border-2 flex items-center justify-center transition-colors ${isSelected ? 'bg-brand-secondary border-brand-secondary' : 'bg-white/40 border-white/60 backdrop-blur-sm'}`}>
                  {isSelected && (
                      <svg className="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                  )}
               </div>
               <div className="flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-black/40 backdrop-blur-md p-1.5 rounded-lg shadow-sm">
                  {!isArchivedView ? (
                    <>
                      <button
                          onClick={(e) => { e.stopPropagation(); onGenerateImage(); }}
                          className="text-white hover:text-brand-secondary transition-colors p-1"
                          title="Generate AI Image"
                      >
                          <SparklesIcon />
                      </button>
                      <button
                          onClick={(e) => { e.stopPropagation(); setIsConfirmModalOpen(true); }}
                          className="text-white hover:text-brand-secondary transition-colors p-1"
                          title="Archive"
                      >
                          <ArchiveIcon />
                      </button>
                      <button
                          onClick={(e) => { e.stopPropagation(); onEdit(store); }}
                          className="text-white hover:text-brand-secondary transition-colors p-1"
                          title="Edit"
                      >
                          <EditIcon />
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                          onClick={(e) => { e.stopPropagation(); setIsMoveModalOpen(true); }}
                          className="text-white hover:text-brand-secondary transition-colors p-1"
                          title="Move to Collection"
                      >
                          <FolderIcon />
                      </button>
                      <button
                          onClick={(e) => { e.stopPropagation(); onRestore?.(); }}
                          className="text-white hover:text-green-400 transition-colors p-1"
                          title="Restore"
                      >
                          <UndoIcon />
                      </button>
                      <button
                          onClick={(e) => { e.stopPropagation(); setIsConfirmModalOpen(true); }}
                          className="text-white hover:text-red-400 transition-colors p-1"
                          title="Delete Permanently"
                      >
                          <TrashIcon />
                      </button>
                    </>
                  )}
               </div>
           </div>
           <div className="relative z-10 flex items-center gap-2">
                {isFavoritedByUser && <HeartIcon className="w-5 h-5 text-red-400" filled />}
                {store.onSale && (
                    <span className="text-[10px] font-bold bg-brand-secondary text-white px-2 py-0.5 rounded-md shadow-sm">SALE</span>
                )}
           </div>
        </div>
        
        <div className="p-4 flex flex-col flex-grow">
          <h3 className="font-display text-xl font-bold text-brand-text-primary leading-tight truncate">
              {store.store_name}
          </h3>
          
          {locationString && (
            <p className="text-[9px] uppercase tracking-[0.3em] font-bold opacity-70 font-sans mt-1">{locationString}</p>
          )}
          
          <p className="text-sm text-brand-text-secondary my-3 h-[60px] line-clamp-3 leading-relaxed">
            {store.description || 'No description provided.'}
          </p>

          <div className="mb-4">
              <div className="flex flex-wrap gap-2">
                  {store.tags.slice(0, 3).map(tag => <TagPill key={tag} label={tag} />)}
                  {store.tags.length > 3 && (
                      <span className="text-[10px] text-brand-text-secondary self-center font-medium">+{store.tags.length - 3}</span>
                  )}
              </div>
          </div>
        
          <div className="mt-auto pt-3 border-t border-brand-border flex items-center justify-between text-xs">
            <div className="flex gap-4 items-center">
              {websiteLink ? (
                <a 
                  href={websiteLink} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  onClick={e => e.stopPropagation()}
                  className="text-[9px] uppercase tracking-[0.3em] font-bold opacity-70 font-sans text-brand-primary hover:text-brand-secondary transition-colors underline decoration-brand-secondary/30 underline-offset-4"
                >
                  Web
                </a>
              ) : (
                <span className="text-[9px] uppercase tracking-[0.3em] font-bold font-sans text-gray-300 cursor-not-allowed opacity-50">Web</span>
              )}
              
              {instagramLink ? (
                <a 
                  href={instagramLink} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  onClick={e => e.stopPropagation()}
                  className="text-[9px] uppercase tracking-[0.3em] font-bold opacity-70 font-sans text-brand-primary hover:text-brand-secondary transition-colors underline decoration-brand-secondary/30 underline-offset-4"
                >
                  Insta
                </a>
              ) : (
                <span className="text-[9px] uppercase tracking-[0.3em] font-bold font-sans text-gray-300 cursor-not-allowed opacity-50">Insta</span>
              )}
            </div>
            <div className="flex items-center">
              {[...Array(5)].map((_, i) => (
                <StarIcon key={i} className="w-3 h-3" filled={i < store.rating} />
              ))}
            </div>
          </div>
        </div>
      </div>
      
      <ConfirmationModal
        isOpen={isConfirmModalOpen}
        onClose={() => setIsConfirmModalOpen(false)}
        onConfirm={() => { if (isArchivedView) onDeletePermanently?.(); else onArchive(); }}
        title={isArchivedView ? "Delete Permanently?" : "Archive Brand"}
        message={isArchivedView ? "This is irreversible." : "Move to the archive database?"}
        confirmVariant={isArchivedView ? 'danger' : 'default'}
      />

      {onMove && (
          <MoveCollectionModal 
            isOpen={isMoveModalOpen}
            onClose={() => setIsMoveModalOpen(false)}
            onMove={onMove}
            collections={collections}
            currentCollectionId={store.collectionId}
            storeName={store.store_name}
          />
      )}
    </>
  );
};

export default StoreCard;
