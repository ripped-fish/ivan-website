// @ts-check
import { defineConfig } from 'astro/config';

import sitemap from '@astrojs/sitemap';

import cloudflare from '@astrojs/cloudflare';

export default defineConfig({
  site: 'https://ivanpkchan.com',

  redirects: {
    '/adding-drama-to-your-skies-naturally/': '/blog/adding-drama-to-your-skies-naturally/',
  },

  integrations: [sitemap()],
  adapter: cloudflare(),
});