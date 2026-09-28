import type { Metadata, Viewport } from 'next';
import type { ReactNode } from 'react';
import { Inter } from 'next/font/google';
import { LensDefs } from '@/components/backdrop/LensDefs';
import { Providers } from '@/components/providers/Providers';
import 'lenis/dist/lenis.css';
import './globals.css';

const inter = Inter({ subsets: ['latin', 'latin-ext'], axes: ['opsz'], variable: '--font-sans', display: 'swap' });

export const metadata: Metadata = {
  metadataBase: new URL('https://mlhkrds.dev'),
  title: 'Melih Karadaş · Senior Software Engineer',
  description: 'Senior Software Engineer designing and building software across mobile, web and AI.',
  alternates: { canonical: '/' },
  openGraph: {
    type: 'website',
    url: '/',
    title: 'Melih Karadaş · Senior Software Engineer',
    description: 'Mobile, web and AI-assisted engineering.',
  },
};

export const viewport: Viewport = {
  themeColor: '#06070b',
  colorScheme: 'dark',
  viewportFit: 'cover',
};

// Runs before the first paint: data-js tells the stylesheet scripts will run, and the motion and glass
// preferences apply at once so reduced motion or tinted glass never flash. data-motion="reduce" means
// reduced motion is in effect, from the palette or from the system.
const preferencesScript = `document.documentElement.dataset.js='';try{var d=document.documentElement,p=JSON.parse(localStorage.getItem('mk-prefs')||'{}');if(p.motion==='reduce'||matchMedia('(prefers-reduced-motion: reduce)').matches)d.dataset.motion='reduce';if(p.glass==='tinted')d.dataset.glass='tinted'}catch(e){}`;

// Without JavaScript nothing would ever fade in, so reveals start visible.
const noScriptStyle = '[data-reveal]{opacity:1 !important;transform:none !important}';

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className={inter.variable} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: preferencesScript }} />
        <noscript>
          <style>{noScriptStyle}</style>
        </noscript>
      </head>
      <body>
        <LensDefs />
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
