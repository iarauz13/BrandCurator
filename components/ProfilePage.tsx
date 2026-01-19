
import React, { useState, useRef, useEffect, useMemo } from 'react';
import { User, Collection, ThemeConfig } from '../types';
import { THEME_PRESETS } from '../constants/themes';
import { CameraIcon } from './icons/CameraIcon';
import { UploadIcon } from './icons/UploadIcon';
import { PlusCircleIcon } from './icons/PlusCircleIcon';
import { DatabaseIcon } from './icons/DatabaseIcon';
import { ChevronRightIcon } from './icons/ChevronRightIcon';
import { TrashIcon } from './icons/TrashIcon';
import { FolderIcon } from './icons/FolderIcon';
import { CloseIcon } from './icons/CloseIcon';
import { useHistoryState } from '../hooks/useHistoryState';
import { UndoIcon } from './icons/UndoIcon';
import { RedoIcon } from './icons/RedoIcon';

interface ProfilePageProps {
  user: User;
  onUpdateUser: (user: User) => void;
  theme: ThemeConfig;
  onSetTheme: (theme: ThemeConfig) => void;
  collections: Collection[];
  onOpenImportModal: (mode: 'import' | 'append') => void;
  onAddStoreClick: () => void;
  onLoadSampleData: () => void;
  onClearCollection: (collectionId: string) => void;
  onRemoveCollection: (collectionId: string) => void;
}

const DataManagementRow: React.FC<{
    icon: React.ReactNode;
    title: string;
    description: string;
    onClick: () => void;
}> = ({ icon, title, description, onClick }) => (
    <button onClick={onClick} className="group flex items-center gap-5 bg-brand-surface rounded-xl p-4 min-h-[72px] transition-all duration-300 hover:bg-black/5 w-full text-left border border-brand-border shadow-sm">
        <div className="flex items-center gap-5 flex-1">
            <div className="text-brand-text-secondary flex items-center justify-center rounded-lg bg-brand-bg shrink-0 size-12 group-hover:bg-brand-border transition-colors">
                {icon}
            </div>
            <div className="flex flex-col justify-center">
                <p className="text-brand-text-primary text-base font-medium leading-normal">{title}</p>
                <p className="text-brand-text-secondary text-sm font-light leading-normal">{description}</p>
            </div>
        </div>
        <div className="shrink-0">
            <div className="text-brand-text-secondary/50 flex size-7 items-center justify-center">
                <ChevronRightIcon className="transition-transform duration-300 group-hover:translate-x-1" />
            </div>
        </div>
    </button>
);


