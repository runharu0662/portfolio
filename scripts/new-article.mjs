import { access, mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
const title = (process.env.TITLE || '').trim();
const category = (process.env.CATEGORY || 'general').trim();
if (!title) { console.error('TITLE is required: make new TITLE="Docker Network" CATEGORY=docker'); process.exit(1); }
if (!/^[a-zA-Z0-9][a-zA-Z0-9-]*$/.test(category)) { console.error('CATEGORY must use letters, numbers, and hyphens.'); process.exit(1); }
const slug = (process.env.SLUG || title.normalize('NFKC').toLowerCase().replace(/[^\p{L}\p{N}]+/gu, '-').replace(/^-|-$/g, '')).trim();
if (!slug || !/^[\p{L}\p{N}][\p{L}\p{N}-]*$/u.test(slug)) { console.error('Provide a valid TITLE or SLUG (letters, numbers, hyphens).'); process.exit(1); }
const format = (process.env.FORMAT || 'mdx').trim();
if (!['md', 'mdx'].includes(format)) { console.error('FORMAT must be md or mdx.'); process.exit(1); }
const folder = category.toLowerCase();
const names = { aws: 'AWS', docker: 'Docker', go: 'Go', terraform: 'Terraform', make: 'Make', node: 'Node.js', astro: 'Astro', vite: 'Vite', git: 'Git', 'ci-cd': 'CI/CD' };
const label = names[folder] || category[0].toUpperCase() + category.slice(1);
const now = new Date();
const date = `${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,'0')}-${String(now.getDate()).padStart(2,'0')}`;
const file = path.join('src/content/learning', folder, `${slug}.${format}`);
const componentImport = format === 'mdx' ? "import LinkCard from '../../../components/LinkCard.astro';\n\n" : '';
const body = `---\ntitle: ${JSON.stringify(title)}\ndescription: ""\ndate: ${date}\nupdated: ${date}\ncategory: ${JSON.stringify(label)}\ntags: []\ndraft: true\n---\n\n${componentImport}## 確認したいこと\n\n[今回の問いと、読むファイル]\n\n## 自分の理解\n\n[今の予想を自分の言葉で]\n\n## コードと実験\n\n[読んだ箇所・予想・実行結果・理解を直した点]\n\n## 障害対応・残った疑問\n\n[実際に調べた症状・ログ・対処・復旧確認、または未確認の問い]\n`;
// Both extensions share an article URL; refuse to create a duplicate.
for (const extension of ['md', 'mdx']) {
  const existing = path.join('src/content/learning', folder, `${slug}.${extension}`);
  try { await access(existing); }
  catch (error) {
    if (error.code === 'ENOENT') continue;
    console.error(error.message); process.exit(1);
  }
  console.error(`Already exists (not overwritten): ${existing}`); process.exit(1);
}
await mkdir(path.dirname(file), { recursive: true });
try { await writeFile(file, body, { flag: 'wx' }); console.log(`Created ${file}`); }
catch (error) { if (error.code === 'EEXIST') console.error(`Already exists (not overwritten): ${file}`); else console.error(error.message); process.exit(1); }
