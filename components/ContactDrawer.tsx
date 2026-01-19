
import React, { useState } from 'react';
import { CloseIcon } from './icons/CloseIcon';
import { ThemeConfig } from '../types';

interface ContactDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  theme: ThemeConfig;
}

const ContactDrawer: React.FC<ContactDrawerProps> = ({ 
  isOpen, 
  onClose, 
  theme 
}) => {
  const [status, setStatus] = useState<'idle' | 'sending' | 'success'>('idle');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    message: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('sending');

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        setStatus('success');
      } else {
        throw new Error('Failed to send');
      }
    } catch (err) {
      alert('Something went wrong. Please try again.');
      setStatus('idle');
    }
  };

  return (
    <>
      <div 
        className={`fixed inset-0 bg-black/30 backdrop-blur-[2px] z-[100] 
          transition-opacity duration-500 ease-in-out
          ${isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}
        onClick={onClose}
      />

      <div 
        className={`fixed top-0 right-0 h-full w-full sm:max-w-sm bg-brand-surface 
          shadow-2xl z-[101] transform transition-transform duration-500 
          ease-[cubic-bezier(0.4,0,0.2,1)] border-l border-brand-border
          ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}
      >
        <div className="p-medium-lg flex flex-col h-full font-display">
          <div className="flex justify-between items-center mb-medium-lg">
            <h2 className="text-display-md font-semibold text-brand-text-primary 
              leading-tight">
              Contact Us
            </h2>
            <button 
              onClick={onClose} 
              className="text-brand-text-secondary hover:text-brand-primary"
            >
              <CloseIcon />
            </button>
          </div>

          {status === 'success' ? (
            <div className="flex-grow flex flex-col items-center justify-center 
              text-center animate-in fade-in duration-700">
              <div 
                className="w-20 h-20 rounded-full flex items-center 
                  justify-center mb-medium-lg"
                style={{ backgroundColor: `${theme.accent}15`, color: theme.accent }}
              >
                <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" 
                  stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" 
                    d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h3 className="text-display-sm font-semibold mb-tight-md">
                Message Sent!
              </h3>
              <p className="text-brand-text-secondary font-normal 
                leading-relaxed text-base">
                Thank you for reaching out. We will get back to you shortly.
              </p>
              <button 
                onClick={onClose}
                className="mt-medium-lg text-small uppercase tracking-widest 
                  font-sans font-semibold hover:underline"
              >
                Close Drawer
              </button>
            </div>
          ) : (
            <>
              <p className="text-brand-text-secondary font-normal 
                mb-medium-lg leading-relaxed text-large">
                Have a question or feedback? We'd love to hear from you.
              </p>

              <form onSubmit={handleSubmit} className="space-y-medium-sm 
                flex-grow overflow-y-auto pr-tight-md custom-scrollbar">
                <div>
                  <label className="block text-small uppercase tracking-[0.2em] 
                    font-sans font-semibold text-brand-text-secondary 
                    mb-tight-md">
                    Name
                  </label>
                  <input
                    required
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    className="w-full bg-brand-bg border-b border-brand-border 
                      py-tight-md focus:border-brand-primary outline-none 
                      transition-colors font-normal text-base"
                  />
                </div>

                <div>
                  <label className="block text-small uppercase tracking-[0.2em] 
                    font-sans font-semibold text-brand-text-secondary 
                    mb-tight-md">
                    Email
                  </label>
                  <input
                    required
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    className="w-full bg-brand-bg border-b border-brand-border 
                      py-tight-md focus:border-brand-primary outline-none 
                      transition-colors font-normal text-base"
                  />
                </div>

                <div>
                  <label className="block text-small uppercase tracking-[0.2em] 
                    font-sans font-semibold text-brand-text-secondary 
                    mb-tight-md">
                    Phone (Optional)
                  </label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({...formData, phone: e.target.value})}
                    className="w-full bg-brand-bg border-b border-brand-border 
                      py-tight-md focus:border-brand-primary outline-none 
                      transition-colors font-normal text-base"
                  />
                </div>

                <div>
                  <label className="block text-small uppercase tracking-[0.2em] 
                    font-sans font-semibold text-brand-text-secondary 
                    mb-tight-md">
                    Message
                  </label>
                  <textarea
                    required
                    rows={4}
                    value={formData.message}
                    onChange={(e) => setFormData({...formData, message: e.target.value})}
                    className="w-full bg-brand-bg border border-brand-border 
                      p-medium-sm rounded-lg focus:border-brand-primary 
                      outline-none transition-colors resize-none font-normal 
                      text-base leading-relaxed"
                    placeholder="Describe your request..."
                  />
                </div>

                <div className="pt-medium-lg">
                  <button 
                    disabled={status === 'sending'}
                    type="submit"
                    style={{ backgroundColor: theme.accent, color: theme.textOnAccent }}
                    className="w-full py-medium-lg font-sans font-semibold 
                      uppercase tracking-[0.3em] text-small rounded-full 
                      shadow-lg hover:opacity-90 active:scale-95 transition-all 
                      flex items-center justify-center"
                  >
                    {status === 'sending' ? (
                      <div className="w-4 h-4 border-2 border-white 
                        border-t-transparent rounded-full animate-spin" />
                    ) : (
                      'Send Message'
                    )}
                  </button>
                </div>
              </form>
            </>
          )}
          
          <div className="mt-medium-lg pt-medium-lg border-t border-brand-border 
            text-center">
            <span className="text-small uppercase tracking-[0.5em] 
              text-brand-text-secondary font-sans font-semibold opacity-30">
              Personal Curation Assistant
            </span>
          </div>
        </div>
      </div>
    </>
  );
};

export default ContactDrawer;
