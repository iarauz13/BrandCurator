import React, { useState, useMemo } from 'react';
import { CloseIcon } from './icons/CloseIcon';
import { t } from '../utils/localization';

interface ErrorReportModalProps {
  error: Error | null;
  onReset: () => void;
}

/**
 * ErrorReportModal handles the "User Feedback Loop".
 * 
 * Architectural Choice: 
 * This component handles its own submission state to keep the parent Boundary clean.
 * It correlates technical stack traces with human descriptions before sending to the backend.
 */
const ErrorReportModal: React.FC<ErrorReportModalProps> = ({ error, onReset }) => {
  const [feedback, setFeedback] = useState('');
  const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');
  
  // Unique Reference ID for user/admin correlation
  const errorId = useMemo(() => `ERR-${Math.random().toString(36).substr(2, 9).toUpperCase()}`, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('submitting');

    // Bundling User Input with System Metadata
    const report = {
      errorId,
      userFeedback: feedback,
      timestamp: new Date().toISOString(),
      error: {
        name: error?.name || 'RuntimeError',
        message: error?.message || 'Unexpected crash',
        stack: error?.stack?.substring(0, 1500) // Truncated to avoid payload limits
      },
      environment: {
        url: window.location.href,
        locale: navigator.language,
        userAgent: navigator.userAgent,
        screenSize: `${window.innerWidth}x${window.innerHeight}`
      }
    };

    try {
      // Communicates with backend without exposing admin credentials
      const response = await fetch('/api/report-error', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(report)
      });

      if (response.ok) {
        setStatus('success');
      } else {
        throw new Error('Reporting service unreachable');
      }
    } catch (err) {
      setStatus('error');
    }
  };

  return (
    <div className="bg-brand-surface rounded-2xl border border-brand-border shadow-2xl p-8 max-w-lg mx-auto text-left transition-all">
      <h2 className="text-4xl font-display text-brand-primary mb-2">{t('Something went wrong')}</h2>
      <p className="text-brand-text-secondary mb-6 leading-relaxed">
        {t('We encountered an error. Please describe what you were doing so our team can fix it.')}
      </p>

      {status === 'success' ? (
        <div className="py-6 text-center animate-in zoom-in-95">
          <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
          </div>
          <h3 className="text-xl font-bold mb-2">{t('Thank you')}</h3>
          <p className="text-brand-text-secondary mb-8 text-sm">{t('Your report has been received.')}</p>
          <button onClick={onReset} className="w-full px-6 py-3 bg-brand-primary text-white font-bold rounded-lg hover:opacity-90 transition-all">
            {t('Reload App')}
          </button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="bg-brand-bg rounded-lg p-4 border border-brand-border flex justify-between items-center">
            <span className="text-[10px] font-bold uppercase tracking-widest text-brand-text-secondary">Ref ID</span>
            <code className="text-brand-primary font-mono text-sm font-bold">{errorId}</code>
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-bold text-brand-text-primary">{t('What were you doing?')}</label>
            <textarea
              required
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              placeholder={t('e.g. Clicking on the map view...')}
              className="w-full h-32 p-4 bg-brand-bg border border-brand-border rounded-xl text-sm focus:ring-2 focus:ring-brand-secondary outline-none resize-none transition-shadow"
            />
          </div>

          {status === 'error' && (
            <p className="text-xs text-red-600 bg-red-50 p-3 rounded-lg border border-red-100 italic">
              {t('Reporting failed. Our engineers are likely already on it, but please reload the page.')}
            </p>
          )}

          <div className="flex gap-3 pt-4">
            <button type="button" onClick={onReset} className="flex-1 px-4 py-3 bg-brand-bg border border-brand-border font-bold rounded-xl text-sm hover:bg-gray-100 transition-colors">
              {t('Skip & Reset')}
            </button>
            <button 
              type="submit" 
              disabled={status === 'submitting'}
              className="flex-1 px-4 py-3 bg-brand-primary text-white font-bold rounded-xl text-sm hover:opacity-90 disabled:opacity-50 flex items-center justify-center shadow-lg transition-transform active:scale-95"
            >
              {status === 'submitting' ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : t('Submit Feedback')}
            </button>
          </div>
        </form>
      )}
    </div>
  );
};

export default ErrorReportModal;