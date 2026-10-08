import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';
import { fileURLToPath } from 'node:url';
import { watchFile, unwatchFile } from 'node:fs';

// Astro replaces this generated file with an atomic rename. Poll it independently
// so the SSR import map is refreshed even when Vite misses that replacement.
function watchContentModules() {
  return {
    name: 'watch-content-modules',
    configureServer(server) {
      const file = fileURLToPath(new URL('./.astro/content-modules.mjs', import.meta.url));
      const onUpdate = () => {
        const modules = new Set(server.moduleGraph.getModulesByFile(file) || []);
        // Astro can initially resolve the map to a virtual module.
        const virtual = server.moduleGraph.getModuleById('\0astro:content-module-imports');
        if (virtual) modules.add(virtual);
        for (const module of modules) server.moduleGraph.invalidateModule(module);
        server.ws.send({ type: 'full-reload', path: '*' });
      };
      watchFile(file, { interval: 100, persistent: false }, onUpdate);
      server.httpServer?.once('close', () => {
        unwatchFile(file, onUpdate);
      });
    },
  };
}
// CI provides the Pages origin and base; override these for a custom domain.
export default defineConfig({
  site: process.env.SITE_URL || 'https://USERNAME.github.io',
  base: process.env.BASE_PATH || '/',
  output: 'static',
  trailingSlash: 'always',
  integrations: [mdx()],
  vite: { plugins: [watchContentModules()] },
  markdown: { shikiConfig: { themes: { light: 'github-light', dark: 'github-dark' } } },
});
