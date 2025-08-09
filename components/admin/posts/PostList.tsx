'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'
import Link from 'next/link'
import { 
  PencilIcon, 
  EyeIcon,
  TrashIcon,
  DocumentTextIcon
} from '@heroicons/react/24/outline'
import DataTable, { Column } from '@/components/admin/common/DataTable'
import StatusBadge from '@/components/admin/common/StatusBadge'
import { FirestorePost } from '@/types/admin'
import { formatDate, formatRelativeTime } from '@/lib/utils'

interface PostListProps {
  filters?: {
    status?: string
    category?: string
    author?: string
  }
}

export default function PostList({ filters = {} }: PostListProps) {
  const [posts, setPosts] = useState<FirestorePost[]>([])
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const { user } = useAuth()

  useEffect(() => {
    if (user) {
      fetchPosts()
    }
  }, [filters, user])

  const fetchPosts = async () => {
    if (!user) return

    try {
      const params = new URLSearchParams()
      if (filters.status) params.append('status', filters.status)
      if (filters.category) params.append('category', filters.category)
      if (filters.author) params.append('author', filters.author)

      const token = await user.getIdToken()
      const response = await fetch(`/api/admin/posts?${params.toString()}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      if (response.ok) {
        const data = await response.json()
        setPosts(data.posts || [])
      } else {
        const error = await response.json()
        console.error('Failed to fetch posts:', error.error || 'Unknown error')
        setPosts([])
      }
    } catch (error) {
      console.error('Error fetching posts:', error)
      setPosts([])
    } finally {
      setLoading(false)
    }
  }

  const handleDeletePost = async (postId: string) => {
    if (!confirm('Are you sure you want to delete this post?')) return
    if (!user) return

    try {
      const token = await user.getIdToken()
      const response = await fetch(`/api/admin/posts/${postId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      if (response.ok) {
        setPosts(posts.filter(post => post.id !== postId))
      } else {
        const error = await response.json()
        alert(`Failed to delete post: ${error.error || 'Unknown error'}`)
      }
    } catch (error) {
      console.error('Error deleting post:', error)
      alert('Error deleting post. Please try again.')
    }
  }

  const columns: Column<FirestorePost>[] = [
    {
      key: 'title',
      title: 'Post',
      render: (_, post) => (
        <div className="flex items-center">
          <div className="flex-shrink-0 h-10 w-10">
            {post.featuredImage ? (
              <img
                className="h-10 w-10 rounded-lg object-cover"
                src={post.featuredImage.url}
                alt={post.featuredImage.alt}
              />
            ) : (
              <div className="h-10 w-10 rounded-lg bg-gray-200 flex items-center justify-center">
                <DocumentTextIcon className="h-5 w-5 text-gray-400" />
              </div>
            )}
          </div>
          <div className="ml-4">
            <div className="text-sm font-medium text-gray-900 line-clamp-1">
              {post.title}
            </div>
            <div className="text-sm text-gray-500 line-clamp-1">
              {post.excerpt}
            </div>
          </div>
        </div>
      ),
      sortable: true,
      width: '40%'
    },
    {
      key: 'status',
      title: 'Status',
      render: (status) => (
        <StatusBadge variant={status as any}>
          {status === 'published' ? 'Published' : 
           status === 'draft' ? 'Draft' : 
           status === 'scheduled' ? 'Scheduled' :
           'Archived'}
        </StatusBadge>
      ),
      sortable: true,
      width: '12%'
    },
    {
      key: 'publishDate',
      title: 'Date',
      render: (date, post) => (
        <div>
          <div className="text-sm text-gray-900">
            {post.status === 'published' && post.publishDate 
              ? formatDate(post.publishDate)
              : formatDate(post.createdAt)
            }
          </div>
          <div className="text-xs text-gray-500">
            {formatRelativeTime(post.updatedAt)}
          </div>
        </div>
      ),
      sortable: true,
      width: '15%'
    },
    {
      key: 'views',
      title: 'Views',
      render: (views) => (
        <span className="text-sm text-gray-900">
          {views?.toLocaleString() || '0'}
        </span>
      ),
      sortable: true,
      width: '8%'
    },
    {
      key: 'tags',
      title: 'Tags',
      render: (tags) => (
        <div className="flex flex-wrap gap-1">
          {tags?.slice(0, 2).map((tag: string) => (
            <span
              key={tag}
              className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800"
            >
              {tag}
            </span>
          ))}
          {tags?.length > 2 && (
            <span className="text-xs text-gray-500">
              +{tags.length - 2}
            </span>
          )}
        </div>
      ),
      width: '15%'
    },
    {
      key: 'actions',
      title: 'Actions',
      render: (_, post) => (
        <div className="flex space-x-2">
          <Link
            href={`/admin/posts/${post.id}/edit`}
            className="text-blue-600 hover:text-blue-900"
          >
            <PencilIcon className="h-4 w-4" />
          </Link>
          {post.status === 'published' && (
            <Link
              href={`/blog/${post.slug}`}
              target="_blank"
              className="text-green-600 hover:text-green-900"
            >
              <EyeIcon className="h-4 w-4" />
            </Link>
          )}
          <button
            onClick={() => handleDeletePost(post.id)}
            className="text-red-600 hover:text-red-900"
          >
            <TrashIcon className="h-4 w-4" />
          </button>
        </div>
      ),
      width: '10%'
    }
  ]

  return (
    <DataTable
      data={posts}
      columns={columns}
      loading={loading}
      emptyMessage="No posts found. Create your first post to get started!"
      emptyIcon={DocumentTextIcon}
      onRowClick={(post) => router.push(`/admin/posts/${post.id}/edit`)}
    />
  )
}