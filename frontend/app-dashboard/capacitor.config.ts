import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'in.aimstore.app',
  appName: 'Aimstore',
  webDir: 'out',
  // Live production URL — no local bundling needed
  server: {
    url: 'https://app.aimstore.in',
    cleartext: false,
    androidScheme: 'https',
  },
  android: {
    buildOptions: {
      keystorePath: 'release.keystore',
      keystoreAlias: 'aimstore',
    },
    // Allow geolocation, camera, microphone for future features
    allowMixedContent: false,
    captureInput: true,
    webContentsDebuggingEnabled: false,
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 2000,
      launchAutoHide: true,
      backgroundColor: '#ffffff',
      androidSplashResourceName: 'splash',
      showSpinner: false,
    },
    StatusBar: {
      style: 'light',
      backgroundColor: '#1d4ed8',
    },
  },
};

export default config;
