import type { Metadata } from 'next'
import { Analytics } from '@vercel/analytics/next'

import 'react-grid-layout/css/styles.css'
import 'react-resizable/css/styles.css'
import './globals.css' // We will declare the fonts inside here instead!

export const metadata: Metadata = {
  title: 'Symbiosis | Terminal Stock Tracker',
  description: 'Real-time stock tracking with a terminal interface',
  generator: 'v0.app',
  manifest: '/manifest.json',
  icons: {
    icon: '/icon.png',
    apple: '/apple-icon.png',
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className="dark">
      {/* We apply the CSS variables manually matching your font utilities */}
      <body className="--font-mono --font-sans font-mono antialiased">
        {children}
        <Analytics />
        <script
          dangerouslySetInnerHTML={{
            __html: `if ('serviceWorker' in navigator) { window.addEventListener('load', function() { navigator.serviceWorker.register('/sw.js'); }); }`,
          }}
        />
      </body>
    </html>
  )
}
