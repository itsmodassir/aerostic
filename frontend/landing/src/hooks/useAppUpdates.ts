import { useState, useEffect } from 'react';
import { Device } from '@capacitor/device';
import { App } from '@capacitor/app';
import { Browser } from '@capacitor/browser';
import { Capacitor } from '@capacitor/core';

interface AppVersion {
  current: string;
  latest: string;
  updateAvailable: boolean;
  isLoading: boolean;
  error?: string;
}

interface UpdateConfig {
  checkInterval?: number; // in minutes
  forceUpdate?: boolean;
  storeUrl?: string;
}

export const useAppUpdates = (config: UpdateConfig = {}) => {
  const [version, setVersion] = useState<AppVersion>({
    current: '1.0.0',
    latest: '1.0.0',
    updateAvailable: false,
    isLoading: false
  });

  const {
    checkInterval = 60, // Check every hour by default
    forceUpdate = false,
    storeUrl = 'https://apps.apple.com/app/aimstors/id123456789' // Replace with actual App Store URL
  } = config;

  const getCurrentVersion = async () => {
    try {
      if (Capacitor.isNativePlatform()) {
        const appInfo = await App.getInfo();
        return appInfo.version;
      }
      return '1.0.0'; // Default for web
    } catch (error) {
      console.error('Error getting current version:', error);
      return '1.0.0';
    }
  };

  const getLatestVersion = async (): Promise<string> => {
    try {
      // In a real app, you'd fetch this from your backend or App Store API
      // For now, we'll simulate with a mock API endpoint
      const response = await fetch('https://api.github.com/repos/your-username/your-app-repo/releases/latest');
      const data = await response.json();
      return data.tag_name?.replace('v', '') || '1.0.0';
    } catch (error) {
      console.error('Error fetching latest version:', error);
      // Return a higher version for demo purposes
      return '1.0.1';
    }
  };

  const compareVersions = (current: string, latest: string): boolean => {
    const currentParts = current.split('.').map(Number);
    const latestParts = latest.split('.').map(Number);
    
    for (let i = 0; i < Math.max(currentParts.length, latestParts.length); i++) {
      const currentPart = currentParts[i] || 0;
      const latestPart = latestParts[i] || 0;
      
      if (latestPart > currentPart) return true;
      if (latestPart < currentPart) return false;
    }
    
    return false;
  };

  const checkForUpdates = async () => {
    setVersion(prev => ({ ...prev, isLoading: true, error: undefined }));
    
    try {
      const [currentVersion, latestVersion] = await Promise.all([
        getCurrentVersion(),
        getLatestVersion()
      ]);

      const updateAvailable = compareVersions(currentVersion, latestVersion);

      setVersion({
        current: currentVersion,
        latest: latestVersion,
        updateAvailable,
        isLoading: false
      });

      return { updateAvailable, currentVersion, latestVersion };
    } catch (error) {
      setVersion(prev => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      }));
      return { updateAvailable: false, currentVersion: '1.0.0', latestVersion: '1.0.0' };
    }
  };

  const openAppStore = async () => {
    try {
      if (Capacitor.isNativePlatform()) {
        await Browser.open({ url: storeUrl });
      } else {
        window.open(storeUrl, '_blank');
      }
    } catch (error) {
      console.error('Error opening app store:', error);
    }
  };

  const getDeviceInfo = async () => {
    try {
      const info = await Device.getInfo();
      return info;
    } catch (error) {
      console.error('Error getting device info:', error);
      return null;
    }
  };

  useEffect(() => {
    // Check for updates on mount
    checkForUpdates();

    // Set up periodic checks
    const interval = setInterval(checkForUpdates, checkInterval * 60 * 1000);

    return () => clearInterval(interval);
  }, [checkInterval]);

  return {
    version,
    checkForUpdates,
    openAppStore,
    getDeviceInfo,
    forceUpdate
  };
};