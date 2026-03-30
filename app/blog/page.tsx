import { getAllPosts } from "@/lib/blog";
import BlogListClient from "./blog-list-client";

export const metadata = {
  title: "Blog — Pipeline Labs",
  description: "Insights on AI, data preprocessing, and machine learning from the Pipeline Labs team.",
};

export default function BlogPage() {
  const posts = getAllPosts();
  return <BlogListClient posts={posts} />;
}
