import type { Metadata } from 'next'
import Link from 'next/link'
import { CloudArrowUpIcon } from '@heroicons/react/24/outline'
import AdminLayout from '@/components/admin/layout/AdminLayout'
import MediaGrid from '@/components/admin/media/MediaGrid'
import { BreadcrumbItem } from '@/components/admin/layout/AdminBreadcrumb'

export const metadata: Metadata = {
  title: 'Media Library'
}

export default function MediaLibraryPage() {
  const breadcrumb: BreadcrumbItem[] = [
    { name: 'Media Library', current: true }
  ]

  const actions = (
    <div className="flex space-x-3">
      <Link
        href="/admin/media/upload"
        className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
      >
        <CloudArrowUpIcon className="-ml-1 mr-2 h-5 w-5" aria-hidden="true" />
        Upload Files
      </Link>
    </div>
  )

  return (
    <AdminLayout 
      title="Media Library" 
      breadcrumb={breadcrumb}
      actions={actions}
    >
      <div className="space-y-6">
        {/* Media filters and search */}
        <div className="bg-white shadow-sm rounded-lg p-4">
          <div className="flex flex-wrap items-center gap-4">
            <select className="rounded-md border-gray-300 text-sm">
              <option value="">All Types</option>
              <option value="image">Images</option>
              <option value="video">Videos</option>
              <option value="document">Documents</option>
            </select>
            
            <select className="rounded-md border-gray-300 text-sm">
              <option value="">All Users</option>
              <option value="user1">John Doe</option>
              <option value="user2">Jane Smith</option>
            </select>
            
            <select className="rounded-md border-gray-300 text-sm">
              <option value="">Upload Date</option>
              <option value="today">Today</option>
              <option value="week">This Week</option>
              <option value="month">This Month</option>
            </select>
            
            <input
              type="search"
              placeholder="Search media files..."
              className="flex-1 max-w-sm rounded-md border-gray-300 text-sm"
            />
          </div>
        </div>

        {/* Media grid */}
        <MediaGrid />

        {/* Usage statistics */}
        <div className="bg-white shadow-sm rounded-lg p-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
            Storage Usage
          </h3>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">156</div>
              <div className="text-sm text-gray-500">Total Files</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">2.4 GB</div>
              <div className="text-sm text-gray-500">Storage Used</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">89%</div>
              <div className="text-sm text-gray-500">Files In Use</div>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  )
}