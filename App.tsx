
import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { Store, User, AppNotification, Collection, ThemeConfig, Folio } from './types';
import { COLLECTION_TEMPLATES } from './collectionTemplates';
import { THEME_PRESETS, DEFAULT_THEME } from './constants/themes';
import StoreList from './components/StoreList';
import EditModal from './components/EditModal';
import DynamicFilterSidebar from './components/DynamicFilterSidebar';
import AddStoreModal from './components/AddStoreModal';
import Header from './components/Header';
import ProfilePage from './components/ProfilePage';
import ImportModal from './components/ImportModal';
import NotificationsPage from './components/NotificationsPage';
import MapView from './components/MapView';
import LoginModal from './components/LoginModal';
import LandingPage from './components/LandingPage';
import ContactDrawer from './components/ContactDrawer';
import CollectionSetupModal from './components/CollectionSetupModal';
import BulkActionBar from './components/BulkActionBar';
import FolioSection from './components/FolioSection';
import ConfirmationModal from './components/ConfirmationModal';
import ShareModal from './components/ShareModal';
import EnrichmentModal from './components/EnrichmentModal';
import { SearchIcon } from './components/icons/SearchIcon';
import { sampleStores } from './sample-data';
import { mockNotifications } from './mock-data';
import { t } from './utils/localization';
import { LIMITS } from './utils/validation';
import { compareStoreNames, normalizeStoreName, formatDescription } from './utils/textFormatter';
import { generateAestheticImage } from './services/geminiService';
import { getPriceBucket } from './utils/priceMapper';

// Firebase Imports
import { 
  auth, 
  db, 
  googleProvider, 
  isFirebaseConfigured, 
  signInWithPopup, 
  onAuthStateChanged,
  doc, 
  setDoc, 
  getDoc, 
  collection, 
  onSnapshot, 
  query, 
  where, 
  deleteDoc 
} from './lib/firebase';

type ActiveView = 'collection' | 'folio' | 'brand' | 'social' | 'profile';
type CollectionView = 'grid' | 'map';

