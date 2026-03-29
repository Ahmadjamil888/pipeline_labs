"use client";

import type { Metadata } from "next";
import "./globals.css";
import { ClerkProvider } from "@clerk/nextjs";
import { Geist } from "next/font/google";
import { cn } from "@/lib/utils";
import { useEffect, useState } from "react";
import { useAuth } from "@clerk/nextjs";
import { SignInButton, UserButton } from "@clerk/nextjs";
import { ThemeProvider, useTheme } from "./theme-provider";
import { usePathname } from "next/navigation";

const geist = Geist({ subsets: ['latin'], variable: '--font-sans' });

const SITE_URL = "https://pipeline-labs.vercel.app";
const SITE_NAME = "Pipeline AI";
const TITLE = "Pipeline AI — AI-Powered ML Data Preprocessing";
const DESCRIPTION =
  "Transform raw data into ML-ready datasets with AI-powered preprocessing. Natural language instructions, automatic transformations, and instant downloads.";
const KEYWORDS =
  "AI data preprocessing, ML data preparation, data cleaning, feature engineering, machine learning pipeline, data transformation, CSV preprocessing, Excel cleaning, dataset preparation";

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      "@id": `${SITE_URL}/#organization`,
      name: SITE_NAME,
      url: SITE_URL,
      logo: {
        "@type": "ImageObject",
        url: `${SITE_URL}/logo-dark.png`,
      },
      description: DESCRIPTION,
      foundingDate: "2026",
      sameAs: [
        "https://github.com/pipeline-ai",
        "https://twitter.com/pipeline_ai",
      ],
    },
    {
      "@type": "WebSite",
      "@id": `${SITE_URL}/#website`,
      url: SITE_URL,
      name: SITE_NAME,
      description: DESCRIPTION,
      publisher: { "@id": `${SITE_URL}/#organization` },
      potentialAction: {
        "@type": "SearchAction",
        target: { "@type": "EntryPoint", urlTemplate: `${SITE_URL}/docs?q={search_term_string}` },
        "query-input": "required name=search_term_string",
      },
    },
    {
      "@type": "SoftwareApplication",
      "@id": `${SITE_URL}/#product`,
      name: "Pipeline AI",
      applicationCategory: "DataPreparationApplication",
      operatingSystem: "Linux, macOS, Windows",
      url: SITE_URL,
      description:
        "AI-powered data preprocessing platform for machine learning workflows.",
      offers: [
        { "@type": "Offer", price: "0", priceCurrency: "USD", name: "Free" },
        { "@type": "Offer", price: "29", priceCurrency: "USD", name: "Pro" },
        { "@type": "Offer", price: "109", priceCurrency: "USD", name: "Team" },
      ],
    },
  ],
};

interface Theme {
  font: string;
  pill: string;
}

const T: Theme = {
  font: "var(--font-sans)",
  pill: "20px",
};

function Logo({ theme, height = 28 }: { theme: "light" | "dark"; height?: number }) {
  const src = theme === "dark" ? "/logo-dark.png" : "/logo-light.png";
  return (
    <img
      src={src}
      alt="Pipeline Labs"
      style={{ height, objectFit: "contain", display: "block" }}
    />
  );
}

