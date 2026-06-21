import React, { Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Home from './pages/Home';
import { ToastProvider } from './components/ui/Toast';
import { ThemeProvider } from './context/ThemeContext';
import { AIProvider } from './context/AIContext';
import RunLocally from './pages/RunLocally';
import { shouldMountStudio } from './utils/studioBackendCheck';
import './styles/openui.css';

const Studio = React.lazy(() => import('./pages/Studio'));
const Docs = React.lazy(() => import('./pages/Docs'));

// Full studio UI: `npm run dev`, or localhost with VITE_OPENUI_STUDIO=1 / vite preview.
// Hosted openui.live / npm start without dev APIs → RunLocally (no Audit, diff, agent writes).
const studioElement = shouldMountStudio()
  ? <Suspense fallback={null}><Studio /></Suspense>
  : <RunLocally />;

function App() {
  return (
    <ThemeProvider>
      <AIProvider>
        <ToastProvider>
          <Router>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/studio" element={<Navigate to="/studio/react" replace />} />
              <Route path="/studio/:framework" element={studioElement} />
              <Route path="/docs" element={<Suspense fallback={null}><Docs /></Suspense>} />
              <Route path="/docs/:component" element={<Suspense fallback={null}><Docs /></Suspense>} />
            </Routes>
          </Router>
        </ToastProvider>
      </AIProvider>
    </ThemeProvider>
  );
}

export default App;
