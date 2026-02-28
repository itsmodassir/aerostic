import { useEffect } from 'react';
import { App as CapApp } from '@capacitor/app';
import { StatusBar, Style } from '@capacitor/status-bar';
import { Keyboard } from '@capacitor/keyboard';
import { Capacitor } from '@capacitor/core';

const MobileOptimizations = () => {
  useEffect(() => {
    const isNative = Capacitor.isNativePlatform();

    // Configure Status Bar for native apps
    if (isNative) {
      StatusBar.setStyle({ style: Style.Light }).catch(() => {});
      StatusBar.setBackgroundColor({ color: '#ffffff' }).catch(() => {});
      
      // Handle keyboard
      Keyboard.setAccessoryBarVisible({ isVisible: true }).catch(() => {});
      Keyboard.setScroll({ isDisabled: false }).catch(() => {});
      
      // Handle back button
      CapApp.addListener('backButton', ({ canGoBack }) => {
        if (!canGoBack) {
          CapApp.exitApp();
        } else {
          window.history.back();
        }
      });
    }

    // Add mobile viewport meta tag
    const existingViewport = document.querySelector('meta[name="viewport"]');
    if (!existingViewport) {
      const viewport = document.createElement('meta');
      viewport.name = 'viewport';
      viewport.content = 'width=device-width, initial-scale=1.0, viewport-fit=cover, maximum-scale=1.0, user-scalable=no';
      document.head.appendChild(viewport);
    } else {
      existingViewport.setAttribute('content', 'width=device-width, initial-scale=1.0, viewport-fit=cover, maximum-scale=1.0, user-scalable=no');
    }

    // iOS specific meta tags
    const iosMetaTags = [
      { name: 'apple-mobile-web-app-capable', content: 'yes' },
      { name: 'apple-mobile-web-app-status-bar-style', content: 'black-translucent' },
      { name: 'apple-mobile-web-app-title', content: 'Aimstors Solution AI' },
      { name: 'format-detection', content: 'telephone=no' },
      { name: 'mobile-web-app-capable', content: 'yes' }
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

    // Prevent zoom on input focus
    const preventZoom = (e: Event) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        e.target.style.fontSize = '16px';
      }
    };

    document.addEventListener('focusin', preventZoom);
    
    // Handle safe areas
    document.documentElement.style.setProperty('--safe-area-inset-top', 'env(safe-area-inset-top, 0px)');
    document.documentElement.style.setProperty('--safe-area-inset-bottom', 'env(safe-area-inset-bottom, 0px)');
    document.documentElement.style.setProperty('--safe-area-inset-left', 'env(safe-area-inset-left, 0px)');
    document.documentElement.style.setProperty('--safe-area-inset-right', 'env(safe-area-inset-right, 0px)');

    // Add touch optimization classes
    (document.body.style as any).webkitTouchCallout = 'none';
    (document.body.style as any).webkitTapHighlightColor = 'transparent';
    document.body.style.touchAction = 'pan-x pan-y';

    return () => {
      document.removeEventListener('focusin', preventZoom);
      if (isNative) {
        CapApp.removeAllListeners();
      }
    };
  }, []);

  return null;
};

export default MobileOptimizations;
