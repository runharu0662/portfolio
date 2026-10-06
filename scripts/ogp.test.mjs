import test from 'node:test';
import assert from 'node:assert/strict';
import { getOgp, parseOgp, safeHttpUrl } from '../src/lib/ogp.ts';

test('HTML parsing, entities, relative images, and unsafe protocols', () => {
  const data = parseOgp(`<html><head><meta content="A &amp; B" property="og:title">
    <meta name="description" content="Summary"><meta property="og:image" content="../cover.png">
    <meta property="og:site_name" content="Example"></head></html>`, 'https://example.com/posts/one');
  assert.deepEqual(data, { title: 'A & B', description: 'Summary', image: 'https://example.com/cover.png', siteName: 'Example' });
  assert.equal(parseOgp('<title>Plain title</title>', 'https://example.com')?.title, 'Plain title');
  assert.equal(parseOgp('<p>No metadata</p>', 'https://example.com'), null);
  assert.equal(parseOgp('<meta property="og:title" content="Title"><meta property="og:image" content="javascript:alert(1)">', 'https://example.com')?.image, undefined);
  for (const url of ['javascript:alert(1)', 'data:text/html,test', 'invalid', 'https://user:secret@example.com']) assert.equal(safeHttpUrl(url), undefined);
});

test('fetch failures, cache deduplication, redirects, size limit, and timeout', async () => {
  const original = globalThis.fetch;
  try {
    let calls = 0;
    globalThis.fetch = async () => { calls++; return new Response('<meta property="og:title" content="Cached">', { headers: { 'content-type': 'text/html' } }); };
    const [first, second] = await Promise.all([getOgp('https://example.com/cache'), getOgp('https://example.com/cache')]);
    assert.equal(calls, 1);
    assert.equal(first, second);
    assert.equal(first.title, 'Cached');
    globalThis.fetch = async () => { throw new Error('Network failed'); };
    assert.equal(await getOgp('https://example.com/network'), null);
    globalThis.fetch = async () => new Response('Failed', { status: 500 });
    assert.equal(await getOgp('https://example.com/status'), null);
    globalThis.fetch = async () => new Response('{}', { headers: { 'content-type': 'application/json' } });
    assert.equal(await getOgp('https://example.com/json'), null);
    globalThis.fetch = async () => new Response('x'.repeat(1024 * 1024 + 1), { headers: { 'content-type': 'text/html' } });
    assert.equal(await getOgp('https://example.com/large'), null);
    globalThis.fetch = async () => new Response(null, { status: 302, headers: { location: 'javascript:alert(1)' } });
    assert.equal(await getOgp('https://example.com/unsafe-redirect'), null);
    globalThis.fetch = async url => String(url).endsWith('/redirect')
      ? new Response(null, { status: 302, headers: { location: '/destination/' } })
      : new Response('<title>Redirected</title><meta property="og:image" content="cover.png">', { headers: { 'content-type': 'text/html' } });
    assert.equal((await getOgp('https://example.com/redirect')).image, 'https://example.com/destination/cover.png');
    globalThis.fetch = async (_url, { signal }) => new Promise((_resolve, reject) => signal.addEventListener('abort', () => reject(signal.reason), { once: true }));
    const start = Date.now();
    assert.equal(await getOgp('https://example.com/timeout'), null);
    assert.ok(Date.now() - start < 6500);
  } finally { globalThis.fetch = original; }
});
