export const site = {
  name: "LEARNFOLIO",
  description: "[石井晴大のポートフォリオサイト兼学習記録サイト]",
  author: "[石井晴大]",
  github: "https://github.com/runharu0662",
};
export const href = (path = "") =>
  `${import.meta.env.BASE_URL.replace(/\/$/, "")}/${path.replace(/^\//, "")}`;
export const dateLabel = (date: Date) => date.toISOString().slice(0, 10);
export const categorySlug = (category: string) =>
  category
    .normalize("NFKC")
    .toLowerCase()
    .replace(/[^\p{L}\p{N}]+/gu, "-")
    .replace(/^-|-$/g, "");
export const initialCategories = ["AWS", "Docker", "Go", "Terraform", "Make", "Node.js", "Astro", "Vite", "Git", "CI/CD"];
