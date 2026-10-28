import type { Metadata, Viewport } from "next";
import { Big_Shoulders, Big_Shoulders_Stencil, Martian_Mono, Schibsted_Grotesk } from "next/font/google";
import { DemoBar } from "@/components/demo-bar";
import { ToastProvider } from "@/components/toast";
import "./globals.css";

const shoulders = Big_Shoulders({ subsets: ["latin"], variable: "--font-shoulders", display: "swap" });
const stencil = Big_Shoulders_Stencil({ subsets: ["latin"], weight: ["800"], variable: "--font-bss", display: "swap" });
const schibsted = Schibsted_Grotesk({ subsets: ["latin"], variable: "--font-schibsted", display: "swap" });
const martian = Martian_Mono({ subsets: ["latin"], weight: ["400", "500"], variable: "--font-martian", display: "swap" });

export const metadata: Metadata = {
  title: { default: "Larkspur Workspace", template: "%s · Larkspur" },
  description: "Book meeting rooms, studios and desks, manage your membership, and get support in one account.",
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#e6e3dc" },
    { media: "(prefers-color-scheme: dark)", color: "#131311" },
  ],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${shoulders.variable} ${stencil.variable} ${schibsted.variable} ${martian.variable}`}>
      <body className="min-h-screen">
        <ToastProvider>
          <DemoBar />
          {children}
        </ToastProvider>
      </body>
    </html>
  );
}
