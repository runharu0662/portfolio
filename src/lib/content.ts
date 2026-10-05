import { getCollection } from 'astro:content';
import { initialCategories } from './site';
export async function learningEntries() {
  return (await getCollection('learning', ({ data }) => import.meta.env.DEV || !data.draft))
    .sort((a, b) => b.data.updated.valueOf() - a.data.updated.valueOf() || a.id.localeCompare(b.id));
}
export async function projectEntries() {
  return (await getCollection('projects')).sort((a, b) => b.data.updated.valueOf() - a.data.updated.valueOf() || a.id.localeCompare(b.id));
}
export function categories(entries: Awaited<ReturnType<typeof learningEntries>>) {
  return [...new Set([...initialCategories, ...entries.map(entry => entry.data.category)])];
}
