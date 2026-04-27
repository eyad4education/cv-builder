import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.cvbuilder.app',
  appName: 'CV Builder',
  webDir: 'dist',
  server: {
    // During development you can set this to your local server:
    // url: 'http://10.0.2.2:5000',
    // For production builds the bundled dist is used — no server.url needed.
    androidScheme: 'http',
  },
  android: {
    allowMixedContent: true,
  },
};

export default config;
