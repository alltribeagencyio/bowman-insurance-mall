import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Providers } from './providers'
import { Navbar } from '@/components/layout/navbar'
import { Footer } from '@/components/layout/footer'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Bowman Insurance - Your Trusted Insurance Partner',
  description: 'Browse, compare, and purchase insurance policies from top providers in Kenya',
  keywords: 'insurance, Kenya, motor insurance, health insurance, life insurance',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <Providers>
          <div className="flex min-h-screen flex-col">
            <Navbar />
            <main className="flex-1 px-4 py-6 md:px-6 md:py-8 lg:px-8">{children}</main>
            <Footer />
          </div>
        </Providers>
      </body>
    </html>
  )
}
