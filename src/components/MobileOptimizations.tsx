
import { useEffect } from 'react';

const MobileOptimizations = () => {
  useEffect(() => {
    // Add mobile viewport meta tag if it doesn't exist
    const existingViewport = document.querySelector('meta[name="viewport"]');
    if (!existingViewport) {
      const viewport = document.createElement('meta');
      viewport.name = 'viewport';
      viewport.content = 'width=device-width, initial-scale=1.0, viewport-fit=cover, user-scalable=no';
      document.head.appendChild(viewport);
    } else {
      existingViewport.setAttribute('content', 'width=device-width, initial-scale=1.0, viewport-fit=cover, user-scalable=no');
    }

    // Add iOS specific meta tags
    const iosMetaTags = [
      { name: 'apple-mobile-web-app-capable', content: 'yes' },
      { name: 'apple-mobile-web-app-status-bar-style', content: 'black-translucent' },
      { name: 'apple-mobile-web-app-title', content: 'Aerostic AI' },
      { name: 'apple-touch-fullscreen', content: 'yes' },
      { name: 'format-detection', content: 'telephone=no' },
      { name: 'msapplication-tap-highlight', content: 'no' }
    ];

    iosMetaTags.forEach(tag => {
      const existing = document.querySelector(`meta[name="${tag.name}"]`);
      if (!existing) {
        const meta = document.createElement('meta');
        meta.name = tag.name;
        meta.content = tag.content;
        document.head.appendChild(meta);
      } else {
        existing.setAttribute('content', tag.content);
      }
    });

    // Add iOS app icons
    const iconSizes = ['57x57', '60x60', '72x72', '76x76', '114x114', '120x120', '144x144', '152x152', '180x180'];
    iconSizes.forEach(size => {
      const existing = document.querySelector(`link[rel="apple-touch-icon"][sizes="${size}"]`);
      if (!existing) {
        const link = document.createElement('link');
        link.rel = 'apple-touch-icon';
        link.setAttribute('sizes', size);
        link.href = `/favicon.ico`;
        document.head.appendChild(link);
      }
    });

    // Prevent zoom on input focus for iOS
    const preventZoom = (e: Event) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        const target = e.target;
        target.style.fontSize = '16px';
      }
    };

    document.addEventListener('focusin', preventZoom);
    
    // Handle iOS safe area
    document.documentElement.style.setProperty('--safe-area-inset-top', 'env(safe-area-inset-top)');
    document.documentElement.style.setProperty('--safe-area-inset-bottom', 'env(safe-area-inset-bottom)');
    document.documentElement.style.setProperty('--safe-area-inset-left', 'env(safe-area-inset-left)');
    document.documentElement.style.setProperty('--safe-area-inset-right', 'env(safe-area-inset-right)');

    return () => {
      document.removeEventListener('focusin', preventZoom);
    };
  }, []);

  return null;
};

export default MobileOptimizations;
