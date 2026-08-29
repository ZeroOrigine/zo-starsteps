import type { CapacitorConfig } from '@capacitor/cli';

// Star Steps iOS/iPad wrapper. Web assets are bundled locally (www/) so the
// app is fully offline, same as the PWA. Do not use server.url for the store
// build: Apple treats remote-URL wrappers as web clips and rejects them.
const config: CapacitorConfig = {
  appId: 'com.zeroorigine.starsteps',
  appName: 'Star Steps',
  webDir: 'www',
  ios: { contentInset: 'automatic', backgroundColor: '#F1F0FB' }
};
export default config;