const ProfilePage: React.FC<ProfilePageProps> = ({ user, onUpdateUser, theme, onSetTheme, collections, onOpenImportModal, onAddStoreClick, onLoadSampleData, onClearCollection, onRemoveCollection }) => {
  const initialFormState = useMemo(() => ({
    firstName: user.firstName,
    lastName: user.lastName,
    profilePicture: user.profilePicture,
    theme: theme,
  }), [user, theme]);

  const { state: formData, setState: setFormData, reset, undo, redo, canUndo, canRedo } = useHistoryState(initialFormState);
  const [isSaved, setIsSaved] = useState(false);
  
  /**
   * Coordinated Contrast Logic:
   * Instead of hardcoded grey, we use colors derived from the theme state
   * that maintain vibrancy while establishing hierarchy.
   */
  const contrastTextColor = formData.theme.textPrimary;
  const contrastSecondaryColor = formData.theme.textSecondary;
  const previewAccentColor = formData.theme.accent;
  const previewTextOnAccent = formData.theme.textOnAccent;

  // Flow States for Modals
  const [clearFlowState, setClearFlowState] = useState<'idle' | 'selecting' | 'success'>('idle');
  const [removeFlowState, setRemoveFlowState] = useState<'idle' | 'selecting' | 'confirming' | 'success'>('idle');

  // Selection Tracking
  const [selectedCollectionId, setSelectedCollectionId] = useState<string | null>(null);
  const [lastActionedName, setLastActionedName] = useState<string>('');
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  useEffect(() => {
    reset(initialFormState);
  }, [user, theme, reset, initialFormState]);

  const handlePictureUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setFormData({ ...formData, profilePicture: reader.result as string });
      reader.readAsDataURL(file);
    }
  };

  const handleSaveChanges = () => {
    const { theme: newTheme, ...userToUpdate } = formData;
    onUpdateUser({ ...user, ...userToUpdate });
    onSetTheme(newTheme);
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2000);
  };
  
  const handleResetChanges = () => reset(initialFormState);
  const hasChanges = JSON.stringify(initialFormState) !== JSON.stringify(formData);

  // Actions for clearing/removing
  const handleClearAction = () => {
    if (selectedCollectionId) {
        const target = collections.find(c => c.id === selectedCollectionId);
        if (target) {
            setLastActionedName(target.name);
            onClearCollection(selectedCollectionId);
            setClearFlowState('success');
        }
    }
  };

  const handleRemoveConfirm = () => {
    if (selectedCollectionId) {
        const target = collections.find(c => c.id === selectedCollectionId);
        if (target) {
            setLastActionedName(target.name);
            onRemoveCollection(selectedCollectionId);
            setRemoveFlowState('success');
        }
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-12 pb-12">
      <div>
        <h2 className="text-4xl font-light mb-8 font-display transition-colors duration-500" style={{ color: contrastTextColor }}>
            Profile & Settings
        </h2>
        
        <div className="bg-brand-surface rounded-2xl border border-brand-border p-8 grid grid-cols-1 md:grid-cols-3 gap-8 shadow-xl">
          <div className="md:col-span-1 flex flex-col items-center">
            <div className="relative">
              <div className="w-32 h-32 rounded-full bg-brand-bg border border-brand-border flex items-center justify-center overflow-hidden">
                {formData.profilePicture ? (
                  <img src={formData.profilePicture} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                  <span className="text-4xl font-bold text-[#6b7280]">{formData.firstName.charAt(0)}{formData.lastName.charAt(0)}</span>
                )}
              </div>
              <button 
                onClick={() => fileInputRef.current?.click()} 
                style={{ backgroundColor: previewAccentColor, color: previewTextOnAccent }}
                className="absolute -bottom-2 -right-2 rounded-full p-2 hover:opacity-90 transition-all shadow-md active:scale-90"
              >
                <CameraIcon className="w-5 h-5" />
              </button>
              <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handlePictureUpload} />
            </div>
            <h3 className="text-2xl font-medium mt-4 text-center font-display text-brand-primary">{formData.firstName} {formData.lastName}</h3>
          </div>

          <div className="md:col-span-2 space-y-6">
            <div className="space-y-4">
              <h4 className="text-[10px] font-extrabold uppercase tracking-widest text-brand-text-secondary">User Information</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <input type="text" name="firstName" value={formData.firstName} onChange={e => setFormData({...formData, firstName: e.target.value})} className="w-full bg-brand-bg text-[#1a1a1a] border border-brand-border rounded-xl p-3 focus:ring-2 focus:ring-brand-secondary/50 outline-none transition-all" placeholder="First Name" />
                <input type="text" name="lastName" value={formData.lastName} onChange={e => setFormData({...formData, lastName: e.target.value})} className="w-full bg-brand-bg text-[#1a1a1a] border border-brand-border rounded-xl p-3 focus:ring-2 focus:ring-brand-secondary/50 outline-none transition-all" placeholder="Last Name" />
              </div>
            </div>

            <div className="space-y-4">
              <h4 className="text-[10px] font-extrabold uppercase tracking-widest text-brand-text-secondary">Theming & Appearance</h4>
              {/* Theme Picker Grid: Optimized for 5 high-end options */}
              <div className="grid grid-cols-3 sm:grid-cols-5 gap-3">
                  {THEME_PRESETS.map(preset => (
                      <button
                        key={preset.id}
                        title={preset.name}
                        onClick={() => setFormData({ ...formData, theme: preset })}
                        className={`w-full aspect-square rounded-xl border-2 transition-all transform hover:scale-105 shadow-sm active:scale-95 ${formData.theme.id === preset.id ? 'ring-4 ring-offset-2 ring-brand-secondary border-brand-primary' : 'border-brand-border'}`}
                        style={{ background: preset.background }}
                      />
                  ))}
              </div>
              <p className="text-[10px] uppercase font-bold tracking-widest" style={{ color: contrastSecondaryColor }}>{formData.theme.name}</p>
            </div>

             <div className="pt-4 flex justify-end items-center gap-3">
                <div className="flex items-center gap-2 mr-auto">
                    <button onClick={undo} disabled={!canUndo} className="p-2 bg-brand-bg border border-brand-border rounded-lg hover:border-[#6b7280]/50 disabled:opacity-50 transition-colors"><UndoIcon /></button>
                    <button onClick={redo} disabled={!canRedo} className="p-2 bg-brand-bg border border-brand-border rounded-lg hover:border-[#6b7280]/50 disabled:opacity-50 transition-colors"><RedoIcon /></button>
                </div>
                <button onClick={handleResetChanges} disabled={!hasChanges} className="px-6 py-2.5 bg-brand-border font-bold rounded-xl hover:opacity-80 disabled:opacity-50 text-[#1a1a1a] transition-all text-sm">Reset</button>
                <button 
                    onClick={handleSaveChanges} 
                    disabled={!hasChanges} 
                    style={{ backgroundColor: previewAccentColor, color: previewTextOnAccent }}
                    className="px-6 py-2.5 font-bold rounded-xl hover:opacity-90 w-40 disabled:opacity-50 transition-all shadow-lg text-sm flex items-center justify-center active:scale-95"
                >
                    {isSaved ? 'Saved!' : 'Save Changes'}
                </button>
            </div>
          </div>
        </div>
      </div>
      
       <div>
            <h2 className="text-4xl font-light mb-8 font-display transition-colors duration-500" style={{ color: contrastTextColor }}>
                Data Management
            </h2>
            <div className="space-y-3">
                <DataManagementRow icon={<UploadIcon />} title="Import from CSV" description="Replace current collection with items from a CSV file." onClick={() => onOpenImportModal('import')} />
                 <DataManagementRow icon={<UploadIcon />} title="Append from CSV" description="Add and update items from a CSV to your collection." onClick={() => onOpenImportModal('append')} />
                 <DataManagementRow icon={<PlusCircleIcon />} title="Add Item Manually" description="Add a single new item to your collection." onClick={onAddStoreClick} />
                <DataManagementRow icon={<DatabaseIcon />} title="Load Sample Data" description="Explore the app with a sample Fashion Brands dataset." onClick={onLoadSampleData} />
                <DataManagementRow icon={<TrashIcon />} title="Clear Collection" description="Choose a collection to reset and delete all items within it." onClick={() => setClearFlowState('selecting')} />
                <DataManagementRow icon={<TrashIcon />} title="Remove Collection" description="Remove an entire collection from the app permanently." onClick={() => setRemoveFlowState('selecting')} />
            </div>
       </div>

      {/* Clear/Remove Flow Modals */}
      {clearFlowState === 'selecting' && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[60] p-4" onClick={() => setClearFlowState('idle')}>
            <div className="bg-brand-surface rounded-2xl shadow-2xl w-full max-w-md p-6 relative animate-in fade-in zoom-in-95 duration-200" onClick={e => e.stopPropagation()}>
                <button onClick={() => setClearFlowState('idle')} className="absolute top-4 right-4 text-brand-text-secondary hover:text-brand-primary"><CloseIcon /></button>
                <h3 className="text-2xl font-bold mb-2 font-display text-[#1a1a1a]">Clear a Collection</h3>
                <p className="text-sm text-[#6b7280] mb-6">Which collection should be reset?</p>
                <div className="space-y-2 mb-8">
                    {collections.map(c => (
                        <button key={c.id} onClick={() => setSelectedCollectionId(c.id)} className={`w-full flex items-center gap-3 p-4 rounded-xl border text-left transition-all ${selectedCollectionId === c.id ? 'bg-brand-secondary/10 border-brand-secondary' : 'bg-brand-bg border-brand-border'}`}>
                            <FolderIcon className={selectedCollectionId === c.id ? "text-brand-secondary" : "text-[#6b7280]"} />
                            <span className="font-bold text-[#1a1a1a]">{c.name}</span>
                        </button>
                    ))}
                </div>
                <div className="flex gap-3">
                    <button onClick={() => setClearFlowState('idle')} className="flex-1 px-4 py-2.5 bg-brand-bg border border-brand-border font-bold rounded-xl text-sm">Cancel</button>
                    <button disabled={!selectedCollectionId} onClick={handleClearAction} className="flex-1 px-4 py-2.5 bg-red-600 text-white font-bold rounded-xl text-sm disabled:opacity-50">Clear All</button>
                </div>
            </div>
        </div>
      )}

      {/* Success View for Clear */}
      {clearFlowState === 'success' && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[60] p-4" onClick={() => setClearFlowState('idle')}>
            <div className="bg-brand-surface rounded-2xl shadow-2xl w-full max-w-md p-8 text-center animate-in zoom-in-95 duration-300">
                <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4"><PlusCircleIcon className="rotate-45" /></div>
                <h3 className="text-2xl font-bold mb-2 font-display text-[#1a1a1a]">Collection Reset</h3>
                <p className="text-[#6b7280] mb-8">"{lastActionedName}" is now empty.</p>
                <button onClick={() => setClearFlowState('idle')} className="w-full px-4 py-2.5 bg-brand-primary text-white font-bold rounded-xl text-sm">Dismiss</button>
            </div>
        </div>
      )}
    </div>
  );
};

export default ProfilePage;
