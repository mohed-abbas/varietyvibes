'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { 
  PencilIcon, 
  TrashIcon,
  FolderIcon,
  EyeIcon
} from '@heroicons/react/24/outline'
import { toast } from 'react-hot-toast'
import DataTable, { Column } from '@/components/admin/common/DataTable'
import StatusBadge from '@/components/admin/common/StatusBadge'
import { FirestoreCategory } from '@/types/admin'
import { formatDate, formatRelativeTime, getContrastColor } from '@/lib/utils'
import { useAuth } from '@/hooks/useAuth'

export default function CategoryList() {
  const [categories, setCategories] = useState<FirestoreCategory[]>([])
  const [loading, setLoading] = useState(true)
  const { user: currentUser } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (currentUser?.uid) {
      fetchCategories()
    }
  }, [currentUser])

  const fetchCategories = async () => {
    if (!currentUser?.uid) return

    try {
      const token = await currentUser.getIdToken()
      const response = await fetch('/api/admin/categories?limit=100', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      
      if (response.ok) {
        const data = await response.json()
        setCategories(data.categories || [])
      } else {
        console.error('Failed to fetch categories:', response.status)
        const error = await response.json()
        toast.error(error.error || 'Failed to load categories')
        setCategories([])
      }
    } catch (error) {
      console.error('Error fetching categories:', error)
      setCategories([])
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteCategory = async (categoryId: string) => {
    if (!currentUser?.uid) {
      toast.error('Authentication required')
      return
    }

    const category = categories.find(c => c.id === categoryId)
    if (!category) return

    if (category.postCount > 0) {
      toast.error(`Cannot delete category "${category.name}" because it has ${category.postCount} posts. Please move the posts to another category first.`)
      return
    }

    if (!confirm(`Are you sure you want to delete the category "${category.name}"?`)) return

    try {
      const token = await currentUser.getIdToken()
      const response = await fetch(`/api/admin/categories/${categoryId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (response.ok) {
        setCategories(categories.filter(cat => cat.id !== categoryId))
        toast.success('Category deleted successfully')
      } else {
        const error = await response.json()
        toast.error(error.error || 'Failed to delete category')
      }
    } catch (error) {
      console.error('Error deleting category:', error)
      toast.error('Failed to delete category')
    }
  }

  const handleToggleCategoryStatus = async (categoryId: string) => {
    if (!currentUser?.uid) {
      toast.error('Authentication required')
      return
    }

    const category = categories.find(c => c.id === categoryId)
    if (!category) return

    try {
      const token = await currentUser.getIdToken()
      const response = await fetch(`/api/admin/categories/${categoryId}`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ 
          ...category,
          active: !category.active 
        })
      })

      if (response.ok) {
        setCategories(categories.map(c => 
          c.id === categoryId 
            ? { ...c, active: !c.active }
            : c
        ))
        toast.success(`Category ${!category.active ? 'activated' : 'deactivated'} successfully`)
      } else {
        const error = await response.json()
        toast.error(error.error || 'Failed to update category status')
      }
    } catch (error) {
      console.error('Error updating category status:', error)
      toast.error('Failed to update category status')
    }
  }

  const columns: Column<FirestoreCategory>[] = [
    {
      key: 'name',
      title: 'Category',
      render: (_, category) => (
        <div className="flex items-center">
          <div className="flex-shrink-0 h-10 w-10">
            {category.featuredImage ? (
              <img
                className="h-10 w-10 rounded-lg object-cover"
                src={category.featuredImage}
                alt={category.name}
              />
            ) : (
              <div 
                className="h-10 w-10 rounded-lg flex items-center justify-center"
                style={{ backgroundColor: category.color }}
              >
                <FolderIcon 
                  className="h-5 w-5" 
                  style={{ color: getContrastColor(category.color) }}
                />
              </div>
            )}
          </div>
          <div className="ml-4">
            <div className="flex items-center">
              <div className="text-sm font-medium text-gray-900">
                {category.name}
              </div>
              {category.featured && (
                <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-yellow-100 text-yellow-800">
                  Featured
                </span>
              )}
            </div>
            <div className="text-sm text-gray-500 line-clamp-1">
              {category.description}
            </div>
            <div className="flex items-center mt-1 space-x-2">
              <div 
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: category.color }}
              />
              <span className="text-xs text-gray-400">/{category.slug}</span>
            </div>
          </div>
        </div>
      ),
      sortable: true,
      width: '40%'
    },
    {
      key: 'active',
      title: 'Status',
      render: (active) => (
        <StatusBadge variant={active ? 'success' : 'neutral'}>
          {active ? 'Active' : 'Inactive'}
        </StatusBadge>
      ),
      sortable: true,
      width: '10%'
    },
    {
      key: 'postCount',
      title: 'Posts',
      render: (postCount) => (
        <span className="text-sm text-gray-900">
          {postCount}
        </span>
      ),
      sortable: true,
      width: '8%'
    },
    {
      key: 'totalViews',
      title: 'Views',
      render: (totalViews) => (
        <span className="text-sm text-gray-900">
          {totalViews?.toLocaleString() || '0'}
        </span>
      ),
      sortable: true,
      width: '10%'
    },
    {
      key: 'sortOrder',
      title: 'Order',
      render: (sortOrder) => (
        <span className="text-sm text-gray-900">
          {sortOrder}
        </span>
      ),
      sortable: true,
      width: '8%'
    },
    {
      key: 'updatedAt',
      title: 'Last Updated',
      render: (updatedAt) => (
        <div>
          <div className="text-sm text-gray-900">
            {formatDate(updatedAt)}
          </div>
          <div className="text-xs text-gray-500">
            {formatRelativeTime(updatedAt)}
          </div>
        </div>
      ),
      sortable: true,
      width: '15%'
    },
    {
      key: 'actions',
      title: 'Actions',
      render: (_, category) => (
        <div className="flex space-x-2">
          <button
            onClick={() => router.push(`/admin/categories/${category.id}/edit`)}
            className="text-blue-600 hover:text-blue-900"
            title="Edit category"
          >
            <PencilIcon className="h-4 w-4" />
          </button>
          <button
            onClick={() => window.open(`/category/${category.slug}`, '_blank')}
            className="text-green-600 hover:text-green-900"
            title="View category page"
          >
            <EyeIcon className="h-4 w-4" />
          </button>
          <button
            onClick={() => handleToggleCategoryStatus(category.id)}
            className={category.active ? "text-yellow-600 hover:text-yellow-900" : "text-green-600 hover:text-green-900"}
            title={category.active ? "Deactivate category" : "Activate category"}
          >
            {category.active ? '⏸️' : '▶️'}
          </button>
          <button
            onClick={() => handleDeleteCategory(category.id)}
            className="text-red-600 hover:text-red-900"
            title="Delete category"
            disabled={category.postCount > 0}
          >
            <TrashIcon className={`h-4 w-4 ${category.postCount > 0 ? 'opacity-50' : ''}`} />
          </button>
        </div>
      ),
      width: '9%'
    }
  ]

  return (
    <div className="space-y-6">
      {/* Category stats */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-4">
        <div className="bg-white overflow-hidden shadow-sm rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <FolderIcon className="h-6 w-6 text-gray-400" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Total Categories</dt>
                  <dd className="text-lg font-medium text-gray-900">{categories.length}</dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow-sm rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="h-6 w-6 bg-yellow-400 rounded flex items-center justify-center">
                  <span className="text-white text-xs">★</span>
                </div>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Featured</dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {categories.filter(c => c.featured).length}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow-sm rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="h-6 w-6 bg-green-400 rounded flex items-center justify-center">
                  <span className="text-white text-xs">✓</span>
                </div>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Active</dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {categories.filter(c => c.active).length}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow-sm rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="h-6 w-6 bg-blue-400 rounded flex items-center justify-center">
                  <span className="text-white text-xs">#</span>
                </div>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Total Posts</dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {categories.reduce((sum, c) => sum + c.postCount, 0)}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Categories table */}
      <DataTable
        data={categories}
        columns={columns}
        loading={loading}
        emptyMessage="No categories found. Create your first category to organize your content!"
        emptyIcon={FolderIcon}
      />
    </div>
  )
}