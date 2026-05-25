import './globals.css'

export const metadata = {
  title: 'FitTrack TSI - Gui',
  description: 'Sistema de Calorias e Jejum',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="pt-br">
      <body className="bg-slate-50 text-slate-900">{children}</body>
    </html>
  )
}