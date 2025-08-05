import { BlogPost } from '@/types/blog'
import BlogCard from './BlogCard'

interface BlogGridProps {
  posts: BlogPost[]
  columns?: 1 | 2 | 3 | 4
  showLoadMore?: boolean
  variant?: 'default' | 'featured' | 'minimal'
  showCategory?: boolean
  showAuthor?: boolean
  showDate?: boolean
  showReadingTime?: boolean
  className?: string
}

export default function BlogGrid({ 
  posts, 
  columns = 3,
  showLoadMore = false,
  variant = 'default',
  showCategory = true,
  showAuthor = true,
  showDate = true,
  showReadingTime = true,
  className = ''
}: BlogGridProps) {
  const gridClasses = {
    1: 'grid-cols-1',
    2: 'grid-cols-1 md:grid-cols-2',
    3: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
    4: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'
  }

  if (!posts || posts.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="mx-auto h-24 w-24 text-gray-400 mb-4">
          <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">No posts found</h3>
        <p className="text-gray-500">Check back later for new content.</p>
      </div>
    )
  }

  return (
    <div className={className}>
      <div className={`grid ${gridClasses[columns]} gap-8`}>
        {posts.map((post) => (
          <BlogCard
            key={post.slug}
            post={post}
            variant={variant}
            showCategory={showCategory}
            showAuthor={showAuthor}
            showDate={showDate}
            showReadingTime={showReadingTime}
          />
        ))}
      </div>

      {showLoadMore && posts.length > 0 && (
        <div className="text-center mt-12">
          <button className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-colors duration-200">
            Load More Posts
          </button>
        </div>
      )}
    </div>
  )
}