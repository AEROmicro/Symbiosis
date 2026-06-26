import type { Metadata } from 'next'
import localFont from 'next/font/local'
import { Analytics } from '@vercel/analytics/next'

import 'react-grid-layout/css/styles.css'
import 'react-resizable/css/styles.css'
import './globals.css'

// 1. Local Fira Code configuration
const firaCode = localFont({
  src: './fonts/FiraCode-VariableFont_wght.woff2',
  variable: '--font-sans'
})

// 2. New Local JetBrains Mono configuration (Offline Safe)
const jetbrainsMono = localFont({
  src: './fonts/JetBrainsMono-VariableFont_wght.woff2',
  variable: '--font-mono'
})

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
      <body className={`${jetbrainsMono.variable} ${firaCode.variable} font-mono antialiased`}>
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
