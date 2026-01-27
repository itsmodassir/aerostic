import React from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { registerSW } from 'virtual:pwa-register'

const rootElement = document.getElementById("root")!;

// Add data attribute for loading detection
rootElement.setAttribute('data-react-root', 'true');

// Hide loading spinner immediately when React starts
const loadingElement = document.querySelector('.loading') as HTMLElement;
if (loadingElement) {
  loadingElement.style.display = 'none';
}

createRoot(rootElement).render(<App />);

// Register service worker for PWA
const updateSW = registerSW({
  onNeedRefresh() {
    console.log('New content available, please refresh.');
  },
  onOfflineReady() {
    console.log('App ready to work offline.');
  },
  immediate: true
});

