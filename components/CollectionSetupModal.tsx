import React, { useState, useEffect } from 'react';
import { User } from '../types';
import { COLLECTION_TEMPLATES } from '../collectionTemplates';
import { LIMITS } from '../utils/validation';

interface CollectionSetupModalProps {
  isOpen: boolean;
  onSetupComplete: (user: User, collectionType: string, isFirstCollection: boolean) => void;
  isFirstCollection: boolean;
  currentCollectionCount: number;
  currentUser: User | null;
}

const CollectionSetupModal: React.FC<CollectionSetupModalProps> = ({ isOpen, onSetupComplete, isFirstCollection, currentCollectionCount, currentUser }) => {
  const [collectionType, setCollectionType] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [error, setError] = useState('');

  // Determine if we need to ask for a name. If guest is "Guest User", we want to replace it.
  const needsNameInput = isFirstCollection || (currentUser?.userId === 'guest' && currentUser?.firstName === 'Guest');

  useEffect(() => {
    if (isOpen && currentUser) {
      if (currentUser.firstName !== 'Guest') setFirstName(currentUser.firstName);
      if (currentUser.lastName !== 'User') setLastName(currentUser.lastName);
    }
  }, [isOpen, currentUser]);

  const isAtLimit = currentCollectionCount >= LIMITS.MAX_COLLECTIONS_PER_USER;

  const handleSubmit = () => {
    if (isAtLimit) {
      setError(`You have reached the maximum of ${LIMITS.MAX_COLLECTIONS_PER_USER} collections.`);
      return;
    }
    if (!collectionType.trim()) {
      setError('Please choose or enter a collection type.');
      return;
    }
    if (needsNameInput && (!firstName.trim() || !lastName.trim())) {
      setError('Please enter your first and last name.');
      return;
    }

    const user: User = {
      userId: currentUser?.userId || crypto.randomUUID(),
      firstName: firstName.trim(),
      lastName: lastName.trim(),
    };
    onSetupComplete(user, collectionType.trim(), isFirstCollection);
  };

  if (!isOpen) return null;

  const title = isFirstCollection ? "Create your first collection" : "Create a new collection";
  const subtext = isFirstCollection ? "Tell us what we're organizing today." : "Expanding your curation? Nice.";

  return (
    <>
      <style>{`
        .fog-background {
          position: relative;
          overflow: hidden;
        }
        .fog-background::before,
        .fog-background::after {
          content: '';
          position: absolute;
          width: 800px;
          height: 800px;
          background: radial-gradient(circle, rgba(234, 179, 163, 0.25) 0%, rgba(234, 179, 163, 0) 60%);
          border-radius: 50%;
          animation: fog-animation 30s linear infinite;
          will-change: transform, opacity;
          z-index: 0;
        }
        @keyframes fog-animation {
          0% { transform: translate(-50%, -50%) scale(1); opacity: 0.8; }
          50% { transform: translate(50%, 0%) scale(1.2); opacity: 1; }
          100% { transform: translate(-50%, -50%) scale(1); opacity: 0.8; }
        }
      `}</style>
      <div className="fixed inset-0 bg-brand-bg bg-opacity-80 flex justify-center items-center z-50">
        <div className="bg-brand-surface rounded-lg shadow-xl w-full max-w-lg m-4 p-8 relative fog-background">
          <div className="relative z-10">
            <h1 className="text-3xl font-bold text-center mb-2 text-brand-primary font-display">
                {isAtLimit ? "Collection Limit Reached" : title}
            </h1>
            <p className="text-brand-text-secondary text-center mb-8">{subtext}</p>

            <div className={`space-y-6 ${isAtLimit ? 'opacity-30 pointer-events-none grayscale' : ''}`}>
              <div>
                <label className="block text-sm font-medium text-brand-text-secondary mb-2">Collection Type</label>
                <input
                  type="text"
                  value={collectionType}
                  onChange={(e) => setCollectionType(e.target.value)}
                  className="w-full bg-brand-bg text-brand-text-primary border border-brand-border rounded-md p-3 focus:ring-2 focus:ring-brand-secondary/50 focus:outline-none transition-all font-sans"
                  placeholder="e.g., Ceramic Studios, Cafes..."
                />
                <div className="flex flex-wrap gap-2 mt-4">
                    {COLLECTION_TEMPLATES.slice(0, 5).map(template => (
                        <button 
                            key={template.id}
                            onClick={() => setCollectionType(template.name)}
                            className={`px-3 py-1.5 text-xs rounded-full border transition-all ${collectionType === template.name ? 'bg-brand-primary border-brand-primary text-white' : 'bg-brand-bg border-brand-border text-brand-text-secondary hover:border-brand-secondary'}`}
                        >
                            {template.name}
                        </button>
                    ))}
                </div>
              </div>
              
              {needsNameInput && (
                <>
                  <hr className="border-brand-border" />
                  <div>
                    <label className="block text-sm font-medium text-brand-text-secondary mb-2">Display Name (Visible in Shares)</label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <input
                          type="text"
                          value={firstName}
                          onChange={(e) => setFirstName(e.target.value)}
                          className="w-full bg-brand-bg text-brand-text-primary border border-brand-border rounded-md p-3 focus:ring-2 focus:ring-brand-secondary/50 focus:outline-none font-sans"
                          placeholder="First Name"
                        />
                        <input
                          type="text"
                          value={lastName}
                          onChange={(e) => setLastName(e.target.value)}
                          className="w-full bg-brand-bg text-brand-text-primary border border-brand-border rounded-md p-3 focus:ring-2 focus:ring-brand-secondary/50 focus:outline-none font-sans"
                          placeholder="Last Name"
                        />
                    </div>
                  </div>
                </>
              )}
            </div>

            {error && <p className="mt-4 text-xs text-red-500 font-medium text-center bg-red-50 p-2 rounded">{error}</p>}

            <div className="mt-8 flex gap-3">
              {!isFirstCollection && (
                  <button onClick={() => onSetupComplete({} as User, '', false)} className="flex-grow px-4 py-3 bg-brand-border text-brand-text-primary font-semibold rounded-md hover:bg-gray-200 transition font-sans">Cancel</button>
              )}
              <button
                onClick={handleSubmit}
                className="flex-grow px-4 py-3 bg-brand-primary text-white font-semibold rounded-md hover:opacity-90 transition disabled:opacity-50 font-sans"
                disabled={isAtLimit || !collectionType.trim() || (needsNameInput && (!firstName.trim() || !lastName.trim()))}
              >
                {isAtLimit ? "Close" : (isFirstCollection ? "Start Collecting" : "Create Collection")}
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default CollectionSetupModal;