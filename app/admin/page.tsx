import type { Metadata } from 'next'
import AdminLayout from '@/components/admin/layout/AdminLayout'
import DashboardStats from '@/components/admin/dashboard/DashboardStats'
import QuickActions from '@/components/admin/dashboard/QuickActions'
import RecentActivity from '@/components/admin/dashboard/RecentActivity'

export const metadata: Metadata = {
  title: 'Dashboard'
}

export default function AdminDashboard() {
  return (
    <AdminLayout title="Dashboard">
      <div className="space-y-8">
        {/* Stats Overview */}
        <section>
          <DashboardStats />
        </section>

        {/* Quick Actions and Recent Activity */}
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
          <section>
            <QuickActions />
          </section>
          
          <section>
            <RecentActivity />
          </section>
        </div>

        {/* Analytics Charts - Placeholder for future implementation */}
        <section>
          <div className="bg-white shadow-sm rounded-lg p-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
              Analytics Overview
            </h3>
            <div className="h-64 bg-gray-50 rounded-lg flex items-center justify-center">
              <div className="text-center">
                <div className="text-gray-400 text-4xl mb-2">📊</div>
                <p className="text-gray-500">Analytics charts coming soon</p>
                <p className="text-sm text-gray-400 mt-1">
                  This will show visitor stats, popular content, and growth metrics
                </p>
              </div>
            </div>
          </div>
        </section>
      </div>
    </AdminLayout>
  )
}