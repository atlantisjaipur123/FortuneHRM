import type { Metadata } from 'next'
import { GeistSans } from 'geist/font/sans'
import { GeistMono } from 'geist/font/mono'
import './globals.css'
import { Providers } from './providers'
// import { Providers } from '@/redux/provider'

export const metadata: Metadata = {
  title: 'HRPro - HR Management System',
  description: 'Comprehensive HR management platform for modern businesses',
  generator: 'Next.js',
}

// Force dynamic rendering to avoid static pre-render issues with client context
export const dynamic = 'force-dynamic'

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={`font-sans ${GeistSans.variable} ${GeistMono.variable}`}>
        <Providers>
            {children}
        </Providers>
      </body>
    </html>
  )
}
