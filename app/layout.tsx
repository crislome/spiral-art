import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Spiral Art',
  description: 'Crie sua própria Spiral Halftone Art',
  viewport: 'width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <body className="h-full overflow-hidden" style={{ background: 'var(--bg)', color: 'var(--text)' }}>
        {children}
      </body>
    </html>
  )
}
