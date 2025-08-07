import type { Metadata } from 'next'
import Link from 'next/link'
import { FolderPlusIcon } from '@heroicons/react/24/outline'
import AdminLayout from '@/components/admin/layout/AdminLayout'
import CategoryList from '@/components/admin/categories/CategoryList'
import { BreadcrumbItem } from '@/components/admin/layout/AdminBreadcrumb'

export const metadata: Metadata = {
  title: 'Categories'
}

export default function CategoriesPage() {
  const breadcrumb: BreadcrumbItem[] = [
    { name: 'Categories', current: true }
  ]

  const actions = (
    <div className="flex space-x-3">
      <Link
        href="/admin/categories/new"
        className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
      >
        <FolderPlusIcon className="-ml-1 mr-2 h-5 w-5" aria-hidden="true" />
        New Category
      </Link>
    </div>
  )

  return (
    <AdminLayout 
      title="Categories" 
      breadcrumb={breadcrumb}
      actions={actions}
    >
      <div className="space-y-6">
        {/* Category filters */}
        <div className="bg-white shadow-sm rounded-lg p-4">
          <div className="flex flex-wrap items-center gap-4">
            <select className="rounded-md border-gray-300 text-sm">
              <option value="">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
            
            <select className="rounded-md border-gray-300 text-sm">
              <option value="">All Types</option>
              <option value="featured">Featured</option>
              <option value="regular">Regular</option>
            </select>
            
            <select className="rounded-md border-gray-300 text-sm">
              <option value="">Sort by</option>
              <option value="name">Name A-Z</option>
              <option value="-name">Name Z-A</option>
              <option value="posts">Most Posts</option>
              <option value="views">Most Views</option>
              <option value="-created">Newest First</option>
            </select>
            
            <input
              type="search"
              placeholder="Search categories..."
              className="flex-1 max-w-sm rounded-md border-gray-300 text-sm"
            />
          </div>
        </div>

        {/* Categories table */}
        <CategoryList />

        {/* Category organization tips */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h4 className="text-lg font-medium text-blue-900 mb-4">
            📁 Category Organization Tips
          </h4>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <h5 className="font-medium text-blue-800 mb-2">Best Practices</h5>
              <ul className="text-sm text-blue-700 space-y-1">
                <li>• Keep category names clear and descriptive</li>
                <li>• Use 5-12 categories for optimal navigation</li>
                <li>• Choose distinct colors for visual recognition</li>
                <li>• Write compelling descriptions for SEO</li>
              </ul>
            </div>
            <div>
              <h5 className="font-medium text-blue-800 mb-2">Organization</h5>
              <ul className="text-sm text-blue-700 space-y-1">
                <li>• Use sort order to control navigation display</li>
                <li>• Feature important categories on homepage</li>
                <li>• Regularly review and merge similar categories</li>
                <li>• Archive unused categories instead of deleting</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  )
}