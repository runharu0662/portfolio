import test from 'node:test';
import assert from 'node:assert/strict';
import { createServer } from 'node:http';
import { mkdtemp, cp, symlink, writeFile, readFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { spawn } from 'node:child_process';

test('MDX renders cards and safe fallback links without failing the build', async () => {
  const server = createServer((request, response) => {
    response.setHeader('Content-Type', 'text/html');
    if (request.url === '/failure') { response.writeHead(503); response.end('Unavailable'); return; }
    response.end(`<meta property="og:title" content="Title &amp; &lt;script&gt;">
      <meta property="og:description" content="Card summary">
      <meta property="og:site_name" content="Fixture Site">
      ${request.url === '/image' ? '<meta property="og:image" content="/cover.png">' : ''}`);
  });
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  const url = `http://127.0.0.1:${server.address().port}`;
  const directory = await mkdtemp(join(tmpdir(), 'link-card-'));
  try {
    for (const file of ['src', 'public', 'astro.config.mjs', 'tsconfig.json', 'package.json']) {
      await cp(file, join(directory, file), { recursive: true });
    }
    await symlink(join(process.cwd(), 'node_modules'), join(directory, 'node_modules'));
    await writeFile(join(directory, 'src/pages/link-card-fixture.mdx'), `import LinkCard from '../components/LinkCard.astro';

<div className="prose">
<LinkCard url="${url}/image" />
<LinkCard url="${url}/no-image" />
<LinkCard url="${url}/failure" />
<LinkCard url="javascript:alert(1)" />
</div>
`);
    const output = await new Promise((resolve, reject) => {
      const child = spawn('node', [join(process.cwd(), 'node_modules/astro/astro.js'), 'build'], {
        cwd: directory, env: { ...process.env, BASE_PATH: '/', ASTRO_TELEMETRY_DISABLED: '1' },
      });
      let log = '';
      child.stdout.on('data', data => { log += data; });
      child.stderr.on('data', data => { log += data; });
      child.on('error', reject);
      child.on('close', code => code === 0 ? resolve(log) : reject(new Error(log)));
    });
    assert.ok(output);
    const html = await readFile(join(directory, 'dist/link-card-fixture/index.html'), 'utf8');
    assert.equal((html.match(/class="link-card"/g) || []).length, 2);
    assert.equal((html.match(/class="link-card-image"/g) || []).length, 1);
    assert.ok(html.includes('Fixture Site'));
    assert.ok(html.includes('Card summary'));
    assert.ok(html.includes('&lt;script&gt;'));
    assert.ok(html.includes(`href="${url}/failure"`));
    assert.ok(!html.includes('href="javascript:'));
  } finally {
    server.closeAllConnections();
    await new Promise(resolve => server.close(resolve));
    await rm(directory, { recursive: true, force: true });
  }
});
