import React from 'react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    this.setState({ error, errorInfo });
    console.error("Uncaught error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-slate-900 text-white p-10 flex flex-col items-center justify-center">
            <h1 className="text-3xl font-bold text-red-500 mb-4">Something went wrong.</h1>
            <div className="bg-slate-800 p-6 rounded-lg border border-red-500/30 max-w-2xl overflow-auto">
                <p className="font-mono text-sm text-red-300 mb-4">{this.state.error && this.state.error.toString()}</p>
                <details className="whitespace-pre-wrap font-mono text-xs text-slate-400">
                    {this.state.errorInfo && this.state.errorInfo.componentStack}
                </details>
            </div>
            <button 
                onClick={() => window.location.reload()}
                className="mt-6 px-4 py-2 bg-primary rounded-lg hover:bg-primary/80"
            >
                Reload Application
            </button>
        </div>
      );
    }

    return this.props.children; 
  }
}

export default ErrorBoundary;
