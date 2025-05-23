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
    }
  },

  integrations: [react()],
  adapter: cloudflare(),
  output: 'static'  // Hybrid rendering: static by default, server-side for prerender: false pages
});