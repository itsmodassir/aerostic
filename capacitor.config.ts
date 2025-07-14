
import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'app.lovable.5bc39ac65590410cb3620ca33f965cad',
  appName: 'aerostic',
  webDir: 'dist',
  server: {
    url: 'https://5bc39ac6-5590-410c-b362-0ca33f965cad.lovableproject.com?forceHideBadge=true',
    cleartext: true
  },
  ios: {
    scheme: 'Aerostic',
    contentInset: 'automatic',
    scrollEnabled: true,
    backgroundColor: '#ffffff'
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 2000,
      backgroundColor: '#ffffff',
      showSpinner: false,
      iosSpinnerStyle: 'small',
      splashFullScreen: true,
      splashImmersive: true
    },
    StatusBar: {
      style: 'default',
      backgroundColor: '#ffffff'
    },
    Keyboard: {
      resize: 'body',
      resizeOnFullScreen: true
    }
  }
};

export default config;
