import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Portfolio Risk Analyzer & Simulation Engine',
  description: 'AI-powered portfolio analytics platform for retail investors',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased min-h-screen flex flex-col">
        <header className="sticky top-0 z-50 w-full border-b border-white/10 glass-panel">
          <div className="container mx-auto px-4 h-16 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-indigo-500 flex items-center justify-center font-bold text-white shadow-[0_0_15px_rgba(99,102,241,0.5)]">
                PR
              </div>
              <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 to-cyan-400">
                Portfolio Risk Analyzer
              </h1>
            </div>
          </div>
        </header>
        <main className="flex-1 container mx-auto px-4 py-8">
          {children}
        </main>
        <footer className="py-6 border-t border-white/10 text-center text-sm text-zinc-500">
          <p>Simulation Engine v1.0 • Built for advanced quantitative insights.</p>
        </footer>
      </body>
    </html>
  );
}
