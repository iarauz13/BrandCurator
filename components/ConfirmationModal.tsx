
import React from 'react';

interface ConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmVariant?: 'default' | 'danger';
  confirmButtonText?: string;
}

const ConfirmationModal: React.FC<ConfirmationModalProps> = ({ 
    isOpen, 
    onClose, 
    onConfirm, 
    title, 
    message, 
    confirmVariant = 'default',
    confirmButtonText = 'Yes, Proceed'
}) => {
  if (!isOpen) {
    return null;
  }

  const confirmButtonClasses = {
      default: 'bg-brand-primary text-white hover:opacity-90',
      danger: 'bg-red-600 text-white hover:bg-red-700',
  };

  return (
    <div 
        className="fixed inset-0 bg-black/50 backdrop-blur-[2px] flex 
          justify-center items-center z-[120] transition-opacity p-medium-lg"
        onClick={onClose}
    >
      <div 
        className="bg-brand-surface rounded-2xl shadow-2xl w-full max-w-md 
          p-medium-lg relative transform transition-all border border-brand-border"
        onClick={(e) => e.stopPropagation()}
      >
        <h3 className="text-display-sm font-semibold mb-medium-sm 
          text-brand-text-primary font-display leading-tight">
          {title}
        </h3>
        
        <p className="text-base text-brand-text-secondary mb-medium-lg 
          leading-relaxed font-normal">
          {message}
        </p>

        <div className="flex justify-end gap-tight-md">
          <button
            onClick={onClose}
            className="px-medium-lg py-medium-sm bg-brand-bg 
              text-brand-text-primary font-semibold rounded-xl 
              hover:opacity-80 transition text-small uppercase tracking-widest"
          >
            Cancel
          </button>
          <button
            onClick={() => {
              onConfirm();
              onClose();
            }}
            className={`px-medium-lg py-medium-sm font-semibold rounded-xl 
              transition shadow-lg active:scale-95 text-small uppercase 
              tracking-widest ${confirmButtonClasses[confirmVariant]}`}
          >
            {confirmButtonText}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmationModal;
