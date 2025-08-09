'use client'

import { useState, useEffect, use } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeftIcon } from '@heroicons/react/24/outline'
import Link from 'next/link'
import AdminLayout from '@/components/admin/layout/AdminLayout'
import CategoryForm from '@/components/admin/categories/CategoryForm'
import { BreadcrumbItem } from '@/components/admin/layout/AdminBreadcrumb'
import { useAuth } from '@/hooks/useAuth'
import { FirestoreCategory } from '@/types/admin'

interface EditCategoryPageProps {
  params: Promise<{ id: string }>
}

export default function EditCategoryPage({ params }: EditCategoryPageProps) {
  const resolvedParams = use(params)
  const [category, setCategory] = useState<FirestoreCategory | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { user } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (user && resolvedParams.id) {
      fetchCategory()
    }
  }, [user, resolvedParams.id])

  const fetchCategory = async () => {
    if (!user) return

    try {
      setLoading(true)
      const token = await user.getIdToken()
      const response = await fetch(`/api/admin/categories/${resolvedParams.id}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      if (response.ok) {
        const categoryData = await response.json()
        setCategory(categoryData)
      } else if (response.status === 404) {
        setError('Category not found')
      } else if (response.status === 403) {
        setError('You do not have permission to edit categories')
      } else {
        const errorData = await response.json()
        setError(errorData.error || 'Failed to load category')
      }
    } catch (error) {
      console.error('Error fetching category:', error)
      setError('Failed to load category')
    } finally {
      setLoading(false)
    }
  }

  const handleSuccess = (updatedCategory: any) => {
    console.log('Category updated:', updatedCategory)
    router.push('/admin/categories')
  }

  const handleCancel = () => {
    router.push('/admin/categories')
  }

  if (loading) {
    return (
      <AdminLayout title="Edit Category">
        <div className="flex items-center justify-center min-h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="ml-3 text-gray-600">Loading category...</span>
        </div>
      </AdminLayout>
    )
  }

  if (error) {
    return (
      <AdminLayout title="Edit Category">
        <div className="text-center py-12">
          <div className="mx-auto h-12 w-12 text-red-400">
            <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h3 className="mt-2 text-sm font-medium text-gray-900">Error loading category</h3>
          <p className="mt-1 text-sm text-gray-500">{error}</p>
          <div className="mt-6">
            <Link
              href="/admin/categories"
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
            >
              <ArrowLeftIcon className="-ml-1 mr-2 h-5 w-5" />
              Back to Categories
            </Link>
          </div>
        </div>
      </AdminLayout>
    )
  }

  if (!category) {
    return (
      <AdminLayout title="Edit Category">
        <div className="text-center py-12">
          <h3 className="mt-2 text-sm font-medium text-gray-900">Category not found</h3>
          <div className="mt-6">
            <Link
              href="/admin/categories"
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
            >
              <ArrowLeftIcon className="-ml-1 mr-2 h-5 w-5" />
              Back to Categories
            </Link>
          </div>
        </div>
      </AdminLayout>
    )
  }

  const breadcrumb: BreadcrumbItem[] = [
    { name: 'Categories', href: '/admin/categories' },
    { name: category.name, href: `/admin/categories/${category.id}` },
    { name: 'Edit', current: true }
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
      {category.active && (
        <Link
          href={`/category/${category.slug}`}
          target="_blank"
          className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          View Category
        </Link>
      )}
    </div>
  )

  // Transform category data for the form
  const initialData = {
    name: category.name,
    description: category.description,
    color: category.color,
    icon: category.icon,
    featured: category.featured || false,
    active: category.active !== false,
    sortOrder: category.sortOrder || 0,
    seo: category.seo || undefined,
    hero: category.hero || undefined
  }

  return (
    <AdminLayout 
      title={`Edit: ${category.name}`} 
      breadcrumb={breadcrumb}
      actions={actions}
    >
      <div className="space-y-6">
        {/* Form Card */}
        <div className="bg-white shadow-sm rounded-lg">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-medium text-gray-900">Edit Category</h3>
                <p className="mt-1 text-sm text-gray-500">
                  Update category information and settings.
                </p>
              </div>
              <div className="flex items-center space-x-4 text-sm text-gray-500">
                <div>Created: {new Date(category.createdAt).toLocaleDateString()}</div>
                <div>Updated: {new Date(category.updatedAt).toLocaleDateString()}</div>
              </div>
            </div>
          </div>
          
          <div className="p-6">
            <CategoryForm 
              mode="edit"
              categoryId={category.id}
              initialData={initialData}
              onSuccess={handleSuccess}
              onCancel={handleCancel}
            />
          </div>
        </div>

        {/* Category Stats */}
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
          <h4 className="text-lg font-medium text-gray-900 mb-4">
            📊 Category Statistics
          </h4>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{category.postCount || 0}</div>
              <div className="text-sm text-gray-500">Posts</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{category.totalViews?.toLocaleString() || 0}</div>
              <div className="text-sm text-gray-500">Total Views</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">{category.sortOrder || 0}</div>
              <div className="text-sm text-gray-500">Sort Order</div>
            </div>
            <div className="text-center">
              <div className={`text-2xl font-bold ${category.active ? 'text-green-600' : 'text-red-600'}`}>
                {category.active ? '✓' : '✗'}
              </div>
              <div className="text-sm text-gray-500">Status</div>
            </div>
          </div>
        </div>

        {/* Category Preview */}
        <div className="bg-white shadow-sm rounded-lg">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">Category Preview</h3>
            <p className="mt-1 text-sm text-gray-500">
              How this category appears on your website.
            </p>
          </div>
          <div className="p-6">
            <div className="border border-gray-200 rounded-lg p-6" style={{ backgroundColor: `${category.color}10` }}>
              <div className="flex items-start">
                <div 
                  className="flex-shrink-0 h-12 w-12 rounded-lg flex items-center justify-center text-white text-xl"
                  style={{ backgroundColor: category.color }}
                >
                  {category.icon}
                </div>
                <div className="ml-4 flex-1">
                  <h4 className="text-lg font-semibold text-gray-900 mb-2">
                    {category.name}
                    {category.featured && (
                      <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-yellow-100 text-yellow-800">
                        Featured
                      </span>
                    )}
                  </h4>
                  <p className="text-gray-600 mb-3">{category.description}</p>
                  <div className="text-sm text-gray-500">
                    <span className="font-medium">{category.postCount || 0}</span> posts • 
                    <span className="font-medium ml-1">/{category.slug}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* SEO Information */}
        {category.seo && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
            <h4 className="text-lg font-medium text-blue-900 mb-4">
              🔍 SEO Information
            </h4>
            <div className="space-y-3">
              {category.seo.title && (
                <div>
                  <span className="text-sm font-medium text-blue-800">Title:</span>
                  <p className="text-sm text-blue-700 mt-1">{category.seo.title}</p>
                </div>
              )}
              {category.seo.description && (
                <div>
                  <span className="text-sm font-medium text-blue-800">Description:</span>
                  <p className="text-sm text-blue-700 mt-1">{category.seo.description}</p>
                </div>
              )}
              {category.seo.keywords && category.seo.keywords.length > 0 && (
                <div>
                  <span className="text-sm font-medium text-blue-800">Keywords:</span>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {category.seo.keywords.map((keyword: string, index: number) => (
                      <span
                        key={index}
                        className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800"
                      >
                        {keyword}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  )
}