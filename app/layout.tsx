import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Genial - Processo Seletivo',
  description: 'Sistema de processamento de dados',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="pt-BR">
      <body>{children}</body>
    </html>
  )
}
