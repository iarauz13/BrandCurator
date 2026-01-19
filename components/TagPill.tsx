import React from 'react';
import { t } from '../utils/localization';

interface TagPillProps {
  label: string;
  onRemove?: () => void;
}

const TagPill: React.FC<TagPillProps> = ({ label, onRemove }) => {
  // Apply translation/prettification to hide internal keys like "tag.weddings"
  const cleanLabel = t(label);

  return (
    <span className={`flex items-center text-xs font-medium rounded-full ${onRemove ? 'bg-brand-border text-brand-text-primary pl-2.5 pr-1 py-1' : 'text-brand-text-secondary'}`}>
      {cleanLabel}
      {onRemove && (
        <button 
            onClick={onRemove} 
            className="ml-1.5 w-4 h-4 flex items-center justify-center rounded-full bg-brand-text-secondary/20 hover:bg-brand-text-secondary/40 text-brand-text-primary"
            aria-label={`Remove ${cleanLabel}`}
        >
          &times;
        </button>
      )}
    </span>
  );
};

export default TagPill;