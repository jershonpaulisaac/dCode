import './globals.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { ThemeProvider } from '@/lib/theme-context';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'CodeLens AI — Understand Any Codebase',
  description:
    'Upload your codebase and let IBM Bob, an enterprise AI agent, generate a deep-dive analysis of your project architecture, tech stack, security posture, and intent.',
  openGraph: {
    title: 'CodeLens AI — Understand Any Codebase',
    description:
      'Enterprise AI code intelligence. Upload a codebase and get an instant architecture analysis.',
    images: [{ url: 'https://bolt.new/static/og_default.png' }],
  },
  twitter: {
    card: 'summary_large_image',
    images: [{ url: 'https://bolt.new/static/og_default.png' }],
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <body className={`${inter.className} antialiased`}>
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  );
}
