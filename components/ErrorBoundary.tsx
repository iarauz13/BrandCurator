
import React, { Component, ErrorInfo, ReactNode } from 'react';
import ErrorReportModal from './ErrorReportModal';

interface Props {
  children?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

/**
 * ErrorBoundary acts as a safety net for the entire React component tree.
 * 
 * Architectural Choice: 
 * We use a Class Component here because it is the only way to implement 'componentDidCatch' 
 * and 'getDerivedStateFromError' in React. This separates "crash recovery" from the 
 * "functional logic" used in the rest of the application.
 */
class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null
    };
  }

  /**
   * Updates state so the next render will show the fallback UI.
   */
  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  /**
   * Logs error information to the console for developers.
   * In production, this can be extended to log to a local storage buffer.
   */
  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('CRITICAL APP CRASH:', error, errorInfo);
  }

  public render() {
    // Correctly accessing state from this.state
    if (this.state.hasError) {
      // Friendly localized Error State UI
      return (
        <div className="fixed inset-0 bg-brand-bg flex items-center justify-center p-6 z-[100] animate-in fade-in duration-500">
          <div className="max-w-xl w-full text-center">
             <ErrorReportModal 
                error={this.state.error} 
                onReset={() => {
                    // Resets the boundary state and attempts to return to a safe app state
                    this.setState({ hasError: false, error: null });
                    window.location.href = '/';
                }}
             />
          </div>
        </div>
      );
    }

    // Correctly accessing props from this.props
    return this.props.children;
  }
}

export default ErrorBoundary;
