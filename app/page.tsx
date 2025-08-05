import Link from 'next/link'
import { heroData, featuredStats } from '@/data'
import { getFeaturedPosts, getLatestPosts, getAllCategories } from '@/lib/blog'
import { BlogGrid, CategoryGrid } from '@/components/blog'

export default function Home() {
  const featuredPosts = getFeaturedPosts().slice(0, 3)
  const latestPosts = getLatestPosts(6)
  const categories = getAllCategories().slice(0, 4)
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Hero Section */}
      <section className="text-center py-12 bg-gradient-to-r from-primary-50 to-blue-50 rounded-lg mb-12">
        <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-4">
          {heroData.title}
        </h1>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto mb-8">
          {heroData.subtitle}
        </p>
        <p className="text-lg text-gray-500 max-w-3xl mx-auto mb-8">
          {heroData.description}
        </p>
        
        {/* Hero Badges */}
        {heroData.badges && heroData.badges.length > 0 && (
          <div className="flex flex-wrap justify-center gap-3 mb-8">
            {heroData.badges.map((badge, index) => (
              <span
                key={index}
                className={`px-3 py-1 rounded-full text-sm font-medium bg-${badge.color}-100 text-${badge.color}-800`}
              >
                {badge.text}
              </span>
            ))}
          </div>
        )}
        
        <Link
          href={heroData.ctaButton.href}
          className={`inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md transition-colors ${
            heroData.ctaButton.variant === 'primary'
              ? 'text-white bg-primary-600 hover:bg-primary-700'
              : heroData.ctaButton.variant === 'secondary'
              ? 'text-primary-600 bg-white hover:bg-gray-50 border-primary-600'
              : 'text-primary-600 bg-transparent hover:bg-primary-50 border-primary-600'
          }`}
        >
          {heroData.ctaButton.text}
        </Link>
      </section>

      {/* Featured Stats */}
      <section className="mb-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="text-center">
            <div className="text-3xl font-bold text-primary-600 mb-2">
              {featuredStats.totalPosts}
            </div>
            <div className="text-gray-600">
              Total Posts
            </div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-primary-600 mb-2">
              {featuredStats.categories}
            </div>
            <div className="text-gray-600">
              Categories
            </div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-primary-600 mb-2">
              {featuredStats.readingTime}
            </div>
            <div className="text-gray-600">
              Reading Time
            </div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-primary-600 mb-2">
              {featuredStats.updateFrequency}
            </div>
            <div className="text-gray-600">
              Updates
            </div>
          </div>
        </div>
      </section>

      {/* Featured Posts */}
      {featuredPosts.length > 0 && (
        <section className="mb-12">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-3xl font-bold text-gray-900">Featured Posts</h2>
            <Link
              href="/blog"
              className="text-primary-600 hover:text-primary-700 font-medium transition-colors"
            >
              View All →
            </Link>
          </div>
          <BlogGrid 
            posts={featuredPosts} 
            columns={3}
            variant="featured"
          />
        </section>
      )}

      {/* Categories */}
      <section className="mb-12">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-3xl font-bold text-gray-900">Explore Categories</h2>
          <Link
            href="/categories"
            className="text-primary-600 hover:text-primary-700 font-medium transition-colors"
          >
            View All →
          </Link>
        </div>
        <CategoryGrid categories={categories} columns={4} />
      </section>

      {/* Latest Posts */}
      <section className="mb-12">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-3xl font-bold text-gray-900">Latest Posts</h2>
          <Link
            href="/blog"
            className="text-primary-600 hover:text-primary-700 font-medium transition-colors"
          >
            View All →
          </Link>
        </div>
        <BlogGrid 
          posts={latestPosts} 
          columns={3}
        />
      </section>
    </div>
  )
}