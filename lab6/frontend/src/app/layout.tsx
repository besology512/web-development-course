import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Link from "next/link";
import { LayoutDashboard, Radio, Home, Settings } from "lucide-react";
import ThemeToggle from "@/components/ThemeToggle";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "ClipSphere - Cinematic Video Platform",
  description: "Experience premium content with our Next.js powered platform.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  const theme = localStorage.getItem('theme') || 'dark';
                  if (theme === 'dark') {
                    document.documentElement.classList.add('dark');
                  } else {
                    document.documentElement.classList.remove('dark');
                  }
                } catch (e) {}
              })();
            `,
          }}
        />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen flex flex-col`}
      >
        <header className="glass-nav">
          <div className="container flex h-16 items-center mx-auto px-4">
            <div className="mr-8 flex items-center space-x-2">
              <Link href="/" className="flex items-center space-x-2 font-bold tracking-tight text-primary gold-glow">
                <LayoutDashboard className="h-6 w-6" />
                <span>ClipSphere</span>
              </Link>
            </div>
            <nav className="flex items-center space-x-6 text-sm font-medium">
              <Link href="/" className="transition-colors hover:text-primary">Home</Link>
              <Link href="/dashboard" className="transition-colors hover:text-primary">Dashboard</Link>
              <Link href="/sensors" className="transition-colors hover:text-primary">Sensors</Link>
            </nav>
            <div className="ml-auto flex items-center space-x-4">
               <ThemeToggle />
               <div className="h-9 w-9 rounded-full bg-secondary border border-glass-border overflow-hidden">
                 <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Felix" alt="User" />
               </div>
            </div>
          </div>
        </header>

        <main className="flex-1 flex flex-col pb-12">
          {children}
        </main>

        <footer className="border-t border-glass-border py-8 bg-card shadow-inner">
          <div className="container flex flex-col items-center justify-between gap-4 md:h-16 md:flex-row mx-auto px-4">
            <p className="text-center text-sm leading-loose text-muted-foreground md:text-left">
              &copy; 2026 ClipSphere. Premium Cinematic Experience.
            </p>
          </div>
        </footer>
      </body>
    </html>
  );
}
