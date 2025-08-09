'use client'

import { ArrowLeftIcon } from '@heroicons/react/24/outline'
import Link from 'next/link'
import AdminLayout from '@/components/admin/layout/AdminLayout'
import PostForm from '@/components/admin/posts/PostForm'
import { BreadcrumbItem } from '@/components/admin/layout/AdminBreadcrumb'

export default function NewPostPage() {
  const breadcrumb: BreadcrumbItem[] = [
    { name: 'Posts', href: '/admin/posts' },
    { name: 'New Post', current: true }
  ]

  const actions = (
    <div className="flex space-x-3">
      <Link
        href="/admin/posts"
        className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
      >
        <ArrowLeftIcon className="-ml-1 mr-2 h-5 w-5" aria-hidden="true" />
        Back to Posts
      </Link>
    </div>
  )

  return (
    <AdminLayout 
      title="Create New Post" 
      breadcrumb={breadcrumb}
      actions={actions}
    >
      <div className="space-y-6">
        {/* Form Card */}
        <div className="bg-white shadow-sm rounded-lg">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">Post Content</h3>
            <p className="mt-1 text-sm text-gray-500">
              Create engaging content for your blog. You can save as draft and publish later.
            </p>
          </div>
          
          <div className="p-6">
            <PostForm 
              mode="create"
              onSuccess={(post) => {
                console.log('Post created:', post)
              }}
              onCancel={() => {
                console.log('Post creation cancelled')
              }}
            />
          </div>
        </div>

        {/* Writing Guidelines */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h4 className="text-lg font-medium text-blue-900 mb-4">
            ✍️ Writing Guidelines
          </h4>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <h5 className="font-medium text-blue-800 mb-2">Content Quality</h5>
              <ul className="text-sm text-blue-700 space-y-1">
                <li>• Write clear, engaging headlines</li>
                <li>• Use descriptive meta descriptions</li>
                <li>• Include relevant tags for discoverability</li>
                <li>• Add a compelling featured image</li>
                <li>• Break up content with subheadings</li>
              </ul>
            </div>
            <div>
              <h5 className="font-medium text-blue-800 mb-2">SEO Best Practices</h5>
              <ul className="text-sm text-blue-700 space-y-1">
                <li>• Optimize title for search engines</li>
                <li>• Write unique meta descriptions</li>
                <li>• Use relevant keywords naturally</li>
                <li>• Structure content with headers</li>
                <li>• Add alt text to images</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Publishing Options */}
        <div className="bg-green-50 border border-green-200 rounded-lg p-6">
          <h4 className="text-lg font-medium text-green-900 mb-4">
            📅 Publishing Options
          </h4>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <div>
              <h5 className="font-medium text-green-800 mb-2">Draft</h5>
              <p className="text-sm text-green-700">
                Save your work and continue editing later. Drafts are not visible to visitors.
              </p>
            </div>
            <div>
              <h5 className="font-medium text-green-800 mb-2">Publish Now</h5>
              <p className="text-sm text-green-700">
                Make your post immediately visible to all visitors on your blog.
              </p>
            </div>
            <div>
              <h5 className="font-medium text-green-800 mb-2">Schedule</h5>
              <p className="text-sm text-green-700">
                Set a future date and time to automatically publish your post.
              </p>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  )
}