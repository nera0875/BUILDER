import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Builder Dashboard',
  description: 'Manage and preview your projects',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{
          __html: `
            try {
              localStorage.removeItem('theme');
              document.documentElement.classList.remove('dark');
            } catch (e) {}
          `
        }} />
      </head>
      <body className="antialiased">
        {children}
      </body>
    </html>
  )
}
