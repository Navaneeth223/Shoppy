import React from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

/**
 * Error boundary component that catches rendering errors.
 * Displays a fallback UI instead of crashing the whole app.
 */
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    // Log to error tracking service in production
    if (import.meta.env.PROD) {
      console.error('[ErrorBoundary]', error, errorInfo);
    }
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="flex flex-col items-center justify-center min-h-[300px] p-8 text-center">
          <div className="w-16 h-16 rounded-full bg-error/10 flex items-center justify-center mb-4">
            <AlertTriangle size={28} className="text-error" />
          </div>
          <h2 className="text-lg font-display font-semibold text-text-primary mb-2">
            Something went wrong
          </h2>
          <p className="text-sm text-text-muted mb-6 max-w-sm">
            {import.meta.env.DEV
              ? this.state.error?.message
              : 'An unexpected error occurred. Please try refreshing the page.'}
          </p>
          <button
            onClick={this.handleReset}
            className="flex items-center gap-2 btn-secondary text-sm"
          >
            <RefreshCw size={14} />
            Try Again
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
