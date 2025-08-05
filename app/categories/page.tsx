import { getAllCategories } from '@/lib/blog'
import { generatePageMetadata } from '@/lib/metadata'
import { CategoryGrid } from '@/components/blog'
import Link from 'next/link'
import { Metadata } from 'next'

export const metadata: Metadata = generatePageMetadata(
  'All Categories',
  'Explore all our content categories including insurance, home improvement, warranties, and more.'
)

export default function CategoriesPage() {
  const categories = getAllCategories()

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="text-center mb-12">
        <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
          Explore Categories
        </h1>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto mb-6">
          Discover expert insights and practical tips organized by topic
        </p>
        
        {/* Stats */}
        <div className="flex items-center justify-center gap-8 text-sm text-gray-500">
          <div className="flex items-center gap-2">
            <span className="font-medium text-primary-600">{categories.length}</span>
            <span>Categories</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="font-medium text-primary-600">
              {categories.reduce((total, cat) => total + cat.postCount, 0)}
            </span>
            <span>Total Posts</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="font-medium text-primary-600">Daily</span>
            <span>Updates</span>
          </div>
        </div>
      </div>

      {/* Categories Grid */}
      <CategoryGrid 
        categories={categories} 
        columns={3}
        className="mb-12"
      />

      {categories.length === 0 && (
        <div className="text-center py-16">
          <div className="mx-auto h-24 w-24 text-gray-400 mb-4">
            <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2-2v-6a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
          </div>
          <h3 className="text-xl font-medium text-gray-900 mb-2">No categories available</h3>
          <p className="text-gray-500">Categories will appear here as content is added!</p>
        </div>
      )}

      {/* Call to Action */}
      {categories.length > 0 && (
        <div className="text-center bg-gradient-to-r from-primary-50 to-blue-50 rounded-lg p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Can't find what you're looking for?
          </h2>
          <p className="text-gray-600 mb-6">
            Browse all our posts or get in touch with suggestions for new topics
          </p>
          <div className="flex flex-col sm:flex-row gap-4 items-center justify-center">
            <Link
              href="/blog"
              className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 transition-colors"
            >
              Browse All Posts
            </Link>
            <Link
              href="/contact"
              className="inline-flex items-center px-6 py-3 border border-primary-600 text-base font-medium rounded-md text-primary-600 bg-white hover:bg-primary-50 transition-colors"
            >
              Suggest a Topic
            </Link>
          </div>
        </div>
      )}
    </div>
  )
}