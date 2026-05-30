import { Component } from 'react';
import { AlertTriangle, RotateCcw } from 'lucide-react';

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { error: null };
  }

  static getDerivedStateFromError(error) {
    return { error };
  }

  componentDidCatch(error, info) {
    console.error('[Studio ErrorBoundary]', error, info);
  }

  render() {
    if (!this.state.error) return this.props.children;

    const msg = this.state.error?.message || String(this.state.error);

    return (
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100%',
        gap: 12,
        padding: 32,
        textAlign: 'center',
        background: '#09090b',
        color: '#f8f8f8',
        fontFamily: "'Inter', sans-serif",
      }}>
        <AlertTriangle size={28} style={{ color: '#f87171', flexShrink: 0 }} />
        <div style={{ fontWeight: 600, fontSize: 14 }}>Something went wrong</div>
        <pre style={{
          maxWidth: 560,
          fontSize: 12,
          color: '#f87171',
          background: 'rgba(239,68,68,0.08)',
          border: '1px solid rgba(239,68,68,0.2)',
          borderRadius: 6,
          padding: '10px 14px',
          whiteSpace: 'pre-wrap',
          wordBreak: 'break-all',
          textAlign: 'left',
          lineHeight: 1.6,
        }}>
          {msg}
        </pre>
        <button
          onClick={() => this.setState({ error: null })}
          style={{
            display: 'flex', alignItems: 'center', gap: 6,
            padding: '6px 14px', borderRadius: 6, border: '1px solid rgba(255,255,255,0.12)',
            background: 'rgba(255,255,255,0.05)', color: 'rgba(255,255,255,0.7)',
            fontSize: 12, cursor: 'pointer', fontFamily: 'inherit',
          }}
        >
          <RotateCcw size={12} /> Try again
        </button>
      </div>
    );
  }
}
