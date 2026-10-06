import { parse, type DefaultTreeAdapterMap } from 'parse5';

export interface OgpData {
  title: string;
  description?: string;
  image?: string;
  siteName?: string;
}

/** Shared by explicit cards and future Markdown URL transforms. */
export function safeHttpUrl(value: string, base?: string): string | undefined {
  try {
    const url = new URL(value, base);
    if (!['http:', 'https:'].includes(url.protocol) || url.username || url.password) return;
    return url.href;
  } catch { return; }
}

/** Parse HTML without executing it; parse5 also decodes HTML entities. */
export function parseOgp(html: string, pageUrl: string): OgpData | null {
  const meta = new Map<string, string>();
  let documentTitle = '';
  function visit(node: DefaultTreeAdapterMap['node']) {
    if ('tagName' in node) {
      const attributes = new Map(node.attrs.map(({ name, value }) => [name, value]));
      if (node.tagName === 'meta') {
        const key = (attributes.get('property') || attributes.get('name') || '').toLowerCase();
        const value = attributes.get('content')?.trim();
        if (value && !meta.has(key)) meta.set(key, value);
      }
      if (node.tagName === 'title') {
        documentTitle = node.childNodes.filter(child => child.nodeName === '#text')
          .map(child => (child as DefaultTreeAdapterMap['textNode']).value).join('').trim();
      }
    }
    if ('childNodes' in node) node.childNodes.forEach(visit);
  }
  visit(parse(html));
  const title = meta.get('og:title') || meta.get('twitter:title') || documentTitle;
  if (!title) return null;
  const image = meta.get('og:image') || meta.get('twitter:image');
  return {
    title: title.slice(0, 500),
    description: (meta.get('og:description') || meta.get('twitter:description') || meta.get('description'))?.slice(0, 1000),
    image: image ? safeHttpUrl(image, pageUrl) : undefined,
    siteName: meta.get('og:site_name')?.slice(0, 200),
  };
}

const TIMEOUT_MS = 5000;
const MAX_BYTES = 1024 * 1024;
const CACHE_TTL_MS = 5 * 60 * 1000;
const cache = new Map<string, { expires: number; result: Promise<OgpData | null> }>();

async function fetchOgp(url: string): Promise<OgpData | null> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
  try {
    let current = url;
    // Bound redirect chains and validate each destination's protocol.
    for (let redirects = 0; redirects <= 5; redirects++) {
      const response = await fetch(current, {
        signal: controller.signal, redirect: 'manual',
        headers: { Accept: 'text/html,application/xhtml+xml', 'User-Agent': 'PortfolioLinkCard/1.0' },
      });
      if ([301, 302, 303, 307, 308].includes(response.status)) {
        await response.body?.cancel();
        const location = response.headers.get('location');
        const next = location && safeHttpUrl(location, current);
        if (!next) return null;
        current = next;
        continue;
      }
      const contentType = response.headers.get('content-type') || '';
      if (!response.ok || !/^(text\/html|application\/xhtml\+xml)(?:;|$)/i.test(contentType) || !response.body) {
        await response.body?.cancel();
        return null;
      }
      const reader = response.body.getReader();
      const chunks: Uint8Array[] = [];
      let size = 0;
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        size += value.byteLength;
        if (size > MAX_BYTES) { await reader.cancel(); return null; }
        chunks.push(value);
      }
      const bytes = new Uint8Array(size);
      let offset = 0;
      for (const chunk of chunks) { bytes.set(chunk, offset); offset += chunk.length; }
      const charset = contentType.match(/charset\s*=\s*["']?([^;\s"']+)/i)?.[1] || 'utf-8';
      return parseOgp(new TextDecoder(charset).decode(bytes), current);
    }
    return null;
  } catch {
    // Network, timeout, decoding, and parsing failures must never break builds.
    return null;
  } finally { clearTimeout(timer); }
}

/** Fetch at build time (or dev render time), deduplicating successes and failures. */
export function getOgp(value: string): Promise<OgpData | null> {
  const url = safeHttpUrl(value);
  if (!url) return Promise.resolve(null);
  const existing = cache.get(url);
  if (existing && existing.expires > Date.now()) return existing.result;
  if (cache.size >= 256) cache.delete(cache.keys().next().value!);
  const result = fetchOgp(url);
  cache.set(url, { expires: Date.now() + CACHE_TTL_MS, result });
  return result;
}
