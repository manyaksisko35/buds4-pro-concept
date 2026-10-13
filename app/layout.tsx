import './globals.css';
import type { Metadata, Viewport } from 'next';
import { Outfit } from 'next/font/google';

const outfit = Outfit({ subsets: ['latin', 'latin-ext'], variable: '--font-outfit', display: 'swap' });

const siteUrl = process.env.VERCEL_PROJECT_PRODUCTION_URL
  ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
  : 'http://localhost:3000';

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: 'Galaxy Buds4 Pro | Concept',
  description: 'Open the case, hear the ANC and 360 Audio: an interactive 3D concept site for Galaxy Buds4 Pro.',
  openGraph: { title: 'Galaxy Buds4 Pro | Concept', description: 'Open the case, hear the ANC and 360 Audio: an interactive 3D concept site for Galaxy Buds4 Pro.', type: 'website' },
  twitter: { card: 'summary_large_image', title: 'Galaxy Buds4 Pro | Concept', description: 'Open the case, hear the ANC and 360 Audio: an interactive 3D concept site for Galaxy Buds4 Pro.' },
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
