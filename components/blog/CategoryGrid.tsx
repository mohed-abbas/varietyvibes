import Link from 'next/link'
import { Category } from '@/types/blog'

interface CategoryGridProps {
  categories: Category[]
  columns?: 2 | 3 | 4
  showPostCount?: boolean
  className?: string
}

export default function CategoryGrid({ 
  categories, 
  columns = 4,
  showPostCount = true,
  className = ''
}: CategoryGridProps) {
  const gridClasses = {
    2: 'grid-cols-1 sm:grid-cols-2',
    3: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3',
    4: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'
  }

  if (!categories || categories.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="mx-auto h-24 w-24 text-gray-400 mb-4">
          <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
          </svg>
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">No categories found</h3>
        <p className="text-gray-500">Categories will appear here once content is added.</p>
      </div>
    )
  }

  return (
    <div className={`grid ${gridClasses[columns]} gap-6 ${className}`}>
      {categories.map((category) => (
        <Link
          key={category.slug}
          href={`/category/${category.slug}`}
          className="group bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-all duration-300 border-l-4 transform hover:-translate-y-1"
          style={{ borderLeftColor: category.color }}
        >
          <div className="flex items-center mb-4">
            <div 
              className="w-12 h-12 rounded-lg flex items-center justify-center text-white text-xl font-bold mr-4 shadow-sm"
              style={{ backgroundColor: category.color }}
            >
              {category.icon || category.name.charAt(0)}
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-gray-900 group-hover:text-primary-600 transition-colors duration-200">
                {category.name}
              </h3>
              {showPostCount && (
                <p className="text-sm text-gray-500 mt-1">
                  {category.postCount} {category.postCount === 1 ? 'post' : 'posts'}
                </p>
              )}
            </div>
          </div>
          
          <p className="text-gray-600 text-sm leading-relaxed mb-4">
            {category.description}
          </p>
          
          <div className="flex items-center text-primary-600 text-sm font-medium group-hover:text-primary-700 transition-colors duration-200">
            <span>Explore {category.name}</span>
            <svg 
              className="ml-2 h-4 w-4 transform group-hover:translate-x-1 transition-transform duration-200" 
              fill="none" 
              viewBox="0 0 24 24" 
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </div>
        </Link>
      ))}
    </div>
  )
}