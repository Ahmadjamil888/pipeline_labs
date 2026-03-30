"use client";

import { useState } from "react";
import type { BlogMeta } from "@/lib/blog";

const T = {
  font: "'Helvetica Neue', 'HelveticaNeue', Helvetica, Arial, sans-serif",
  pill: "9999px",
};

function TagBadge({ tag }: { tag: string }) {
  return (
    <span style={{
      fontSize: 11, fontWeight: 600, letterSpacing: "0.07em",
      textTransform: "uppercase" as const,
      color: "var(--text3)", background: "var(--bg3)",
      border: "1px solid var(--border)",
      borderRadius: T.pill, padding: "3px 10px",
      fontFamily: T.font,
    }}>{tag}</span>
  );
}

function PostCard({ post }: { post: BlogMeta }) {
  const [hovered, setHovered] = useState(false);
  return (
    <a
      href={`/blog/${post.slug}`}
      style={{
        display: "block", textDecoration: "none",
        background: "var(--card)",
        border: `1px solid ${hovered ? "var(--border2)" : "var(--border)"}`,
        borderRadius: 14, padding: 28,
        transform: hovered ? "translateY(-3px)" : "none",
        transition: "border-color 0.2s, transform 0.2s",
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
        <TagBadge tag={post.tag} />
        <span style={{ fontSize: 12, color: "var(--text3)", fontFamily: T.font }}>{post.readTime}</span>
      </div>
      <h2 style={{
        fontSize: 18, fontWeight: 500, letterSpacing: "-0.3px",
        color: "var(--text)", marginBottom: 10, lineHeight: 1.35,
        fontFamily: T.font,
      }}>{post.title}</h2>
      <p style={{
        fontSize: 13.5, color: "var(--text2)", lineHeight: 1.65,
        marginBottom: 20, fontFamily: T.font,
      }}>{post.excerpt}</p>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div style={{
            width: 28, height: 28, borderRadius: "50%",
            background: "linear-gradient(135deg,#555,#222)",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 11, fontWeight: 600, color: "#fff", flexShrink: 0,
          }}>
            {post.author.split(" ").map(w => w[0]).join("").slice(0, 2)}
          </div>
          <span style={{ fontSize: 12.5, color: "var(--text2)", fontFamily: T.font }}>{post.author}</span>
        </div>
        <span style={{ fontSize: 12, color: "var(--text3)", fontFamily: T.font }}>
          {new Date(post.date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
        </span>
      </div>
    </a>
  );
}

export default function BlogListClient({ posts }: { posts: BlogMeta[] }) {
  const tags = ["All", ...Array.from(new Set(posts.map(p => p.tag)))];
  const [activeTag, setActiveTag] = useState("All");

  const filtered = activeTag === "All" ? posts : posts.filter(p => p.tag === activeTag);

  return (
    <div style={{ background: "var(--bg)", minHeight: "100vh", fontFamily: T.font }}>
      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "96px 44px 80px" }}>

        {/* Header */}
        <div style={{ marginBottom: 52 }}>
          <div style={{
            display: "inline-flex", alignItems: "center", gap: 6,
            fontSize: 11, fontWeight: 600, letterSpacing: "0.1em",
            textTransform: "uppercase" as const, color: "var(--text3)",
            marginBottom: 14, fontFamily: T.font,
          }}>Blog</div>
          <h1 style={{
            fontSize: "clamp(32px, 4vw, 52px)", fontWeight: 300,
            letterSpacing: "-0.045em", lineHeight: 1.1,
            color: "var(--text)", marginBottom: 14, fontFamily: T.font,
          }}>Insights on data,<br />AI, and machine learning</h1>
          <p style={{
            fontSize: 16, color: "var(--text2)", lineHeight: 1.65,
            maxWidth: 520, fontFamily: T.font,
          }}>
            Tutorials, deep dives, and product updates from the Pipeline Labs team.
          </p>
        </div>

        {/* Tag filter */}
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" as const, marginBottom: 40 }}>
          {tags.map(tag => (
            <button
              key={tag}
              onClick={() => setActiveTag(tag)}
              style={{
                fontSize: 12.5, fontWeight: 500, fontFamily: T.font,
                padding: "6px 16px", borderRadius: T.pill, cursor: "pointer",
                border: `1px solid ${activeTag === tag ? "var(--text3)" : "var(--border)"}`,
                background: activeTag === tag ? "var(--bg3)" : "transparent",
                color: activeTag === tag ? "var(--text)" : "var(--text2)",
                transition: "all 0.15s",
              }}
            >{tag}</button>
          ))}
        </div>

        {/* Grid */}
        {filtered.length === 0 ? (
          <p style={{ color: "var(--text3)", fontFamily: T.font, fontSize: 14 }}>No posts yet.</p>
        ) : (
          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))",
            gap: 16,
          }}>
            {filtered.map(post => <PostCard key={post.slug} post={post} />)}
          </div>
        )}
      </div>
    </div>
  );
}