export interface StoreFilters {
  search: string;
  tags: string[];
  onSale: boolean;
  priceRanges: string[]; // Stores bucket IDs (low, mid, high, ultra)
  customFields: Record<string, string[]>;
}

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState(isFirebaseConfigured);
  const [loginError, setLoginError] = useState<string | null>(null);
  
  const [showLanding, setShowLanding] = useState(true);
  const [isContactOpen, setIsContactOpen] = useState(false);
  
  const [collections, setCollections] = useState<Collection[]>([]);
  const [activeCollectionId, setActiveCollectionId] = useState<string | null>(null);
  
  const [showArchived, setShowArchived] = useState(false);
  const [editingStore, setEditingStore] = useState<Store | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isFilterPanelOpen, setIsFilterPanelOpen] = useState(false);
  const [isSetupOpen, setIsSetupOpen] = useState(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [isEnrichmentModalOpen, setIsEnrichmentModalOpen] = useState(false);
  const [selectedStoreIds, setSelectedStoreIds] = useState<Set<string>>(new Set());
  const [isBulkDeleteModalOpen, setIsBulkDeleteModalOpen] = useState(false);
  const [importModalConfig, setImportModalConfig] = useState({ 
    isOpen: false, mode: 'import' as 'import' | 'append' 
  });
  const [generatingImageIds, setGeneratingImageIds] = useState<Set<string>>(new Set());

  const [activeView, setActiveView] = useState<ActiveView>('collection');
  const [collectionView, setCollectionView] = useState<CollectionView>('grid');
  
  const [theme, setTheme] = useState<ThemeConfig>(DEFAULT_THEME);
  const [notifications, setNotifications] = useState<AppNotification[]>(mockNotifications);

  const getInitialFiltersFromUrl = (): StoreFilters => {
    try {
      const params = new URLSearchParams(window.location.search);
      const customFields: Record<string, string[]> = {};
      params.forEach((value, key) => {
        if (key.startsWith('cf_')) {
          const fieldName = key.replace('cf_', '').replace(/_/g, ' ');
          customFields[fieldName] = value.split(',').filter(Boolean);
        }
      });
      return {
        search: params.get('q') || '',
        tags: params.get('tags')?.split(',').filter(Boolean) || [],
        onSale: params.get('sale') === 'true',
        priceRanges: params.get('price')?.split(',').filter(Boolean) || [],
        customFields
      };
    } catch (e) {
      return { search: '', tags: [], onSale: false, priceRanges: [], customFields: {} };
    }
  };

  const [filters, setFilters] = useState<StoreFilters>(getInitialFiltersFromUrl());

  useEffect(() => {
    if (window.location.protocol === 'blob:') return;
    try {
      const params = new URLSearchParams();
      if (filters.search) params.set('q', filters.search);
      if (filters.tags.length > 0) params.set('tags', filters.tags.join(','));
      if (filters.onSale) params.set('sale', 'true');
      if (filters.priceRanges.length > 0) params.set('price', filters.priceRanges.join(','));
      Object.entries(filters.customFields).forEach(([field, values]) => {
        if (values.length > 0) {
          const key = `cf_${field.toLowerCase().replace(/\s+/g, '_')}`;
          params.set(key, values.join(','));
        }
      });
      const paramsString = params.toString();
      const newUrl = `${window.location.pathname}${paramsString ? '?' + paramsString : ''}`;
      if (window.location.search !== (paramsString ? '?' + paramsString : '')) {
        window.history.replaceState({ path: newUrl }, '', newUrl);
      }
    } catch (e) {
      console.warn("URL State Synchronization is not supported in this environment.");
    }
  }, [filters]);

  const activeCollection = useMemo(() => {
    return collections.find(c => c.id === activeCollectionId) || null;
  }, [collections, activeCollectionId]);

  const selectedStores = useMemo(() => {
    if (!activeCollection) return [];
    return activeCollection.stores.filter(s => selectedStoreIds.has(s.id));
  }, [activeCollection, selectedStoreIds]);

  useEffect(() => {
    if (user && collections.length === 0 && !authLoading) {
        setIsSetupOpen(true);
    }
  }, [user, collections.length, authLoading]);

  useEffect(() => {
    if (!isFirebaseConfigured) return;
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser: any) => {
      setAuthLoading(true);
      if (firebaseUser) {
        const userRef = doc(db, 'users', firebaseUser.uid);
        const userSnap = await getDoc(userRef);
        let appUser: User;
        if (userSnap.exists()) {
          appUser = userSnap.data() as User;
          if (appUser.activeCollectionId) {
            setActiveCollectionId(appUser.activeCollectionId);
          }
        } else {
          const names = (firebaseUser.displayName || 'User').split(' ');
          appUser = {
            userId: firebaseUser.uid,
            firstName: names[0],
            lastName: names.length > 1 ? names.slice(1).join(' ') : '',
            email: firebaseUser.email || '',
            profilePicture: firebaseUser.photoURL || undefined,
            activeCollectionId: undefined
          };
          await setDoc(userRef, appUser);
        }
        setUser(appUser);
        setShowLanding(false);
        const q = query(collection(db, 'collections'), where("ownerId", "==", firebaseUser.uid));
        const unsubscribeCollections = onSnapshot(q, (snapshot: any) => {
            const syncedCollections: Collection[] = [];
            snapshot.forEach((doc: any) => { syncedCollections.push(doc.data() as Collection); });
            setCollections(syncedCollections);
            if (!activeCollectionId && syncedCollections.length > 0) setActiveCollectionId(syncedCollections[0].id);
        });
        setAuthLoading(false);
        return () => unsubscribeCollections();
      } else {
        setUser(null);
        setAuthLoading(false);
      }
    });
    return () => unsubscribe();
  }, []);

  const handleLogin = async () => {
      if (!isFirebaseConfigured) return;
      try { await signInWithPopup(auth, googleProvider); } catch (err) { setLoginError("Could not sign in with Google."); }
  };

  const handleGuestLogin = () => { setUser({ userId: 'guest', firstName: 'Guest', lastName: 'User' }); };
  
  const saveCollection = async (updatedCollection: Collection) => {
      if (!user) return;
      setCollections(prev => prev.some(c => c.id === updatedCollection.id) ? prev.map(c => c.id === updatedCollection.id ? updatedCollection : c) : [...prev, updatedCollection]);
      if (isFirebaseConfigured && user.userId !== 'guest') { await setDoc(doc(db, 'collections', updatedCollection.id), updatedCollection); }
  };

  const handleRemoveCollection = async (collectionId: string) => {
    if (!user) return;
    setCollections(prev => prev.filter(c => c.id !== collectionId));
    if (activeCollectionId === collectionId) {
      const remaining = collections.filter(c => c.id !== collectionId);
      setActiveCollectionId(remaining.length > 0 ? remaining[0].id : null);
    }
    if (isFirebaseConfigured && user.userId !== 'guest') { await deleteDoc(doc(db, 'collections', collectionId)); }
  };

  const handleSetupComplete = (setupUser: User, collectionType: string, isFirstCollection: boolean) => {
    if (!collectionType) { setIsSetupOpen(false); return; }
    setUser(setupUser);
    if (isFirebaseConfigured && setupUser.userId !== 'guest') { setDoc(doc(db, 'users', setupUser.userId), setupUser, { merge: true }).catch(err => console.error(err)); }
    const template = COLLECTION_TEMPLATES.find(t => t.name === collectionType) || COLLECTION_TEMPLATES[0];
    const newCollection: Collection = { id: crypto.randomUUID(), ownerId: setupUser.userId, name: collectionType, template, stores: [], folios: [], createdAt: new Date().toISOString() };
    saveCollection(newCollection);
    setActiveCollectionId(newCollection.id);
    setIsSetupOpen(false);
  };

  const handleAddStore = (storeData: Partial<Store>) => {
    if (!activeCollection || !user) return;
    const newStore: Store = { ...storeData, id: crypto.randomUUID(), collectionId: activeCollection.id, addedBy: { userId: user.userId, userName: `${user.firstName} ${user.lastName}`.trim() }, favoritedBy: [], privateNotes: [], customFields: {}, rating: 0, priceRange: storeData.priceRange || '', sustainability: '', description: '', country: '', city: '', tags: storeData.tags || [] } as Store;
    saveCollection({ ...activeCollection, stores: [...activeCollection.stores, newStore] });
    setIsAddModalOpen(false);
  };

  const handleEditStore = (updatedStore: Store) => {
    if (!activeCollection) return;
    const updatedStores = activeCollection.stores.map(s => s.id === updatedStore.id ? updatedStore : s);
    saveCollection({ ...activeCollection, stores: updatedStores });
    setEditingStore(null);
  };

  const handleEnrichComplete = (enrichedStores: Store[]) => {
    if (!activeCollection) return;
    
    const updatedStores = activeCollection.stores.map(s => {
      const enriched = enrichedStores.find(e => e.id === s.id);
      if (!enriched) return s;

      // Requirement Rule 1: Non-destructive update. Only fill empty fields.
      const updated = { ...s };
      const websiteEmpty = !s.website || /^(none|n\/a|na|false)$/i.test(s.website.trim());
      const descEmpty = !s.description || s.description.length < 10 || /^(none|n\/a|na|false)$/i.test(s.description.trim());

      if (enriched.website && websiteEmpty) {
        updated.website = enriched.website;
      }
      
      if (enriched.description && descEmpty) {
        // Requirement Rule 2: Run through formatDescription before saving
        updated.description = formatDescription(enriched.description);
      }

      return updated;
    });

    saveCollection({ ...activeCollection, stores: updatedStores });
    setIsEnrichmentModalOpen(false);
    setSelectedStoreIds(new Set());
  };

  const handleArchiveStore = (storeId: string, archive: boolean) => {
    if (!activeCollection) return;
    const updatedStores = activeCollection.stores.map(s => s.id === storeId ? { ...s, isArchived: archive } : s);
    saveCollection({ ...activeCollection, stores: updatedStores });
  };

  const handleDeleteStore = (storeId: string) => {
    if (!activeCollection) return;
    const updatedStores = activeCollection.stores.filter(s => s.id !== storeId);
    saveCollection({ ...activeCollection, stores: updatedStores });
    setEditingStore(null);
  };

  const handleFolioAdd = (name: string, themeId: string) => {
    if (!activeCollection) return;
    const newFolio: Folio = { id: crypto.randomUUID(), name, themeId, storeIds: [], createdAt: new Date().toISOString() };
    saveCollection({ ...activeCollection, folios: [...(activeCollection.folios || []), newFolio] });
  };

  const handleDeleteFolio = (folioId: string) => {
    if (!activeCollection) return;
    const updatedFolios = (activeCollection.folios || []).filter(f => f.id !== folioId);
    saveCollection({ ...activeCollection, folios: updatedFolios });
  };

  const handleDropToFolio = (storeId: string, folioId: string) => {
    if (!activeCollection) return;
    const updatedFolios = (activeCollection.folios || []).map(f => f.id === folioId ? { ...f, storeIds: Array.from(new Set([...f.storeIds, storeId])) } : f);
    saveCollection({ ...activeCollection, folios: updatedFolios });
  };

  const handleSyncFolioStores = (folioId: string, storeIds: string[]) => {
    if (!activeCollection) return;
    const updatedFolios = (activeCollection.folios || []).map(f => f.id === folioId ? { ...f, storeIds } : f);
    saveCollection({ ...activeCollection, folios: updatedFolios });
  };

  const handleRemoveFromFolio = (storeId: string, folioId: string) => {
    if (!activeCollection) return;
    const updatedFolios = (activeCollection.folios || []).map(f => f.id === folioId ? { ...f, storeIds: f.storeIds.filter(id => id !== storeId) } : f);
    saveCollection({ ...activeCollection, folios: updatedFolios });
  };

  const handleClearFolio = (folioId: string) => {
    if (!activeCollection) return;
    const updatedFolios = (activeCollection.folios || []).map(f => f.id === folioId ? { ...f, storeIds: [] } : f);
    saveCollection({ ...activeCollection, folios: updatedFolios });
  };

  const handleGenerateImage = async (storeId: string) => {
    const store = activeCollection?.stores.find(s => s.id === storeId);
    if (!store || !activeCollection) return;
    setGeneratingImageIds(prev => new Set(prev).add(storeId));
    try {
      const base64Data = await generateAestheticImage(store);
      const imageUrl = `data:image/png;base64,${base64Data}`;
      const updatedStores = activeCollection.stores.map(s => s.id === storeId ? { ...s, imageUrl } : s);
      saveCollection({ ...activeCollection, stores: updatedStores });
    } catch (err) { console.error(err); } finally { setGeneratingImageIds(prev => { const next = new Set(prev); next.delete(storeId); return next; }); }
  };

  const handleBulkAddToFolio = (folioId: string) => {
    if (!activeCollection) return;
    const updatedFolios = (activeCollection.folios || []).map(f => f.id === folioId ? { ...f, storeIds: Array.from(new Set([...f.storeIds, ...Array.from(selectedStoreIds)])) } : f);
    saveCollection({ ...activeCollection, folios: updatedFolios });
    setSelectedStoreIds(new Set());
  };

  const handleBulkDelete = () => {
    if (!activeCollection) return;
    const updatedStores = activeCollection.stores.filter(s => !selectedStoreIds.has(s.id));
    const updatedFolios = (activeCollection.folios || []).map(f => ({ ...f, storeIds: f.storeIds.filter(id => !selectedStoreIds.has(id)) }));
    saveCollection({ ...activeCollection, stores: updatedStores, folios: updatedFolios });
    setSelectedStoreIds(new Set());
    setIsBulkDeleteModalOpen(false);
  };

  const filteredStores = useMemo(() => {
    if (!activeCollection || !user) return [];
    const { search, tags: selectedTags, onSale, priceRanges, customFields } = filters;
    const searchLower = search.trim().toLowerCase();
    return activeCollection.stores.filter(store => {
        const matchesSearch = !searchLower || (store.store_name.toLowerCase().includes(searchLower) || t(store.city).toLowerCase().includes(searchLower) || t(store.country).toLowerCase().includes(searchLower) || store.tags.some(tag => tag.toLowerCase().includes(searchLower)));
        const matchesArchive = showArchived ? !!store.isArchived : !store.isArchived;
        const matchesTags = selectedTags.length === 0 || selectedTags.every(tag => store.tags?.includes(tag));
        const matchesSale = !onSale || !!store.onSale;
        const matchesPrice = priceRanges.length === 0 || (!!store.priceRange && priceRanges.includes(getPriceBucket(store.priceRange)));
        const matchesCustomFields = Object.entries(customFields).every(([field, selectedOptions]) => { const options = selectedOptions as string[]; if (options.length === 0) return true; const storeValues = store.customFields[field] || []; return options.some(opt => storeValues.includes(opt)); });
        return matchesSearch && matchesArchive && matchesTags && matchesSale && matchesPrice && matchesCustomFields;
      }).sort((a, b) => compareStoreNames(a.store_name, b.store_name));
  }, [activeCollection, filters, user, showArchived]);

  const handleMarkAllAsRead = () => { setNotifications(prev => prev.map(n => ({ ...n, read: true }))); };

  if (showLanding) return <LandingPage onEnter={() => setShowLanding(false)} />;
  if (!user) return <LoginModal onLogin={handleLogin} onGuestLogin={handleGuestLogin} isLoading={authLoading} error={loginError} />;
  
  const dynamicStyles = { '--brand-bg-custom': theme.background, '--brand-accent': theme.accent, '--brand-text-on-accent': theme.textOnAccent, '--brand-text-primary': theme.textPrimary, '--brand-text-secondary': theme.textSecondary, backgroundColor: theme.background.includes('gradient') ? 'transparent' : theme.background, backgroundImage: theme.background.includes('gradient') ? theme.background : 'none', color: theme.textPrimary, transition: 'background 0.5s ease-in-out, color 0.5s ease-in-out' } as React.CSSProperties;

  return (
    <div className="min-h-screen p-6" style={dynamicStyles}>
      <div className="max-w-7xl mx-auto pb-24">
        <Header user={user} activeView={activeView} setActiveView={setActiveView} unreadBrand={notifications.filter(n => n.type === 'brand' && !n.read).length} unreadSocial={notifications.filter(n => n.type === 'social' && !n.read).length} backgroundColor={theme.background} collections={collections} activeCollectionId={activeCollectionId} onSwitchCollection={setActiveCollectionId} onCreateCollection={() => setIsSetupOpen(true)} onContactClick={() => setIsContactOpen(true)} theme={theme} />
        <main>
            {activeView === 'collection' && (
                <>
                    <div className="mb-8 flex gap-4">
                        <div className="relative flex-grow">
                            <div className="absolute left-4 top-1/2 -translate-y-1/2 opacity-50"><SearchIcon /></div>
                            <input type="text" value={filters.search} onChange={(e) => setFilters({ ...filters, search: e.target.value })} placeholder={t('ui.search_placeholder')} className="w-full bg-brand-surface border border-brand-border rounded-xl py-4 pl-12 pr-4 focus:ring-2 focus:ring-[var(--brand-accent)] outline-none shadow-subtle text-brand-text-primary font-normal text-base" />
                        </div>
                        <button onClick={() => setIsFilterPanelOpen(true)} className="px-6 py-4 bg-brand-surface border border-brand-border rounded-xl font-semibold shadow-subtle hover:bg-gray-50 transition text-brand-text-primary uppercase tracking-widest text-small">{t('ui.filters')}</button>
                    </div>
                    {collectionView === 'grid' ? (
                      <StoreList stores={filteredStores} user={user} theme={theme} collections={collections} onEdit={setEditingStore} onArchive={(id) => handleArchiveStore(id, true)} onRestore={(id) => handleArchiveStore(id, false)} onDeletePermanently={handleDeleteStore} isArchivedView={showArchived} hasActiveFilters={filters.tags.length > 0 || filters.onSale || filters.priceRanges.length > 0 || Object.keys(filters.customFields).some(k => filters.customFields[k].length > 0) || !!filters.search} selectedStoreIds={selectedStoreIds} onToggleSelection={id => setSelectedStoreIds(prev => { const n = new Set(prev); if (n.has(id)) n.delete(id); else n.add(id); return n; })} generatingImageIds={generatingImageIds} onGenerateImage={handleGenerateImage} scrapingStoreIds={new Set()} onDragStart={() => {}} />
                    ) : ( <MapView stores={filteredStores} onClose={() => setCollectionView('grid')} /> )}
                </>
            )}
            {activeView === 'folio' && activeCollection && (
              <FolioSection folios={activeCollection.folios || []} stores={activeCollection.stores} onAddFolio={handleFolioAdd} onDeleteFolio={handleDeleteFolio} onSyncFolio={handleSyncFolioStores} theme={theme} onRemoveFromFolio={handleRemoveFromFolio} onClearFolio={handleClearFolio} />
            )}
            {(activeView === 'brand' || activeView === 'social') && ( <NotificationsPage title={activeView === 'brand' ? 'Brands Activity' : 'Social Feed'} notifications={notifications.filter(n => activeView === 'brand' ? n.type === 'brand' : n.type === 'social')} onMarkAllAsRead={handleMarkAllAsRead} theme={theme} /> )}
            {activeView === 'profile' && ( <ProfilePage user={user} onUpdateUser={setUser} theme={theme} onSetTheme={setTheme} collections={collections} onOpenImportModal={(mode) => setImportModalConfig({ isOpen: true, mode })} onAddStoreClick={() => setIsAddModalOpen(true)} onLoadSampleData={() => { if (!activeCollection) return; const sampleWithMeta = sampleStores.map(s => ({ ...s, id: crypto.randomUUID(), collectionId: activeCollection.id, addedBy: { userId: user.userId, userName: `${user.firstName} ${user.lastName}`.trim() }, favoritedBy: [], privateNotes: [] })); saveCollection({ ...activeCollection, stores: [...activeCollection.stores, ...sampleWithMeta].slice(0, LIMITS.MAX_STORES_PER_COLLECTION) }); setActiveView('collection'); }} onClearCollection={collectionId => { const c = collections.find(x => x.id === collectionId); if (c) saveCollection({ ...c, stores: [] }); }} onRemoveCollection={handleRemoveCollection} /> )}
        </main>
      </div>

      <BulkActionBar 
        count={selectedStoreIds.size} 
        folios={activeCollection?.folios || []} 
        selectedStores={selectedStores}
        onClear={() => setSelectedStoreIds(new Set())} 
        onAddToFolio={handleBulkAddToFolio} 
        onShare={() => setIsShareModalOpen(true)} 
        onDelete={() => setIsBulkDeleteModalOpen(true)} 
        onEnrich={() => setIsEnrichmentModalOpen(true)} 
        theme={theme} 
      />

      <AddStoreModal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} onAddStore={handleAddStore} onUpdateStore={handleEditStore} existingStores={activeCollection?.stores || []} />

      {editingStore && activeCollection && ( <EditModal store={editingStore} user={user} onClose={() => setEditingStore(null)} onSave={handleEditStore} onDelete={handleDeleteStore} onSelectStore={(s) => setEditingStore(s)} collectionTemplate={activeCollection.template} theme={theme} allCollectionStores={activeCollection.stores} /> )}

      {activeCollection && ( <DynamicFilterSidebar isOpen={isFilterPanelOpen} collection={activeCollection} filteredStores={filteredStores} filters={filters} onFilterChange={setFilters} collectionView={collectionView} onCollectionViewChange={setCollectionView} onClose={() => setIsFilterPanelOpen(false)} /> )}

      {importModalConfig.isOpen && activeCollection && ( <ImportModal isOpen={importModalConfig.isOpen} mode={importModalConfig.mode} onClose={() => setImportModalConfig({ ...importModalConfig, isOpen: false })} onComplete={(stores, id) => { if (!user) return; const targetColl = collections.find(c => c.id === id) || activeCollection; const fullStores: Store[] = stores.map(s => ({ ...s, tags: s.tags.map(t => t.toLowerCase().trim()), priceRange: getPriceBucket(s.priceRange) as Store['priceRange'], id: crypto.randomUUID(), collectionId: id, addedBy: { userId: user.userId, userName: `${user.firstName} ${user.lastName}`.trim() }, favoritedBy: [], privateNotes: [], customFields: s.customFields || {} })); const baseStores = importModalConfig.mode === 'import' ? [] : targetColl.stores; saveCollection({ ...targetColl, stores: [...baseStores, ...fullStores].slice(0, LIMITS.MAX_STORES_PER_COLLECTION) }); setImportModalConfig({ ...importModalConfig, isOpen: false }); setActiveView('collection'); setActiveCollectionId(id); }} collections={collections} activeCollectionId={activeCollectionId} /> )}

      {isSetupOpen && ( <CollectionSetupModal isOpen={isSetupOpen} onSetupComplete={handleSetupComplete} isFirstCollection={collections.length === 0} currentCollectionCount={collections.length} currentUser={user} /> )}

      {isBulkDeleteModalOpen && ( <ConfirmationModal isOpen={isBulkDeleteModalOpen} onClose={() => setIsBulkDeleteModalOpen(false)} onConfirm={handleBulkDelete} title="Remove Selected Brands?" message={`This will permanently delete ${selectedStoreIds.size} brands from your entire collection. This action is irreversible.`} confirmVariant="danger" confirmButtonText="Delete Permanently" /> )}

      {activeCollection && isShareModalOpen && ( <ShareModal isOpen={isShareModalOpen} onClose={() => setIsShareModalOpen(false)} allStores={activeCollection.stores} selectedStoreIds={selectedStoreIds} onExport={(stores) => {}} onSearchUsers={async () => []} onSendShare={async () => {}} collectionTemplate={activeCollection.template} /> )}

      {activeCollection && isEnrichmentModalOpen && (
        <EnrichmentModal
          isOpen={isEnrichmentModalOpen}
          onClose={() => setIsEnrichmentModalOpen(false)}
          selectedStores={activeCollection.stores.filter(s => selectedStoreIds.has(s.id))}
          onComplete={handleEnrichComplete}
          theme={theme}
        />
      )}

      <ContactDrawer isOpen={isContactOpen} onClose={() => setIsContactOpen(false)} theme={theme} />
    </div>
  );
};

export default App;
