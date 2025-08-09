import { getPostBySlugFromDB, getAllPostsFromDB } from '@/lib/blog-db'
import { generateBlogPostMetadata } from '@/lib/metadata'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { formatDistanceToNow } from 'date-fns'
import { Metadata } from 'next'
// import { MDXRemote } from 'next-mdx-remote/rsc'

interface BlogPostPageProps {
  params: Promise<{
    slug: string
  }>
}

// Generate static params for all blog posts
export async function generateStaticParams() {
  const posts = await getAllPostsFromDB()
  return posts.map((post) => ({
    slug: post.slug,
  }))
}

// Generate metadata for SEO
export async function generateMetadata({ params }: BlogPostPageProps): Promise<Metadata> {
  const { slug } = await params
  const post = await getPostBySlugFromDB(slug)
  
  if (!post) {
    return {
      title: 'Post Not Found | Variety Vibes'
    }
  }

  return generateBlogPostMetadata(post)
}

export default async function BlogPostPage({ params }: BlogPostPageProps) {
  const { slug } = await params
  const post = await getPostBySlugFromDB(slug)

  if (!post) {
    notFound()
  }

  return (
    <article className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Breadcrumb */}
      <nav className="mb-8" aria-label="Breadcrumb">
        <div className="flex items-center space-x-2 text-sm text-gray-500">
          <Link href="/" className="hover:text-primary-600 transition-colors">
            Home
          </Link>
          <span>/</span>
          <Link href="/blog" className="hover:text-primary-600 transition-colors">
            Blog
          </Link>
          <span>/</span>
          <span className="text-gray-900 font-medium">{post.title}</span>
        </div>
      </nav>

      {/* Header */}
      <header className="mb-8">
        <div className="mb-4">
          <Link 
            href={`/category/${post.category}`}
            className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-primary-100 text-primary-800 hover:bg-primary-200 transition-colors"
          >
            {post.category.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}
          </Link>
        </div>
        
        <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4 leading-tight">
          {post.title}
        </h1>
        
        <p className="text-xl text-gray-600 mb-6 leading-relaxed">
          {post.description}
        </p>
        
        <div className="flex items-center gap-4 text-sm text-gray-500 mb-8 pb-8 border-b border-gray-200">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center">
              <span className="text-primary-600 font-medium text-sm">
                {post.author ? post.author.charAt(0).toUpperCase() : 'A'}
              </span>
            </div>
            <span className="font-medium text-gray-900">{post.author || 'Anonymous'}</span>
          </div>
          <span>•</span>
          <span>{formatDistanceToNow(new Date(post.date), { addSuffix: true })}</span>
          <span>•</span>
          <span>{post.readingTime} min read</span>
          {post.featured && (
            <>
              <span>•</span>
              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                Featured
              </span>
            </>
          )}
        </div>
      </header>

      {/* Featured Image Placeholder */}
      <div className="relative h-64 md:h-96 w-full mb-8 rounded-lg overflow-hidden bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center">
        <div className="text-gray-500 text-lg font-medium">
          {post.title}
        </div>
      </div>

      {/* Content */}
      <div className="prose prose-lg max-w-none mb-12">
        <div className="whitespace-pre-wrap text-gray-900 leading-relaxed">
          {post.content}
        </div>
      </div>

      {/* Tags */}
      {post.tags && post.tags.length > 0 && (
        <div className="mb-8 pt-8 border-t border-gray-200">
          <h3 className="text-sm font-medium text-gray-900 mb-3">Tagged with:</h3>
          <div className="flex flex-wrap gap-2">
            {post.tags.map((tag) => (
              <span
                key={tag}
                className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors"
              >
                #{tag}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Navigation */}
      <div className="pt-8 border-t border-gray-200">
        <div className="flex justify-between items-center">
          <Link
            href="/blog"
            className="inline-flex items-center px-4 py-2 text-sm font-medium text-primary-600 hover:text-primary-700 transition-colors"
          >
            ← Back to all posts
          </Link>
          <Link
            href={`/category/${post.category}`}
            className="inline-flex items-center px-4 py-2 text-sm font-medium text-primary-600 hover:text-primary-700 transition-colors"
          >
            More in {post.category.replace('-', ' ')} →
          </Link>
        </div>
      </div>
    </article>
  )
}