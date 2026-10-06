import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';
import { fileURLToPath } from 'node:url';

// Deferred MDX imports change when articles are added. Watch the generated map
// explicitly so polling also invalidates the SSR module cached by Vite.
function watchContentModules() {
  return {
    name: 'watch-content-modules',
    configureServer(server) {
      const file = fileURLToPath(new URL('./.astro/content-modules.mjs', import.meta.url));
      server.watcher.add(file);
      const onUpdate = (changed) => {
        if (changed !== file) return;
        const module = server.moduleGraph.getModuleById(file);
        if (module) server.moduleGraph.invalidateModule(module);
        server.ws.send({ type: 'full-reload', path: '*' });
      };
      server.watcher.on('add', onUpdate);
      server.watcher.on('change', onUpdate);
      server.httpServer?.once('close', () => {
        server.watcher.off('add', onUpdate);
        server.watcher.off('change', onUpdate);
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
