import React from 'react';
import { isFirebaseConfigured } from '../lib/firebase';

interface LoginModalProps {
  onLogin: () => void;
  onGuestLogin: () => void;
  isLoading: boolean;
  error: string | null;
}

const LoginModal: React.FC<LoginModalProps> = ({ onLogin, onGuestLogin, isLoading, error }) => {
  const hasConfig = isFirebaseConfigured;

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
        .fog-background::after {
          width: 500px;
          height: 500px;
          background: radial-gradient(circle, rgba(234, 179, 163, 0.2) 0%, rgba(234, 179, 163, 0) 70%);
          animation-delay: -15s;
          animation-duration: 40s;
        }
        @keyframes fog-animation {
          0% { transform: translate(-50%, -50%) scale(1); opacity: 0.8; }
          25% { transform: translate(0%, -25%) scale(1.2); opacity: 1; }
          50% { transform: translate(50%, 0%) scale(1); opacity: 0.8; }
          75% { transform: translate(0%, 50%) scale(1.2); opacity: 1; }
          100% { transform: translate(-50%, -50%) scale(1); opacity: 0.8; }
        }
      `}</style>
      <div className="fixed inset-0 bg-brand-bg bg-opacity-90 flex justify-center items-center z-50">
        <div className="bg-brand-surface rounded-lg shadow-xl w-full max-w-md m-4 p-10 relative fog-background">
          <div className="relative z-10 flex flex-col items-center text-center">
            <h1 className="text-4xl font-light mb-2 text-brand-primary font-display">
                Brand Curator
            </h1>
            <p className="text-brand-text-secondary mb-8">
              {hasConfig 
                ? "Your personal curation assistant, now in the cloud." 
                : "Development Mode: Firebase keys not found."}
            </p>

            <div className="w-full space-y-3">
              <button
                  onClick={onLogin}
                  disabled={isLoading || !hasConfig}
                  className="w-full flex items-center justify-center gap-3 px-4 py-3 bg-white border border-gray-300 rounded-md text-brand-text-primary font-medium hover:bg-gray-50 transition-all shadow-subtle hover:shadow-subtle-hover disabled:opacity-50"
              >
                 {isLoading ? (
                     <span className="w-5 h-5 border-2 border-brand-secondary border-t-transparent rounded-full animate-spin"></span>
                 ) : (
                     <>
                      <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google" className="w-5 h-5" />
                      <span>{hasConfig ? "Sign in with Google" : "Google Auth Disabled"}</span>
                     </>
                 )}
              </button>

              <button
                onClick={onGuestLogin}
                className="w-full px-4 py-3 bg-brand-primary text-white font-semibold rounded-md hover:opacity-90 transition shadow-subtle"
              >
                Continue as Guest (Local Mode)
              </button>
            </div>
            
            {error && (
                <p className="mt-4 text-sm text-red-500">{error}</p>
            )}
            
            <p className="mt-8 text-xs text-brand-text-secondary/60">
                {hasConfig 
                  ? "By continuing, you agree to store your data safely in our cloud database."
                  : "Running in local state mode. Data will not persist across browser sessions."}
            </p>
          </div>
        </div>
      </div>
    </>
  );
};

export default LoginModal;