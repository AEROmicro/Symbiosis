import type { Metadata } from 'next'
import { JetBrains_Mono, Fira_Code } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import './globals.css'

const jetbrainsMono = JetBrains_Mono({ 
  subsets: ["latin"],
  variable: '--font-mono'
});

const firaCode = Fira_Code({ 
  subsets: ["latin"],
  variable: '--font-sans'
});

export const metadata: Metadata = {
  title: 'Symbiosis | Terminal Stock Tracker',
  description: 'Real-time stock tracking with a terminal interface',
  generator: 'v0.app',
  manifest: '/manifest.json',
  icons: {
    icon: '/icon.png',
    apple: '/apple-icon.png',
  },
  themeColor: '#00ff41',
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
