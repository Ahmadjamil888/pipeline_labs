import type { Metadata } from "next";
import "./globals.css";
import { ThemeProvider } from "./theme-provider";
import { Geist } from "next/font/google";
import { cn } from "@/lib/utils";

const geist = Geist({subsets:['latin'],variable:'--font-sans'});

const SITE_URL = "https://pipeline-labs.vercel.app";
const SITE_NAME = "Pipeline AI";
const TITLE = "Pipeline AI — One-Click Zero-Config AI Infrastructure";
const DESCRIPTION =
  "Train, fine-tune and deploy machine learning models with zero boilerplate. Pipeline gives engineers a single SDK to provision GPUs, run distributed training jobs, register models, and serve serverless endpoints — all in one call.";
const KEYWORDS =
  "AI infrastructure, ML platform, distributed training, model deployment, serverless inference, GPU cloud, fine-tuning, pipeline SDK, machine learning ops, MLOps, LLM training, model registry, AI SDK";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: TITLE,
    template: `%s | ${SITE_NAME}`,
  },
  description: DESCRIPTION,
  keywords: KEYWORDS,
  authors: [{ name: "Pipeline AI" }],
  creator: "Pipeline AI",
  publisher: "Pipeline AI",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: SITE_URL,
    siteName: SITE_NAME,
    title: TITLE,
    description: DESCRIPTION,
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Pipeline AI — Zero-Config AI Infrastructure",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: TITLE,
    description: DESCRIPTION,
    images: ["/og-image.png"],
    creator: "@pipeline_ai",
    site: "@pipeline_ai",
  },
  alternates: {
    canonical: SITE_URL,
  },
  category: "technology",
};

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
      name: "pipeline_labs SDK",
      applicationCategory: "DeveloperApplication",
      operatingSystem: "Linux, macOS, Windows",
      url: SITE_URL,
      description:
        "A Python SDK for zero-config distributed AI training, model registry, and serverless inference deployment.",
      offers: [
        { "@type": "Offer", price: "0", priceCurrency: "USD", name: "Researcher" },
        { "@type": "Offer", price: "49", priceCurrency: "USD", name: "Startup" },
        { "@type": "Offer", price: "999", priceCurrency: "USD", name: "Enterprise" },
      ],
    },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={cn("font-sans", geist.variable)}>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className="antialiased">
        <ThemeProvider>
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