function Nav({ theme, onToggle }: { theme: "light" | "dark"; onToggle: () => void }) {
  const [scrolled, setScrolled] = useState(false);
  const { isSignedIn } = useAuth();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 8);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navLinks = [
    { label: "Product", href: "#product" },
    { label: "How it works", href: "#how-it-works" },
    { label: "Pricing", href: "#pricing" },
    { label: "Documentation", href: "https://pipeline.stldocs.app" },
  ];

  return (
    <nav
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        zIndex: 200,
        height: 56,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "0 36px",
        background: "var(--nav-bg)",
        backdropFilter: "blur(20px)",
        WebkitBackdropFilter: "blur(20px)",
        borderBottom: `1px solid ${scrolled ? "var(--border2)" : "var(--border)"}`,
        transition: "border-color 0.2s",
        fontFamily: T.font,
      }}
    >
      {/* Logo */}
      <a
        href="/"
        style={{
          display: "flex",
          alignItems: "center",
          gap: 8,
          textDecoration: "none",
        }}
      >
        <Logo theme={theme} height={28} />
      </a>

      {/* Center links */}
      <ul
        style={{
          position: "absolute",
          left: "50%",
          transform: "translateX(-50%)",
          display: "flex",
          gap: 30,
          listStyle: "none",
          fontFamily: T.font,
        }}
      >
        {navLinks.map((l) => (
          <li key={l.label}>
            <a
              href={l.href}
              target={l.href.startsWith("http") ? "_blank" : undefined}
              rel={l.href.startsWith("http") ? "noopener noreferrer" : undefined}
              style={{
                fontSize: 13.5,
                fontWeight: 400,
                color: "var(--text2)",
                textDecoration: "none",
                letterSpacing: "-0.01em",
                transition: "color 0.15s",
                cursor: "pointer",
              }}
              onMouseEnter={(e) =>
                ((e.currentTarget as HTMLAnchorElement).style.color = "var(--text)")
              }
              onMouseLeave={(e) =>
                ((e.currentTarget as HTMLAnchorElement).style.color = "var(--text2)")
              }
            >
              {l.label}
            </a>
          </li>
        ))}
      </ul>

      {/* Right side - Actions */}
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        {/* Theme toggle */}
        <button
          onClick={onToggle}
          aria-label="Toggle theme"
          style={{
            width: 34,
            height: 34,
            borderRadius: "50%",
            background: "transparent",
            border: "1px solid var(--border2)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
            color: "var(--text2)",
            transition: "background 0.2s",
          }}
          onMouseEnter={(e) =>
            ((e.currentTarget as HTMLButtonElement).style.background =
              "var(--bg3)")
          }
          onMouseLeave={(e) =>
            ((e.currentTarget as HTMLButtonElement).style.background =
              "transparent")
          }
        >
          {theme === "dark" ? (
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
            >
              <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
            </svg>
          ) : (
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
            >
              <circle cx="12" cy="12" r="5" />
              <line x1="12" y1="1" x2="12" y2="3" />
              <line x1="12" y1="21" x2="12" y2="23" />
              <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
              <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
              <line x1="1" y1="12" x2="3" y2="12" />
              <line x1="21" y1="12" x2="23" y2="12" />
              <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
              <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
            </svg>
          )}
        </button>

        {/* Contact sales link */}
        <a
          href="/contact"
          style={{
            fontSize: 13,
            fontWeight: 500,
            color: "var(--text)",
            background: "transparent",
            border: "1px solid var(--border2)",
            borderRadius: T.pill,
            padding: "6px 16px",
            cursor: "pointer",
            fontFamily: T.font,
            transition: "background 0.15s",
            textDecoration: "none",
          }}
          onMouseEnter={(e) =>
            ((e.currentTarget as HTMLAnchorElement).style.background =
              "var(--bg3)")
          }
          onMouseLeave={(e) =>
            ((e.currentTarget as HTMLAnchorElement).style.background =
              "transparent")
          }
        >
          Contact sales
        </a>

        {/* Auth section */}
        {isSignedIn ? (
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <a
              href="/dashboard"
              style={{
                fontSize: 13,
                fontWeight: 500,
                color: "var(--bg)",
                background: "var(--text)",
                border: "none",
                borderRadius: T.pill,
                padding: "7px 20px",
                cursor: "pointer",
                fontFamily: T.font,
                transition: "opacity 0.15s",
                textDecoration: "none",
              }}
              onMouseEnter={(e) =>
                ((e.currentTarget as HTMLAnchorElement).style.opacity = "0.78")
              }
              onMouseLeave={(e) =>
                ((e.currentTarget as HTMLAnchorElement).style.opacity = "1")
              }
            >
              Dashboard
            </a>
            <UserButton />
          </div>
        ) : (
          <SignInButton mode="modal">
            <button
              style={{
                fontSize: 13,
                fontWeight: 500,
                color: "var(--bg)",
                background: "var(--text)",
                border: "none",
                borderRadius: T.pill,
                padding: "7px 20px",
                cursor: "pointer",
                fontFamily: T.font,
                transition: "opacity 0.15s",
              }}
              onMouseEnter={(e) =>
                ((e.currentTarget as HTMLButtonElement).style.opacity = "0.78")
              }
              onMouseLeave={(e) =>
                ((e.currentTarget as HTMLButtonElement).style.opacity = "1")
              }
            >
              Get started
            </button>
          </SignInButton>
        )}
      </div>
    </nav>
  );
}

function Header() {
  const { theme, toggleTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    setMounted(true);
  }, []);

  // Don't show header on dashboard routes
  if (!mounted || pathname?.startsWith('/dashboard')) {
    return null;
  }

  return <Nav theme={theme} onToggle={toggleTheme} />;
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <html lang="en" className={cn("font-sans", geist.variable)}>
        <head>
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
          />
        </head>
        <body className="antialiased">
          <ThemeProvider>
            <Header />
            {children}
          </ThemeProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}