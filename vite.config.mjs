import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'node:path';

// Web target (react-native-web). Mobile (iOS/Android) continues to build via
// Metro from index.js — this config only powers the `npm run web` dev/build.
export default defineConfig(({ mode }) => ({
  // Expose the existing .env vars (no VITE_ prefix) to the @env shim below.
  envPrefix: ['VITE_', 'SUPABASE_', 'OSM_'],
  plugins: [react()],
  resolve: {
    // Prefer `.web.*` files so platform-specific shims (e.g. geolocation)
    // win over their native counterparts, mirroring Metro's resolution.
    extensions: [
      '.web.tsx',
      '.web.ts',
      '.web.jsx',
      '.web.js',
      '.tsx',
      '.ts',
      '.jsx',
      '.js',
      '.json',
      '.mjs',
    ],
    alias: {
      // Screens never import the SDK directly; map RN -> RN-web at the root.
      'react-native': 'react-native-web',
      // `@env` is a react-native-dotenv (Babel) construct that Metro handles;
      // on web we resolve it to a shim backed by Vite's import.meta.env.
      '@env': path.resolve(__dirname, 'web/env-shim.ts'),
      // RN-only URL polyfill; the browser already provides URL/URLSearchParams.
      'react-native-url-polyfill/auto': path.resolve(__dirname, 'web/empty.ts'),
    },
  },
  define: {
    global: 'globalThis',
    __DEV__: JSON.stringify(mode !== 'production'),
  },
  optimizeDeps: {
    esbuildOptions: {
      // RN-web and friends ship `.js` files containing JSX.
      loader: { '.js': 'jsx' },
      resolveExtensions: ['.web.js', '.js', '.ts', '.tsx', '.json'],
    },
  },
}));
