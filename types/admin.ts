// Admin panel TypeScript interfaces
import { Timestamp } from 'firebase/firestore'

// User roles and permissions
export type UserRole = 'admin' | 'editor' | 'author'

export interface AuthUser {
  uid: string
  email: string
  displayName: string
  role: UserRole
  permissions: string[]
  avatar?: string
  active: boolean
  createdAt: string
  lastLogin: string
}

export interface RolePermissions {
  admin: string[]
  editor: string[]
  author: string[]
}

// Firestore document interfaces
export interface FirestorePost {
  id?: string
  slug: string
  title: string
  description: string
  content: string
  excerpt: string
  
  // Metadata
  status: 'draft' | 'published' | 'scheduled' | 'archived'
  publishDate: Timestamp | Date
  createdAt: Timestamp | Date
  updatedAt: Timestamp | Date
  scheduledFor?: Timestamp | Date
  
  // Author & Category
  authorId: string
  categoryId: string
  
  // Content details
  featuredImage: {
    url: string
    alt: string
    width: number
    height: number
    storageRef: string
  }
  tags: string[]
  featured: boolean
  readingTime: number
  
  // SEO & Social
  seo: {
    metaTitle: string
    metaDescription: string
    keywords: string[]
    ogImage?: string
    canonicalUrl?: string
  }
  
  // Analytics
  views: number
  likes: number
  shares: number
  
  // Moderation
  moderationStatus: 'approved' | 'pending' | 'rejected'
  moderationNotes?: string
  lastModifiedBy: string
}

export interface FirestoreCategory {
  id?: string
  slug: string
  name: string
  description: string
  
  // Appearance
  color: string
  icon: string
  featuredImage?: string
  
  // Configuration
  featured: boolean
  active: boolean
  sortOrder: number
  
  // SEO
  seo: {
    title: string
    description: string
    keywords: string[]
  }
  
  // Hero section config
  hero: {
    title: string
    subtitle: string
    backgroundImage?: string
  }
  
  // Metadata
  createdAt: Timestamp | Date
  updatedAt: Timestamp | Date
  createdBy: string
  
  // Statistics
  postCount: number
  totalViews: number
}

export interface FirestoreUser {
  uid: string
  email: string
  displayName: string
  avatar?: string
  
  // Role & Permissions
  role: UserRole
  permissions: string[]
  active: boolean
  
  // Profile
  bio?: string
  expertise: string[]
  social: {
    twitter?: string
    linkedin?: string
    github?: string
    website?: string
  }
  
  // Metadata
  createdAt: Timestamp | Date
  lastLogin: Timestamp | Date
  joinDate: Timestamp | Date
  
  // Statistics
  postsCount: number
  draftsCount: number
  totalViews: number
}

export interface FirestoreMedia {
  id?: string
  filename: string
  originalName: string
  storageRef: string
  downloadUrl: string
  
  // File details
  mimeType: string
  size: number
  dimensions?: {
    width: number
    height: number
  }
  
  // Metadata
  uploadedBy: string
  uploadedAt: Timestamp | Date
  alt?: string
  caption?: string
  
  // Usage tracking
  usedInPosts: string[]
  usedInCategories: string[]
}

export interface FirestoreSiteConfig {
  id: 'main'
  siteName: string
  tagline: string
  description: string
  
  // SEO defaults
  defaultSEO: {
    title: string
    description: string
    keywords: string[]
    ogImage: string
  }
  
  // Social media
  socialMedia: {
    twitter?: string
    facebook?: string
    instagram?: string
    linkedin?: string
    youtube?: string
  }
  
  // Analytics
  googleAnalyticsId?: string
  googleTagManagerId?: string
  
  // Features
  features: {
    comments: boolean
    newsletter: boolean
    darkMode: boolean
    search: boolean
  }
  
  // Maintenance
  maintenanceMode: boolean
  maintenanceMessage?: string
  
  updatedAt: Timestamp | Date
  updatedBy: string
}

// API Response types
export interface ApiResponse<T = any> {
  success: boolean
  data?: T
  error?: string
  message?: string
}

export interface PaginatedResponse<T> {
  items: T[]
  pagination: {
    page: number
    limit: number
    total: number
    pages: number
    hasNext: boolean
    hasPrev: boolean
  }
}

// Filter types
export interface PostFilters {
  status?: string
  category?: string
  author?: string
  tags?: string[]
  dateRange?: {
    start: string
    end: string
  }
  featured?: boolean
  search?: string
}

export interface CategoryFilters {
  active?: boolean
  featured?: boolean
  search?: string
}

export interface UserFilters {
  role?: UserRole
  active?: boolean
  search?: string
}

export interface MediaFilters {
  mimeType?: string
  uploadedBy?: string
  dateRange?: {
    start: string
    end: string
  }
  search?: string
}

// Form types
export interface LoginFormData {
  email: string
  password: string
  rememberMe: boolean
}

export interface PostFormData {
  title: string
  description: string
  content: string
  excerpt: string
  slug: string
  categoryId: string
  tags: string[]
  featured: boolean
  featuredImage: {
    url: string
    alt: string
  }
  seo: {
    metaTitle: string
    metaDescription: string
    keywords: string[]
  }
  status: 'draft' | 'published' | 'scheduled'
  scheduledFor?: Date
}

export interface CategoryFormData {
  name: string
  description: string
  slug: string
  color: string
  icon: string
  featured: boolean
  active: boolean
  seo: {
    title: string
    description: string
    keywords: string[]
  }
  hero: {
    title: string
    subtitle: string
  }
}

export interface UserFormData {
  displayName: string
  email: string
  role: UserRole
  active: boolean
  bio?: string
  expertise: string[]
  social: {
    twitter?: string
    linkedin?: string
    github?: string
    website?: string
  }
}