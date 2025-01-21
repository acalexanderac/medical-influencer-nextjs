import './globals.css'
import { Inter } from 'next/font/google'

const inter = Inter({ subsets: ['latin'] })

export const metadata = {
  title: 'Health Claims Dashboard',
  description: 'Monitor and analyze health influencer claims',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={inter.className}>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              if (localStorage.getItem('darkMode') === 'true' || 
                  (!localStorage.getItem('darkMode') && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
                document.documentElement.classList.add('dark')
              }
            `,
          }}
        />
      </head>
      <body className="min-h-screen bg-gray-50 antialiased">
        <main className="min-h-screen">
          {children}
        </main>
      </body>
    </html>
  )
} 