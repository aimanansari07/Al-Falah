import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.alfalah.masjid',
  appName: 'Jama Masjid',
  webDir: 'dist',
  android: {
    allowMixedContent: true,
    buildOptions: {
      keystorePath: 'al-falah.keystore',
      keystoreAlias: 'al-falah',
    },
  },
  plugins: {
    PushNotifications: {
      presentationOptions: ['badge', 'sound', 'alert'],
    },
    SplashScreen: {
      launchShowDuration: 0,
      launchAutoHide: true,
      backgroundColor: '#1A5C38',
      showSpinner: false,
      splashFullScreen: true,
      splashImmersive: true,
    },
  },
};

export default config;
