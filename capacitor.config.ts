import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.sizeseeker.app',
  appName: 'Size Seeker',
  webDir: 'dist',
  bundledWebRuntime: false,
  server: {
    androidScheme: 'https',
    iosScheme: 'https',
    // Set cleartext false for production builds; override via env if needed
    cleartext: process.env.NODE_ENV === 'development',
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 1200,
      launchAutoHide: true,
      backgroundColor: '#0b1220',
      androidSplashResourceName: 'splash',
      androidScaleType: 'CENTER_CROP',
      showSpinner: false
    },
    Camera: {
      permissions: ['camera']
    }
  },
  android: {
    allowMixedContent: true,
    permissions: [
      'android.permission.CAMERA',
      'android.permission.READ_EXTERNAL_STORAGE',
      'android.permission.WRITE_EXTERNAL_STORAGE'
    ]
  },
  ios: {
    permissions: [
      'NSCameraUsageDescription'
    ]
  }
};

export default config;