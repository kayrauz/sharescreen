// @ts-check
import { defineConfig } from 'astro/config';

import tailwindcss from '@tailwindcss/vite';

import react from '@astrojs/react';

import cloudflare from '@astrojs/cloudflare';

// https://astro.build/config
export default defineConfig({
  vite: {
    plugins: [tailwindcss()],
    define: {
      global: 'globalThis',
    },
    ssr: {
      external: ['@astrojs/cloudflare']
    }
  },

  integrations: [react({
    include: ['**/react/*'],
    experimentalReactChildren: false
  })],
  adapter: cloudflare({
    platformProxy: {
      enabled: true
    }
  }),
  output: 'server'
});