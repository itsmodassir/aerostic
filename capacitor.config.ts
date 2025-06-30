
import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'app.lovable.5bc39ac65590410cb3620ca33f965cad',
  appName: 'setmyblog-ai-launchpad',
  webDir: 'dist',
  server: {
    url: 'https://5bc39ac6-5590-410c-b362-0ca33f965cad.lovableproject.com?forceHideBadge=true',
    cleartext: true
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 2000,
      backgroundColor: '#ffffff',
      showSpinner: false
    }
  }
};

export default config;
