import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      let errorMessage = "Something went wrong.";
      try {
        const parsed = JSON.parse(this.state.error?.message || "");
        if (parsed.error) errorMessage = parsed.error;
      } catch (e) {
        errorMessage = this.state.error?.message || errorMessage;
      }

      return (
        <div className="min-h-screen flex items-center justify-center bg-zinc-50 p-4">
          <div className="max-w-md w-full glass rounded-3xl p-8 text-center shadow-2xl border border-red-100">
            <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-6">
              <AlertTriangle className="text-red-500 w-8 h-8" />
            </div>
            <h2 className="text-2xl font-display font-bold text-zinc-900 mb-2">System Error</h2>
            <p className="text-zinc-600 mb-8 leading-relaxed">
              {errorMessage}
            </p>
            <button
              onClick={() => window.location.reload()}
              className="w-full py-4 bg-zinc-900 text-white rounded-2xl font-semibold flex items-center justify-center gap-2 hover:bg-zinc-800 transition-colors"
            >
              <RefreshCw className="w-5 h-5" />
              Reload Application
            </button>
          </div>
        </div>
      );
    }

    return (this as any).props.children;
  }
}
