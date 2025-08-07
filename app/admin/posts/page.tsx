import type { Metadata } from 'next'
import Link from 'next/link'
import { PlusIcon } from '@heroicons/react/24/outline'
import AdminLayout from '@/components/admin/layout/AdminLayout'
import PostList from '@/components/admin/posts/PostList'
import { BreadcrumbItem } from '@/components/admin/layout/AdminBreadcrumb'

export const metadata: Metadata = {
  title: 'Posts'
}

export default function PostsPage() {
  const breadcrumb: BreadcrumbItem[] = [
    { name: 'Posts', current: true }
  ]

  const actions = (
    <div className="flex space-x-3">
      <Link
        href="/admin/posts/new"
        className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
      >
        <PlusIcon className="-ml-1 mr-2 h-5 w-5" aria-hidden="true" />
        New Post
      </Link>
    </div>
  )

  return (
    <AdminLayout 
      title="Posts" 
      breadcrumb={breadcrumb}
      actions={actions}
    >
      <div className="space-y-6">
        {/* Post filters - placeholder for future implementation */}
        <div className="bg-white shadow-sm rounded-lg p-4">
          <div className="flex flex-wrap items-center gap-4">
            <select className="rounded-md border-gray-300 text-sm">
              <option value="">All Status</option>
              <option value="published">Published</option>
              <option value="draft">Draft</option>
              <option value="scheduled">Scheduled</option>
              <option value="archived">Archived</option>
            </select>
            
            <select className="rounded-md border-gray-300 text-sm">
              <option value="">All Categories</option>
              <option value="tech">Technology</option>
              <option value="lifestyle">Lifestyle</option>
              <option value="health">Health</option>
            </select>
            
            <select className="rounded-md border-gray-300 text-sm">
              <option value="">All Authors</option>
              <option value="user1">John Doe</option>
              <option value="user2">Jane Smith</option>
            </select>
            
            <input
              type="search"
              placeholder="Search posts..."
              className="flex-1 max-w-sm rounded-md border-gray-300 text-sm"
            />
          </div>
        </div>

        {/* Posts table */}
        <PostList />
      </div>
    </AdminLayout>
  )
}