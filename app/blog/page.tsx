import { getAllPosts, getAllCategories } from '@/lib/blog'
import { generatePageMetadata } from '@/lib/metadata'
import { BlogGrid } from '@/components/blog'
import { Metadata } from 'next'

export const metadata: Metadata = generatePageMetadata(
  'All Blog Posts',
  'Browse all our comprehensive guides, expert insights, and practical tips across multiple categories.'
)

export default function BlogPage() {
  const posts = getAllPosts()
  const categories = getAllCategories()

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="text-center mb-12">
        <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
          All Blog Posts
        </h1>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto mb-6">
          Discover insights and stories across various topics that matter to you
        </p>
        
        {/* Stats */}
        <div className="flex items-center justify-center gap-8 text-sm text-gray-500">
          <div className="flex items-center gap-2">
            <span className="font-medium text-primary-600">{posts.length}</span>
            <span>Total Posts</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="font-medium text-primary-600">{categories.length}</span>
            <span>Categories</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="font-medium text-primary-600">3-5 min</span>
            <span>Average Read</span>
          </div>
        </div>
      </div>

      {/* Blog Grid */}
      <BlogGrid 
        posts={posts} 
        columns={3}
        className="mb-12"
      />

      {posts.length === 0 && (
        <div className="text-center py-16">
          <div className="mx-auto h-24 w-24 text-gray-400 mb-4">
            <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <h3 className="text-xl font-medium text-gray-900 mb-2">No blog posts yet</h3>
          <p className="text-gray-500">Check back soon for our latest insights and stories!</p>
        </div>
      )}
    </div>
  )
}