import './lib/fetchPolyfill';
import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// Global mouse-tracking spotlight coordinator for buttons with a background
if (typeof window !== 'undefined') {
  let isTicking = false;
  window.addEventListener('mousemove', (e) => {
    if (!isTicking) {
      window.requestAnimationFrame(() => {
        const target = (e.target as HTMLElement)?.closest(
          '.btn-glow, button[class*="bg-"], a[class*="bg-"], [data-glow="true"]'
        ) as HTMLElement | null;

        if (target) {
          const rect = target.getBoundingClientRect();
          const x = e.clientX - rect.left;
          const y = e.clientY - rect.top;
          target.style.setProperty('--mouse-x', `${x}px`);
          target.style.setProperty('--mouse-y', `${y}px`);
        }
        isTicking = false;
      });
      isTicking = true;
    }
  }, { passive: true });
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);

