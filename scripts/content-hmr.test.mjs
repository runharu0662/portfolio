// Integration check against a running development server. Creates only temporary
// articles under a unique directory and removes them when the check finishes.
import assert from 'node:assert/strict';
import { mkdtemp, writeFile, unlink, rmdir } from 'node:fs/promises';
import path from 'node:path';

const origin = process.env.CONTENT_TEST_ORIGIN || 'http://localhost:4321';
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));
const directory = await mkdtemp('src/content/learning/hmr-probe-');
const folder = path.basename(directory).toLowerCase();
const files = new Set();
const body = (title) => `---
title: ${JSON.stringify(title)}
description: "Temporary content reload check"
date: 2026-10-07
updated: 2026-10-07
category: Docker
draft: true
---

## ${title}
`;

async function expectPage(id, status, title) {
  const deadline = Date.now() + 8000;
  let response;
  let html;
  do {
    response = await fetch(new URL(`learning/${id}/`, `${origin.replace(/\/$/, '')}/`));
    html = await response.text();
    if (response.status === status && (!title || html.includes(title))) return;
    await delay(300);
  } while (Date.now() < deadline);
  assert.equal(response.status, status, `${id}: unexpected response`);
  assert.ok(!title || html.includes(title), `${id}: stale article content`);
}

try {
  // Warm the deferred import map before creating new files.
  await expectPage('docker/basics', 200);
  for (let round = 0; round < 3; round++) {
    const names = [0, 1, 2].map(index => `round-${round}-article-${index}`);
    for (const name of names) {
      const file = path.join(directory, `${name}.mdx`);
      await writeFile(file, body(name), { flag: 'wx' });
      files.add(file);
    }
    for (const name of names) await expectPage(`${folder}/${name}`, 200, name);
    const first = path.join(directory, `${names[0]}.mdx`);
    await writeFile(first, body(`${names[0]} edited`));
    await expectPage(`${folder}/${names[0]}`, 200, `${names[0]} edited`);
    for (const name of names) {
      const file = path.join(directory, `${name}.mdx`);
      await unlink(file);
      files.delete(file);
    }
    for (const name of names) await expectPage(`${folder}/${name}`, 404);
    // Recreating the same URL must also replace its compiled MDX content.
    await writeFile(first, body(`${names[0]} recreated`), { flag: 'wx' });
    files.add(first);
    await expectPage(`${folder}/${names[0]}`, 200, `${names[0]} recreated`);
    await unlink(first);
    files.delete(first);
    await expectPage(`${folder}/${names[0]}`, 404);
  }
  console.log('MDX reload passed: batch additions, edits, deletions and recreation (3 rounds).');
} finally {
  for (const file of files) await unlink(file);
  await rmdir(directory);
}
