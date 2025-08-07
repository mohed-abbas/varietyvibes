'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { toast, Toaster } from 'react-hot-toast'
import AdminSidebar from './AdminSidebar'
import AdminHeader from './AdminHeader'
import AdminBreadcrumb, { BreadcrumbItem } from './AdminBreadcrumb'
import { useAuth } from '@/hooks/useAuth'

interface AdminLayoutProps {
  children: React.ReactNode
  title?: string
  actions?: React.ReactNode
  breadcrumb?: BreadcrumbItem[]
  maxWidth?: 'full' | '7xl' | '6xl' | '5xl' | '4xl'
}

export default function AdminLayout({ 
  children, 
  title, 
  actions, 
  breadcrumb,
  maxWidth = '7xl'
}: AdminLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const { user, loading } = useAuth()
  const router = useRouter()

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!loading && !user) {
      router.push('/admin/login')
    }
  }, [user, loading, router])

  // Show loading state while checking authentication
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  // Don't render if not authenticated
  if (!user) {
    return null
  }

  const maxWidthClasses = {
    full: 'max-w-full',
    '7xl': 'max-w-7xl',
    '6xl': 'max-w-6xl',
    '5xl': 'max-w-5xl',
    '4xl': 'max-w-4xl'
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <AdminSidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

      <div className="xl:pl-72">
        <AdminHeader 
          setSidebarOpen={setSidebarOpen} 
          title={title}
          actions={actions}
        />

        <main className="py-6">
          <div className={`mx-auto ${maxWidthClasses[maxWidth]} px-4 sm:px-6 lg:px-8`}>
            {/* Breadcrumb */}
            {breadcrumb && breadcrumb.length > 0 && (
              <div className="mb-6">
                <AdminBreadcrumb pages={breadcrumb} />
              </div>
            )}

            {/* Page title & actions */}
            {(title || actions) && (
              <div className="mb-8">
                <div className="md:flex md:items-center md:justify-between">
                  <div className="min-w-0 flex-1">
                    {title && (
                      <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:truncate sm:text-3xl sm:tracking-tight">
                        {title}
                      </h2>
                    )}
                  </div>
                  {actions && (
                    <div className="mt-4 flex md:ml-4 md:mt-0">
                      {actions}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Page content */}
            {children}
          </div>
        </main>
      </div>

      {/* Toast notifications */}
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: '#363636',
            color: '#fff',
          },
          success: {
            duration: 3000,
            iconTheme: {
              primary: '#10b981',
              secondary: '#fff',
            },
          },
          error: {
            duration: 5000,
            iconTheme: {
              primary: '#ef4444',
              secondary: '#fff',
            },
          },
        }}
      />
    </div>
  )
}