import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';
const common = {
  title: z.string().min(1), description: z.string(), date: z.coerce.date(),
  updated: z.coerce.date(), tags: z.array(z.string()).default([]),
};
const url = z.union([z.literal(''), z.string().url().refine(value => /^https?:\/\//.test(value), 'Use an HTTP(S) URL')]);
export const collections = {
  learning: defineCollection({ loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/learning' }),
    schema: z.object({ ...common, category: z.string().min(1), draft: z.boolean().default(false) }) }),
  projects: defineCollection({ loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/projects' }),
    schema: z.object({ ...common, repository: url.default(''), demo: url.default(''), featured: z.boolean().default(false) }) }),
};
