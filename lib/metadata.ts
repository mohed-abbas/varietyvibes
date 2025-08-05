import { Metadata } from 'next'
import { BlogPost } from '@/types/blog'

export function generateBlogPostMetadata(post: BlogPost): Metadata {
  return {
    title: `${post.title} | Variety Vibes`,
    description: post.description,
    openGraph: {
      title: post.title,
      description: post.description,
      images: [post.image],
      type: 'article',
      publishedTime: post.date,
      authors: [post.author],
      tags: post.tags,
    },
    twitter: {
      card: 'summary_large_image',
      title: post.title,
      description: post.description,
      images: [post.image],
    },
  }
}

export function generateCategoryMetadata(categoryName: string, description: string): Metadata {
  return {
    title: `${categoryName} | Variety Vibes`,
    description: `${description} - Discover articles and insights about ${categoryName.toLowerCase()}.`,
    openGraph: {
      title: `${categoryName} | Variety Vibes`,
      description: `${description} - Discover articles and insights about ${categoryName.toLowerCase()}.`,
      type: 'website',
    },
    twitter: {
      card: 'summary',
      title: `${categoryName} | Variety Vibes`,
      description: `${description} - Discover articles and insights about ${categoryName.toLowerCase()}.`,
    },
  }
}

export function generatePageMetadata(title: string, description: string): Metadata {
  return {
    title: `${title} | Variety Vibes`,
    description,
    openGraph: {
      title: `${title} | Variety Vibes`,
      description,
      type: 'website',
    },
    twitter: {
      card: 'summary',
      title: `${title} | Variety Vibes`,
      description,
    },
  }
}