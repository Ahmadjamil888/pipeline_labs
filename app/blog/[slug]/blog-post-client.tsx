"use client";

import type { BlogPost } from "@/lib/blog";

const T = {
  font: "'Helvetica Neue', 'HelveticaNeue', Helvetica, Arial, sans-serif",
  mono: "'Source Code Pro', 'Fira Code', 'Consolas', monospace",
  pill: "9999px",
};

const PROSE_CSS = `
  .prose { color: var(--text2); font-family: ${T.font}; line-height: 1.75; font-size: 16px; }
  .prose h1,.prose h2,.prose h3,.prose h4 {
    color: var(--text); font-weight: 400; letter-spacing: -0.03em;
    margin: 2em 0 0.6em; line-height: 1.2; font-family: ${T.font};
  }
  .prose h2 { font-size: 1.55rem; }
  .prose h3 { font-size: 1.2rem; }
  .prose p { margin: 0 0 1.4em; }
  .prose a { color: var(--text); text-decoration: underline; text-underline-offset: 3px; }
  .prose a:hover { opacity: 0.7; }
  .prose strong { color: var(--text); font-weight: 600; }
  .prose ul,.prose ol { padding-left: 1.4em; margin: 0 0 1.4em; }
  .prose li { margin-bottom: 0.4em; }
  .prose blockquote {
    border-left: 3px solid var(--border2);
    padding-left: 1.2em; margin: 1.6em 0;
    color: var(--text3); font-style: italic;
  }
  .prose pre {
    background: var(--bg3); border: 1px solid var(--border);
    border-radius: 10px; padding: 18px 20px; overflow-x: auto;
    margin: 1.6em 0; font-family: ${T.mono}; font-size: 13.5px; line-height: 1.7;
  }
  .prose code {
    font-family: ${T.mono}; font-size: 0.88em;
    background: var(--bg3); border: 1px solid var(--border);
    border-radius: 5px; padding: 2px 6px; color: var(--text);
  }
  .prose pre code { background: none; border: none; padding: 0; font-size: inherit; }
  .prose hr { border: none; border-top: 1px solid var(--border); margin: 2.4em 0; }
  .prose img { max-width: 100%; border-radius: 10px; margin: 1.6em 0; }
`;

export default function BlogPostClient({ post }: { post: BlogPost }) {
  return (
    <div style={{ background: "var(--bg)", minHeight: "100vh", fontFamily: T.font }}>
      <style dangerouslySetInnerHTML={{ __html: PROSE_CSS }} />

      <div style={{ maxWidth: 720, margin: "0 auto", padding: "96px 44px 80px" }}>

        {/* Back */}
        <a href="/blog" style={{
          display: "inline-flex", alignItems: "center", gap: 6,
          fontSize: 13, color: "var(--text3)", textDecoration: "none",
          marginBottom: 40, fontFamily: T.font,
          transition: "color 0.15s",
        }}
          onMouseEnter={e => (e.currentTarget.style.color = "var(--text)")}
          onMouseLeave={e => (e.currentTarget.style.color = "var(--text3)")}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="15 18 9 12 15 6" />
          </svg>
          All posts
        </a>

        {/* Meta */}
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 20 }}>
          <span style={{
            fontSize: 11, fontWeight: 600, letterSpacing: "0.07em",
            textTransform: "uppercase" as const,
            color: "var(--text3)", background: "var(--bg3)",
            border: "1px solid var(--border)",
            borderRadius: T.pill, padding: "3px 10px", fontFamily: T.font,
          }}>{post.tag}</span>
          <span style={{ fontSize: 12, color: "var(--text3)", fontFamily: T.font }}>{post.readTime}</span>
        </div>

        {/* Title */}
        <h1 style={{
          fontSize: "clamp(28px, 4vw, 44px)", fontWeight: 300,
          letterSpacing: "-0.04em", lineHeight: 1.15,
          color: "var(--text)", marginBottom: 20, fontFamily: T.font,
        }}>{post.title}</h1>

        {/* Author row */}
        <div style={{
          display: "flex", alignItems: "center", gap: 10,
          paddingBottom: 32, marginBottom: 40,
          borderBottom: "1px solid var(--border)",
        }}>
          <div style={{
            width: 34, height: 34, borderRadius: "50%",
            background: "linear-gradient(135deg,#555,#222)",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 12, fontWeight: 600, color: "#fff", flexShrink: 0,
          }}>
            {post.author.split(" ").map(w => w[0]).join("").slice(0, 2)}
          </div>
          <div>
            <div style={{ fontSize: 13.5, fontWeight: 500, color: "var(--text)", fontFamily: T.font }}>{post.author}</div>
            <div style={{ fontSize: 12, color: "var(--text3)", fontFamily: T.font }}>
              {new Date(post.date).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}
            </div>
          </div>
        </div>

        {/* Content */}
        <div
          className="prose"
          dangerouslySetInnerHTML={{ __html: post.content }}
        />

        {/* Footer CTA */}
        <div style={{
          marginTop: 64, padding: "32px 28px",
          background: "var(--bg2)", border: "1px solid var(--border)",
          borderRadius: 14, textAlign: "center" as const,
        }}>
          <p style={{ fontSize: 15, color: "var(--text2)", marginBottom: 18, fontFamily: T.font }}>
            Ready to automate your data preprocessing?
          </p>
          <a href="/dashboard" style={{
            display: "inline-flex", alignItems: "center", gap: 8,
            background: "var(--text)", color: "var(--bg)",
            fontSize: 13.5, fontWeight: 500, borderRadius: T.pill, padding: "10px 22px",
            textDecoration: "none", fontFamily: T.font,
          }}>Start tracking free →</a>
        </div>
      </div>
    </div>
  );
}
