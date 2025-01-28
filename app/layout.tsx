import './global.css'
import type { Metadata } from 'next'
import { GeistSans } from 'geist/font/sans'
import { GeistMono } from 'geist/font/mono'
import { Navbar } from './components/nav'
import { Analytics } from '@vercel/analytics/react'
import { SpeedInsights } from '@vercel/speed-insights/next'
import Footer from './components/footer'
import { baseUrl } from './sitemap'
import { ThemeProvider } from './providers/theme-provider'

/**
 * Default metadata configuration for the entire application
 * Provides SEO and OpenGraph settings used across all pages
 * 
 * Includes:
 * - Base title and title template
 * - Site description
 * - OpenGraph metadata
 * - Robot crawling instructions
 */
export const metadata: Metadata = {
  metadataBase: new URL(baseUrl),
  title: {
    default: 'Renjith Abraham',
    template: '%s | Renjith Abraham',
  },
  description: 'Renjith Abraham\'s Portfolio.',
  icons: {
    icon: '/favicon.ico',
  },
  openGraph: {
    title: 'Renjith Abraham',
    description: 'Renjith Abraham\'s Portfolio.',
    url: baseUrl,
    siteName: 'Renjith Abraham',
    locale: 'en_US',
    type: 'website',
    images: [{
      url: '/images/og-r.png',
      width: 400,
      height: 400,
      alt: 'Renjith Abraham\'s Portfolio'
    }]
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
}

/**
 * Utility function to conditionally join CSS classes
 * Filters out falsy values and joins with spaces
 * 
 * @param classes - Array of class names or falsy values
 * @returns String of joined class names
 */
const cx = (...classes) => classes.filter(Boolean).join(' ')

/**
 * Root Layout Component
 * Provides the base structure for all pages
 * 
 * Features:
 * - Custom fonts (Geist Sans and Mono)
 * - Dark mode support
 * - Analytics integration
 * - Speed insights
 * - Responsive navigation
 * - Consistent footer
 * 
 * @param children - Page content to be rendered
 * @returns Root layout structure
 */
export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html
      lang="en"
      className={cx(
        GeistSans.variable,
        GeistMono.variable
      )}
    >
      <body className="antialiased">
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <div className="max-w-xl mx-4 mt-8 lg:mx-auto">
            <main className="flex-auto min-w-0 mt-6 flex flex-col px-2 md:px-0">
              <Navbar />
              {children}
              <Footer />
              <Analytics />
              <SpeedInsights />
            </main>
          </div>
        </ThemeProvider>
      </body>
    </html>
  )
}
