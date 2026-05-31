import React, { Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Home from './pages/Home';
import { ToastProvider } from '../kits/react/workspace/src/components/ui/Toast';
import { ThemeProvider } from './context/ThemeContext';
import { AIProvider } from './context/AIContext';
import './styles/openui.css';

const Studio = React.lazy(() => import('./pages/Studio'));

function App() {
  return (
    <ThemeProvider>
      <AIProvider>
        <ToastProvider>
          <Router>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/studio" element={<Navigate to="/studio/react" replace />} />
              <Route
                path="/studio/:framework"
                element={(
                  <Suspense fallback={null}>
                    <Studio />
                  </Suspense>
                )}
              />
            </Routes>
          </Router>
        </ToastProvider>
      </AIProvider>
    </ThemeProvider>
  );
}

export default App;
