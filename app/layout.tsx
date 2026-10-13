import './globals.css';
import type { Metadata, Viewport } from 'next';
import { Outfit } from 'next/font/google';

const outfit = Outfit({ subsets: ['latin', 'latin-ext'], variable: '--font-outfit', display: 'swap' });

export const metadata: Metadata = {
  title: 'Galaxy Buds4 Pro | Concept',
  description: 'Interactive 3D concept experience for Samsung Galaxy Buds4 Pro',
};

export const viewport: Viewport = { themeColor: '#030303' };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${outfit.variable} antialiased selection:bg-cyan-500/30`} suppressHydrationWarning>
      <body className="bg-[#030303] text-white" suppressHydrationWarning>
        {children}
      </body>
    </html>
  );
}
