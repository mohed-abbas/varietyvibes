import type { Metadata } from 'next'
import { AuthProvider } from '@/hooks/useAuth'

export const metadata: Metadata = {
  title: {
    default: 'Admin Dashboard',
    template: '%s | Variety Vibes Admin'
  },
  description: 'Admin panel for managing Variety Vibes blog content',
  robots: {
    index: false,
    follow: false
  }
}

export default function AdminRootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <AuthProvider>
      {children}
    </AuthProvider>
  )
}