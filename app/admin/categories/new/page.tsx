'use client'

import { ArrowLeftIcon } from '@heroicons/react/24/outline'
import Link from 'next/link'
import AdminLayout from '@/components/admin/layout/AdminLayout'
import CategoryForm from '@/components/admin/categories/CategoryForm'
import { BreadcrumbItem } from '@/components/admin/layout/AdminBreadcrumb'

export default function NewCategoryPage() {
  const breadcrumb: BreadcrumbItem[] = [
    { name: 'Categories', href: '/admin/categories' },
    { name: 'New Category', current: true }
  ]

  const actions = (
    <div className="flex space-x-3">
      <Link
        href="/admin/categories"
        className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
      >
        <ArrowLeftIcon className="-ml-1 mr-2 h-5 w-5" aria-hidden="true" />
        Back to Categories
      </Link>
    </div>
  )

  return (
    <AdminLayout 
      title="Create New Category" 
      breadcrumb={breadcrumb}
      actions={actions}
    >
      <div className="space-y-6">
        {/* Form Card */}
        <div className="bg-white shadow-sm rounded-lg">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">Category Information</h3>
            <p className="mt-1 text-sm text-gray-500">
              Create a new category to organize your blog posts effectively.
            </p>
          </div>
          
          <div className="p-6">
            <CategoryForm 
              mode="create"
              onSuccess={(category) => {
                console.log('Category created:', category)
              }}
              onCancel={() => {
                console.log('Category creation cancelled')
              }}
            />
          </div>
        </div>

        {/* Category Guidelines */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h4 className="text-lg font-medium text-blue-900 mb-4">
            📁 Category Guidelines
          </h4>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <h5 className="font-medium text-blue-800 mb-2">Best Practices</h5>
              <ul className="text-sm text-blue-700 space-y-1">
                <li>• Keep category names clear and descriptive</li>
                <li>• Use 5-12 categories for optimal navigation</li>
                <li>• Choose distinct colors for visual recognition</li>
                <li>• Write compelling descriptions for SEO</li>
                <li>• Select meaningful icons or emojis</li>
              </ul>
            </div>
            <div>
              <h5 className="font-medium text-blue-800 mb-2">Organization Tips</h5>
              <ul className="text-sm text-blue-700 space-y-1">
                <li>• Use sort order to control navigation display</li>
                <li>• Feature important categories on homepage</li>
                <li>• Keep descriptions concise but informative</li>
                <li>• Consider your audience when naming</li>
                <li>• Plan for future content growth</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Color and Icon Reference */}
        <div className="bg-green-50 border border-green-200 rounded-lg p-6">
          <h4 className="text-lg font-medium text-green-900 mb-4">
            🎨 Design Reference
          </h4>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <div>
              <h5 className="font-medium text-green-800 mb-2">Popular Colors</h5>
              <div className="flex flex-wrap gap-2">
                <span className="w-6 h-6 rounded" style={{backgroundColor: '#3B82F6'}} title="Blue"></span>
                <span className="w-6 h-6 rounded" style={{backgroundColor: '#10B981'}} title="Green"></span>
                <span className="w-6 h-6 rounded" style={{backgroundColor: '#F59E0B'}} title="Yellow"></span>
                <span className="w-6 h-6 rounded" style={{backgroundColor: '#EF4444'}} title="Red"></span>
                <span className="w-6 h-6 rounded" style={{backgroundColor: '#8B5CF6'}} title="Purple"></span>
                <span className="w-6 h-6 rounded" style={{backgroundColor: '#06B6D4'}} title="Cyan"></span>
              </div>
            </div>
            <div>
              <h5 className="font-medium text-green-800 mb-2">Common Icons</h5>
              <div className="text-lg space-x-2">
                <span title="Technology">💻</span>
                <span title="Health">🏥</span>
                <span title="Travel">✈️</span>
                <span title="Food">🍕</span>
                <span title="Business">💼</span>
                <span title="Education">📚</span>
                <span title="Sports">⚽</span>
                <span title="Music">🎵</span>
              </div>
            </div>
            <div>
              <h5 className="font-medium text-green-800 mb-2">SEO Impact</h5>
              <p className="text-sm text-green-700">
                Well-organized categories improve site structure and help search engines understand your content themes.
              </p>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  )
}