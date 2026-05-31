import React, { Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Home from './pages/Home';
import { ToastProvider } from '../kits/react/workspace/src/components/ui/Toast';
import { ThemeProvider } from './context/ThemeContext';
import { AIProvider } from './context/AIContext';
import RunLocally from './pages/RunLocally';
import './styles/openui.css';

const Studio = React.lazy(() => import('./pages/Studio'));

// The studio needs the local dev-server backend (file CRUD, AI proxy, MCP, live
// preview), which only exists under `npm run dev`. A production build (e.g. the
// hosted site at openui.live) has no backend, so /studio shows RunLocally there.
const studioElement = import.meta.env.PROD
  ? <RunLocally />
  : <Suspense fallback={null}><Studio /></Suspense>;

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
            </Routes>
          </Router>
        </ToastProvider>
      </AIProvider>
    </ThemeProvider>
  );
}

export default App;
