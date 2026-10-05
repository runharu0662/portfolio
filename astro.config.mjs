import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';
// CI provides the Pages origin and base; override these for a custom domain.
export default defineConfig({
  site: process.env.SITE_URL || 'https://USERNAME.github.io',
  base: process.env.BASE_PATH || '/',
  output: 'static',
  trailingSlash: 'always',
  integrations: [mdx()],
  markdown: { shikiConfig: { themes: { light: 'github-light', dark: 'github-dark' } } },
});
