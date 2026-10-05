import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
const title = (process.env.TITLE || '').trim();
const category = (process.env.CATEGORY || 'general').trim();
if (!title) { console.error('TITLE is required: make new TITLE="Docker Network" CATEGORY=docker'); process.exit(1); }
if (!/^[a-zA-Z0-9][a-zA-Z0-9-]*$/.test(category)) { console.error('CATEGORY must use letters, numbers, and hyphens.'); process.exit(1); }
const slug = (process.env.SLUG || title.normalize('NFKC').toLowerCase().replace(/[^\p{L}\p{N}]+/gu, '-').replace(/^-|-$/g, '')).trim();
if (!slug || !/^[\p{L}\p{N}][\p{L}\p{N}-]*$/u.test(slug)) { console.error('Provide a valid TITLE or SLUG (letters, numbers, hyphens).'); process.exit(1); }
const folder = category.toLowerCase();
const names = { aws: 'AWS', docker: 'Docker', go: 'Go', terraform: 'Terraform', 'ci-cd': 'CI/CD' };
const label = names[folder] || category[0].toUpperCase() + category.slice(1);
const now = new Date();
const date = `${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,'0')}-${String(now.getDate()).padStart(2,'0')}`;
const file = path.join('src/content/learning', folder, `${slug}.md`);
const body = `---\ntitle: ${JSON.stringify(title)}\ndescription: ""\ndate: ${date}\nupdated: ${date}\ncategory: ${JSON.stringify(label)}\ntags: []\ndraft: true\n---\n\n## Overview\n\n[このテーマについて]\n\n## Why\n\n[なぜこれを学ぶのか]\n\n## Understanding\n\n[自分の理解]\n\n## Experiment\n\n[実際に試した内容]\n\n## Commands\n\n\`\`\`bash\n# 実際に使用したコマンド\n\`\`\`\n\n## What I Got Wrong\n\n[最初に誤解していたこと]\n\n## What I Learned\n\n[実験後に理解したこと]\n\n## Questions\n\n[まだ分かっていないこと]\n\n## Next\n\n[次に学ぶ内容]\n`;
await mkdir(path.dirname(file), { recursive: true });
try { await writeFile(file, body, { flag: 'wx' }); console.log(`Created ${file}`); }
catch (error) { if (error.code === 'EEXIST') console.error(`Already exists (not overwritten): ${file}`); else console.error(error.message); process.exit(1); }
