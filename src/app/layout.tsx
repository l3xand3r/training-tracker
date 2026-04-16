import type { Metadata } from 'next'
import './globals.css'
import SWRegister from '@/components/sw-register'

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
      <body>
        <SWRegister />
        {children}
      </body>
    </html>
  )
}