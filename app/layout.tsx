import type { Metadata } from 'next'
import './globals.css'
import SiteHeader from '@/components/site-header'
import SiteFooter from '@/components/site-footer'

export const metadata: Metadata = {
  title: {
    default: 'BatchProof — Batch traceability your customers can verify',
    template: '%s | BatchProof',
  },
  description:
    'BatchProof helps businesses register products and production batches, share verifiable traceability history through QR codes, and anchor cryptographic batch fingerprints on Arbitrum Sepolia.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="flex min-h-screen flex-col">
        <SiteHeader />
        <main className="flex-1">{children}</main>
        <SiteFooter />
      </body>
    </html>
  )
}