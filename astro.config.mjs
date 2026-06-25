import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';
import netlify from '@astrojs/netlify';

// https://astro.build/config
export default defineConfig({
  site: 'https://dentamenta.mentematica.com',
  output: 'server',
  adapter: netlify({
    imageCDN: false
  }),
  vite: {
    plugins: [tailwindcss()]
  }
});
