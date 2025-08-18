import "./globals.css";
import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Team Tasks",
  description: "Authenticated DB tasks app (Supabase + Next.js)",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <header className="sticky top-0 z-10 backdrop-blur bg-slate-950/40 border-b border-slate-800">
          <nav className="mx-auto max-w-5xl flex items-center justify-between p-4">
            <Link href="/" className="font-semibold tracking-tight">
              Team Tasks
            </Link>
            <div className="text-sm opacity-75">DevOps Take</div>
          </nav>
        </header>
        <main className="mx-auto max-w-5xl p-4 min-h-[calc(100vh-64px)]">
          {children}
        </main>
        <footer className="mx-auto max-w-5xl p-6 text-xs text-slate-400">
          Built with Next.js + Supabase, RLS protected.
        </footer>
      </body>
    </html>
  );
}

