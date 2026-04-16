import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import SWRegister from '@/components/sw-register'

const inter = Inter({
  subsets: ['latin', 'cyrillic'],
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'Training Tracker',
  description: 'Оффлайн-трекер тренировок',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="ru">
      <body className={`${inter.className} bg-white text-slate-900 antialiased`}>
        <SWRegister />
        {children}
      </body>
    </html>
  )
}