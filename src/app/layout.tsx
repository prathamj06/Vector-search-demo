import type { Metadata, Viewport } from "next";
import { Inter, Geist_Mono } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Vector vs. Keyword Search — Interactive Learning",
  description:
    "An interactive educational tool to visually understand the differences between Traditional Keyword (Lexical) Search and Modern Vector (Semantic) Search. Built for AI workshops.",
  keywords: ["vector search", "keyword search", "semantic search", "AI education", "embeddings"],
  authors: [{ name: "Vector Search Demo" }],
};

export const viewport: Viewport = {
  themeColor: "#2563EB",
  colorScheme: "light",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${geistMono.variable} h-full antialiased`}
      style={{ colorScheme: "light" }}
    >
      <head>
        <meta name="color-scheme" content="light" />
      </head>
      <body className="min-h-full flex flex-col bg-[#F9FAFB] text-[#111827]">
        {children}
      </body>
    </html>
  );
}
