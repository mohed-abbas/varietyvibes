'use client'

import { useState, useEffect, use } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeftIcon } from '@heroicons/react/24/outline'
import Link from 'next/link'
import AdminLayout from '@/components/admin/layout/AdminLayout'
import PostForm from '@/components/admin/posts/PostForm'
import { BreadcrumbItem } from '@/components/admin/layout/AdminBreadcrumb'
import { useAuth } from '@/hooks/useAuth'
import { FirestorePost } from '@/types/admin'

interface EditPostPageProps {
  params: Promise<{ id: string }>
}

export default function EditPostPage({ params }: EditPostPageProps) {
  const resolvedParams = use(params)
  const [post, setPost] = useState<FirestorePost | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { user } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (user && resolvedParams.id) {
      fetchPost()
    }
  }, [user, resolvedParams.id])

  const fetchPost = async () => {
    if (!user) return

    try {
      setLoading(true)
      const token = await user.getIdToken()
      const response = await fetch(`/api/admin/posts/${resolvedParams.id}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      if (response.ok) {
        const postData = await response.json()
        setPost(postData)
      } else if (response.status === 404) {
        setError('Post not found')
      } else if (response.status === 403) {
        setError('You do not have permission to edit this post')
      } else {
        const errorData = await response.json()
        setError(errorData.error || 'Failed to load post')
      }
    } catch (error) {
      console.error('Error fetching post:', error)
      setError('Failed to load post')
    } finally {
      setLoading(false)
    }
  }

  const handleSuccess = (updatedPost: any) => {
    console.log('Post updated:', updatedPost)
    router.push('/admin/posts')
  }

  const handleCancel = () => {
    router.push('/admin/posts')
  }

  if (loading) {
    return (
      <AdminLayout title="Edit Post">
        <div className="flex items-center justify-center min-h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="ml-3 text-gray-600">Loading post...</span>
        </div>
      </AdminLayout>
    )
  }

  if (error) {
    return (
      <AdminLayout title="Edit Post">
        <div className="text-center py-12">
          <div className="mx-auto h-12 w-12 text-red-400">
            <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h3 className="mt-2 text-sm font-medium text-gray-900">Error loading post</h3>
          <p className="mt-1 text-sm text-gray-500">{error}</p>
          <div className="mt-6">
            <Link
              href="/admin/posts"
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
            >
              <ArrowLeftIcon className="-ml-1 mr-2 h-5 w-5" />
              Back to Posts
            </Link>
          </div>
        </div>
      </AdminLayout>
    )
  }

  if (!post) {
    return (
      <AdminLayout title="Edit Post">
        <div className="text-center py-12">
          <h3 className="mt-2 text-sm font-medium text-gray-900">Post not found</h3>
          <div className="mt-6">
            <Link
              href="/admin/posts"
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
            >
              <ArrowLeftIcon className="-ml-1 mr-2 h-5 w-5" />
              Back to Posts
            </Link>
          </div>
        </div>
      </AdminLayout>
    )
  }

  const breadcrumb: BreadcrumbItem[] = [
    { name: 'Posts', href: '/admin/posts' },
    { name: post.title, href: `/admin/posts/${post.id}` },
    { name: 'Edit', current: true }
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
      {post.status === 'published' && (
        <Link
          href={`/blog/${post.slug}`}
          target="_blank"
          className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          View Post
        </Link>
      )}
    </div>
  )

  // Transform post data for the form
  const initialData = {
    title: post.title,
    description: post.description,
    content: post.content,
    excerpt: post.excerpt,
    categoryId: post.categoryId,
    tags: post.tags || [],
    featured: post.featured || false,
    featuredImage: post.featuredImage || undefined,
    seo: post.seo || undefined,
    status: post.status as 'draft' | 'published' | 'scheduled',
    scheduledFor: post.scheduledFor || undefined
  }

  return (
    <AdminLayout 
      title={`Edit: ${post.title}`} 
      breadcrumb={breadcrumb}
      actions={actions}
    >
      <div className="space-y-6">
        {/* Form Card */}
        <div className="bg-white shadow-sm rounded-lg">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-medium text-gray-900">Edit Post</h3>
                <p className="mt-1 text-sm text-gray-500">
                  Update your post content and settings.
                </p>
              </div>
              <div className="flex items-center space-x-4 text-sm text-gray-500">
                <div>Created: {new Date(post.createdAt).toLocaleDateString()}</div>
                <div>Updated: {new Date(post.updatedAt).toLocaleDateString()}</div>
              </div>
            </div>
          </div>
          
          <div className="p-6">
            <PostForm 
              mode="edit"
              postId={post.id}
              initialData={initialData}
              onSuccess={handleSuccess}
              onCancel={handleCancel}
            />
          </div>
        </div>

        {/* Post Stats */}
        {post.status === 'published' && (
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
            <h4 className="text-lg font-medium text-gray-900 mb-4">
              📊 Post Statistics
            </h4>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">{post.views?.toLocaleString() || 0}</div>
                <div className="text-sm text-gray-500">Views</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">{post.likes?.toLocaleString() || 0}</div>
                <div className="text-sm text-gray-500">Likes</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">{post.shares?.toLocaleString() || 0}</div>
                <div className="text-sm text-gray-500">Shares</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-600">{post.readingTime || 0} min</div>
                <div className="text-sm text-gray-500">Reading Time</div>
              </div>
            </div>
          </div>
        )}

        {/* Edit Guidelines */}
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
          <h4 className="text-lg font-medium text-yellow-900 mb-4">
            ✏️ Editing Guidelines
          </h4>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <h5 className="font-medium text-yellow-800 mb-2">Content Updates</h5>
              <ul className="text-sm text-yellow-700 space-y-1">
                <li>• Review and update outdated information</li>
                <li>• Improve clarity and readability</li>
                <li>• Add new insights or examples</li>
                <li>• Check and update links</li>
                <li>• Optimize for current SEO practices</li>
              </ul>
            </div>
            <div>
              <h5 className="font-medium text-yellow-800 mb-2">SEO Considerations</h5>
              <ul className="text-sm text-yellow-700 space-y-1">
                <li>• Update meta title and description</li>
                <li>• Review and optimize keywords</li>
                <li>• Check featured image alt text</li>
                <li>• Ensure proper heading structure</li>
                <li>• Update publication date if needed</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  )
}