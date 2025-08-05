// Blog-related TypeScript interfaces

export interface BlogPost {
  slug: string
  title: string
  description: string
  date: string
  author: string
  category: string
  image: string
  tags: string[]
  featured: boolean
  content: string
  readingTime: number
}

export interface Category {
  slug: string
  name: string
  description: string
  color: string
  icon: string
  postCount: number
}

export interface CategoryConfig extends Category {
  featured: boolean
  seo: {
    title: string
    description: string
    keywords: string[]
  }
  hero: {
    title: string
    subtitle: string
    backgroundImage: string
  }
}

export interface CategoryMeta {
  defaultDescription: string
  defaultColor: string
  defaultIcon: string
  featuredLimit: number
  postsPerPage: number
  enableSearch: boolean
  enableFiltering: boolean
  sortOptions: {
    value: string
    label: string
  }[]
}

export interface Author {
  id: string
  name: string
  bio: string
  avatar: string
  role: string
  expertise: string[]
  social: {
    twitter?: string
    linkedin?: string
    instagram?: string
    github?: string
    website?: string
    email?: string
  }
  joinDate: string
  articleCount: number
  verified: boolean
}

export interface BlogCardProps {
  post: BlogPost
  variant?: 'default' | 'featured' | 'minimal'
  showCategory?: boolean
  showAuthor?: boolean
  showDate?: boolean
  showReadingTime?: boolean
  className?: string
}

export interface BlogGridProps {
  posts: BlogPost[]
  columns?: 1 | 2 | 3 | 4
  showLoadMore?: boolean
  className?: string
}

export interface CategoryGridProps {
  categories: Category[]
  columns?: 2 | 3 | 4
  showPostCount?: boolean
  className?: string
}

export interface SearchFilters {
  query?: string
  category?: string
  author?: string
  tags?: string[]
  dateRange?: {
    start: string
    end: string
  }
  featured?: boolean
}

export interface PaginationProps {
  currentPage: number
  totalPages: number
  onPageChange: (page: number) => void
  showPrevNext?: boolean
  showFirstLast?: boolean
  maxVisiblePages?: number
}

export interface RelatedPost {
  slug: string
  title: string
  image: string
  category: string
  readingTime: number
}

export interface PostNavigation {
  previous?: {
    slug: string
    title: string
  }
  next?: {
    slug: string
    title: string
  }
}