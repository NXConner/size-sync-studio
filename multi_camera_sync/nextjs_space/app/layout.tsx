import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { ThemeProvider } from '@/components/theme-provider';
import { Toaster } from '@/components/ui/sonner';

const inter = Inter({ subsets: ['latin'] });

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXTAUTH_URL ?? 'http://localhost:3000'),
  title: 'Multi-Camera Sync Studio',
  description:
    'Connect up to 4 cameras over your local network for synchronized recording and multi-angle playback. Professional multi-camera video production made simple.',
  keywords: [
    'multi-camera',
    'video recording',
    'synchronized recording',
    'camera sync',
    'multi-angle video',
    'video production',
    'live streaming',
    'WebRTC',
  ],
  authors: [{ name: 'Multi-Camera Sync Studio' }],
  icons: {
    icon: '/favicon.svg',
    shortcut: '/favicon.svg',
  },
  openGraph: {
    type: 'website',
    title: 'Multi-Camera Sync Studio',
    description:
      'Connect up to 4 cameras over your local network for synchronized recording and multi-angle playback.',
    images: ['/og-image.png'],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Multi-Camera Sync Studio',
    description:
      'Connect up to 4 cameras over your local network for synchronized recording and multi-angle playback.',
    images: ['/og-image.png'],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className} suppressHydrationWarning>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          {children}
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}
