import fs from "fs";
import path from "path";
import matter from "gray-matter";
import { remark } from "remark";
import remarkHtml from "remark-html";

const POSTS_DIR = path.join(process.cwd(), "content/blog");

export interface BlogPost {
  slug: string;
  title: string;
  date: string;
  excerpt: string;
  author: string;
  tag: string;
  readTime: string;
  content: string;
}

export interface BlogMeta {
  slug: string;
  title: string;
  date: string;
  excerpt: string;
  author: string;
  tag: string;
  readTime: string;
}

function ensureDir() {
  if (!fs.existsSync(POSTS_DIR)) fs.mkdirSync(POSTS_DIR, { recursive: true });
}

export function getAllPosts(): BlogMeta[] {
  ensureDir();
  const files = fs.readdirSync(POSTS_DIR).filter((f) => f.endsWith(".md"));
  return files
    .map((file) => {
      const slug = file.replace(/\.md$/, "");
      const raw = fs.readFileSync(path.join(POSTS_DIR, file), "utf8");
      const { data } = matter(raw);
      return {
        slug,
        title: data.title ?? slug,
        date: data.date ?? "",
        excerpt: data.excerpt ?? "",
        author: data.author ?? "Pipeline Labs",
        tag: data.tag ?? "General",
        readTime: data.readTime ?? "3 min read",
      } as BlogMeta;
    })
    .sort((a, b) => (a.date < b.date ? 1 : -1));
}

export async function getPostBySlug(slug: string): Promise<BlogPost | null> {
  ensureDir();
  const filePath = path.join(POSTS_DIR, `${slug}.md`);
  if (!fs.existsSync(filePath)) return null;
  const raw = fs.readFileSync(filePath, "utf8");
  const { data, content } = matter(raw);
  const processed = await remark().use(remarkHtml).process(content);
  return {
    slug,
    title: data.title ?? slug,
    date: data.date ?? "",
    excerpt: data.excerpt ?? "",
    author: data.author ?? "Pipeline Labs",
    tag: data.tag ?? "General",
    readTime: data.readTime ?? "3 min read",
    content: processed.toString(),
  };
}
