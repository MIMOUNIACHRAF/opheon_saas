import type { Metadata } from 'next'
import { Playfair_Display, DM_Sans, Cormorant_Garamond } from 'next/font/google'
import { Toaster } from 'sonner'
import './globals.css'

const playfair = Playfair_Display({
  subsets: ['latin'],
  variable: '--font-playfair',
  display: 'swap',
})

const dmSans = DM_Sans({
  subsets: ['latin'],
  variable: '--font-dm-sans',
  display: 'swap',
})

const cormorant = Cormorant_Garamond({
  subsets: ['latin'],
  weight: ['400', '600'],
  style: ['normal', 'italic'],
  variable: '--font-cormorant',
  display: 'swap',
})

export const metadata: Metadata = {
  title: { default: 'Opheon SaaS', template: '%s | Opheon' },
  description: "La plateforme SaaS pour les restaurants d'exception",
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="fr"
      className={`${playfair.variable} ${dmSans.variable} ${cormorant.variable} h-full`}
    >
      <body className="font-body antialiased min-h-full">
        {children}
        <Toaster
          position="top-right"
          toastOptions={{
            style: {
              background: '#2C1F17',
              border: '1px solid rgba(201,168,76,0.3)',
              color: '#F5EDD8',
            },
          }}
        />
      </body>
    </html>
  )
}
