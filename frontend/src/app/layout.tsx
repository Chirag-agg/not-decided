import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

import { GraphProvider } from "@/components/graph/GraphContext";

export const metadata: Metadata = {
  title: "IndustriAI | Knowledge Brain",
  description: "AI-powered Industrial Knowledge Intelligence platform",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.className} bg-background text-foreground`}>
        <GraphProvider>
          {children}
        </GraphProvider>
      </body>
    </html>
  );
}
