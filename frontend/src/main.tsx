import React from "react"
import ReactDOM from "react-dom/client"
import App from "@/app/App"
import "./index.css"

class GlobalErrorBoundary extends React.Component<{children: React.ReactNode}, {hasError: boolean, error: Error | null}> {
  constructor(props: {children: React.ReactNode}) {
    super(props);
    this.state = { hasError: false, error: null };
  }
  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }
  render() {
    if (this.state.hasError) {
      return (
        <div style={{ backgroundColor: 'black', color: 'red', padding: '2rem', height: '100vh', fontFamily: 'monospace' }}>
          <h1>CRITICAL REACT RENDER CRASH:</h1>
          <h2 style={{ color: 'white' }}>{this.state.error?.message}</h2>
          <pre style={{ color: 'gray', marginTop: '1rem', whiteSpace: 'pre-wrap' }}>{this.state.error?.stack}</pre>
        </div>
      );
    }
    return this.props.children;
  }
}

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <GlobalErrorBoundary>
      <App />
    </GlobalErrorBoundary>
  </React.StrictMode>
)
