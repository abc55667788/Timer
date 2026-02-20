import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.emerald.timer',
  appName: 'Emerald Timer',
  webDir: 'dist',
  server: {
    androidScheme: 'https'
  }
};

export default config;
