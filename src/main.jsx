import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { ThemeProvider } from './hooks/useTheme';
import { ToastProvider } from './components/common/Toast';
import ErrorBoundary from './components/common/ErrorBoundary';
import './index.css';
import App from './App.jsx';

// Surface any pre-mount fatal as visible text instead of a blank screen.
// In production, a thrown error inside a Provider would otherwise leave
// <div id="root"> empty with no on-page indication of what went wrong.
window.addEventListener('error', (e) => {
  const root = document.getElementById('root');
  if (root && !root.firstChild) {
    root.innerHTML = `<pre style="padding:24px;color:#b91c1c;font-family:ui-monospace,Menlo,monospace;white-space:pre-wrap">Startup error: ${(e.error?.message || e.message || 'unknown').replace(/[<>]/g, '')}</pre>`;
  }
});

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ErrorBoundary>
      <BrowserRouter>
        <ThemeProvider>
          <ToastProvider>
            <App />
          </ToastProvider>
        </ThemeProvider>
      </BrowserRouter>
    </ErrorBoundary>
  </StrictMode>,
);
