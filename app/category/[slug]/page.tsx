import { getPostsByCategoryFromDB, getAllCategoriesFromDB, getCategoryBySlugFromDB } from '@/lib/blog-db'
import { generateCategoryMetadata } from '@/lib/metadata'
import { BlogGrid } from '@/components/blog'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { Metadata } from 'next'

interface CategoryPageProps {
  params: Promise<{
    slug: string
  }>
}

// Generate static params for all categories
export async function generateStaticParams() {
  const categories = await getAllCategoriesFromDB()
  return categories.map((category) => ({
    slug: category.slug,
  }))
}

// Generate metadata for SEO
export async function generateMetadata({ params }: CategoryPageProps): Promise<Metadata> {
  const { slug } = await params
  const category = await getCategoryBySlugFromDB(slug)
  
  if (!category) {
    return {
      title: 'Category Not Found | Variety Vibes'
    }
  }

  return generateCategoryMetadata(category.name, category.description)
}

export default async function CategoryPage({ params }: CategoryPageProps) {
  const { slug } = await params
  const [posts, category] = await Promise.all([
    getPostsByCategoryFromDB(slug),
    getCategoryBySlugFromDB(slug)
  ])

  if (!category) {
    notFound()
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Breadcrumb */}
      <nav className="mb-8" aria-label="Breadcrumb">
        <div className="flex items-center space-x-2 text-sm text-gray-500">
          <Link href="/" className="hover:text-primary-600 transition-colors">
            Home
          </Link>
          <span>/</span>
          <Link href="/categories" className="hover:text-primary-600 transition-colors">
            Categories
          </Link>
          <span>/</span>
          <span className="text-gray-900 font-medium">{category.name}</span>
        </div>
      </nav>

      {/* Category Header */}
      <div className="text-center mb-12">
        <div className="flex items-center justify-center mb-6">
          <div 
            className="w-16 h-16 rounded-xl flex items-center justify-center text-white text-2xl font-bold shadow-lg"
            style={{ backgroundColor: category.color }}
          >
            {category.icon || category.name.charAt(0)}
          </div>
        </div>
        
        <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
          {category.name}
        </h1>
        
        <p className="text-xl text-gray-600 max-w-2xl mx-auto mb-6">
          {category.description}
        </p>
        
        <div className="flex items-center justify-center gap-6 text-sm text-gray-500">
          <div className="flex items-center gap-2">
            <span className="font-medium text-primary-600">{posts.length}</span>
            <span>{posts.length === 1 ? 'Post' : 'Posts'}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="font-medium text-primary-600">3-5 min</span>
            <span>Average Read</span>
          </div>
        </div>
      </div>

      {/* Category Posts */}
      {posts.length > 0 ? (
        <BlogGrid 
          posts={posts} 
          columns={3}
          className="mb-12"
        />
      ) : (
        <div className="text-center py-16">
          <div 
            className="mx-auto w-24 h-24 rounded-xl flex items-center justify-center text-white text-3xl font-bold mb-6 shadow-lg"
            style={{ backgroundColor: category.color }}
          >
            {category.icon || category.name.charAt(0)}
          </div>
          <h3 className="text-xl font-medium text-gray-900 mb-2">No posts in {category.name} yet</h3>
          <p className="text-gray-500 mb-8">Check back soon for expert insights and practical tips!</p>
          <Link
            href="/blog"
            className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 transition-colors"
          >
            Browse All Posts
          </Link>
        </div>
      )}

      {/* Back Navigation */}
      <div className="text-center">
        <Link
          href="/categories"
          className="inline-flex items-center px-4 py-2 text-sm font-medium text-primary-600 hover:text-primary-700 transition-colors"
        >
          ← Back to all categories
        </Link>
      </div>
    </div>
  )
}