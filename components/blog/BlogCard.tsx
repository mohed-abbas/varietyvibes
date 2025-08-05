import Link from 'next/link'
import { formatDistanceToNow } from 'date-fns'
import { BlogPost } from '@/types/blog'

// Fallback placeholder component  
function ImageWithFallback({ alt }: { alt: string }) {
  return (
    <div className="relative w-full h-full bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center">
      <div className="text-gray-500 text-sm font-medium px-4 text-center">
        {alt || 'Image'}
      </div>
    </div>
  )
}

interface BlogCardProps {
  post: BlogPost
  variant?: 'default' | 'featured' | 'minimal'
  showCategory?: boolean
  showAuthor?: boolean
  showDate?: boolean
  showReadingTime?: boolean
  className?: string
}

export default function BlogCard({ 
  post, 
  variant = 'default',
  showCategory = true,
  showAuthor = true,
  showDate = true,
  showReadingTime = true,
  className = ''
}: BlogCardProps) {
  const baseClasses = "bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300"
  const variantClasses = {
    default: "h-full",
    featured: "h-full border-l-4 border-primary-500",
    minimal: "h-full shadow-sm hover:shadow-md"
  }

  return (
    <article className={`${baseClasses} ${variantClasses[variant]} ${className}`}>
      <Link href={`/blog/${post.slug}`} className="block">
        <div className="relative h-48 w-full">
          <ImageWithFallback alt={post.title} />
          {post.featured && (
            <div className="absolute top-3 right-3">
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                Featured
              </span>
            </div>
          )}
        </div>
      </Link>
      
      <div className="p-6">
        {/* Meta information */}
        <div className="flex items-center gap-2 mb-3 text-sm">
          {showCategory && (
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary-100 text-primary-800">
              {post.category.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}
            </span>
          )}
          {showDate && (
            <span className="text-gray-500">
              {formatDistanceToNow(new Date(post.date), { addSuffix: true })}
            </span>
          )}
        </div>
        
        {/* Title */}
        <h2 className="text-xl font-semibold text-gray-900 mb-2 line-clamp-2 leading-tight">
          <Link 
            href={`/blog/${post.slug}`} 
            className="hover:text-primary-600 transition-colors duration-200"
          >
            {post.title}
          </Link>
        </h2>
        
        {/* Description */}
        <p className="text-gray-600 mb-4 line-clamp-3 text-sm leading-relaxed">
          {post.description}
        </p>
        
        {/* Footer */}
        <div className="flex items-center justify-between pt-3 border-t border-gray-100">
          <div className="flex items-center gap-3">
            {showAuthor && (
              <span className="text-sm text-gray-600 font-medium">
                {post.author}
              </span>
            )}
            {showReadingTime && (
              <>
                <span className="text-gray-400">•</span>
                <span className="text-sm text-gray-500">
                  {post.readingTime} min read
                </span>
              </>
            )}
          </div>
          
          {/* Tags preview */}
          {post.tags && post.tags.length > 0 && (
            <div className="flex gap-1">
              {post.tags.slice(0, 2).map((tag) => (
                <span
                  key={tag}
                  className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-700"
                >
                  #{tag}
                </span>
              ))}
              {post.tags.length > 2 && (
                <span className="text-xs text-gray-500">
                  +{post.tags.length - 2}
                </span>
              )}
            </div>
          )}
        </div>
      </div>
    </article>
  )
}