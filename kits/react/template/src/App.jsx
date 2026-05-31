import { useState, useEffect } from 'react';
import { HashRouter as Router, Routes, Route, useParams } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import ComponentShowcase from './pages/ComponentShowcase';
import { ToastProvider } from './components/ui';

const isPreview = new URLSearchParams(window.location.search).has('preview');

function AIDynamicPage() {
  const { page } = useParams();
  const [Comp, setComp] = useState(null);
  const [err, setErr] = useState(null);

  useEffect(() => {
    setComp(null); setErr(null);
    import(/* @vite-ignore */ `./pages/${page}.jsx`)
      .then(m => {
        if (!m.default) throw new Error(`"${page}.jsx" has no default export`);
        setComp(() => m.default);
      })
      .catch(e => setErr(e.message));
  }, [page]);

  if (err) return (
    <div style={{ padding: 24, color: '#EF4444', fontFamily: 'monospace', fontSize: 13, background: 'var(--bg)', minHeight: '100vh' }}>
      ⚠ {err}
    </div>
  );
  if (!Comp) return (
    <div style={{ padding: 24, color: 'rgba(255,255,255,0.4)', fontSize: 13, background: 'var(--bg)' }}>
      Loading…
    </div>
  );
  return <Comp />;
}

function App() {
  if (isPreview) return <ComponentShowcase />;
  return (
    <ToastProvider>
      <Router>
        <Routes>
          <Route path="/ai/:page" element={<AIDynamicPage />} />
          <Route path="*" element={<Dashboard />} />
        </Routes>
      </Router>
    </ToastProvider>
  );
}

export default App;
