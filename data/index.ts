// Central export file for all static data
// This provides a single import point for all data files

// Hero and Homepage Data
export { heroData, featuredStats } from './HeroData'

// Navigation Data
export { navigationData, mobileMenuConfig, brandData } from './NavigationData'

// Footer Data
export { 
  footerSections, 
  socialLinks, 
  footerConfig, 
  newsletterData 
} from './FooterData'

// Category Data
export { 
  categoryConfigs, 
  categoryMeta,
  getCategoryBySlug,
  getFeaturedCategories,
  getAllCategorySlugs
} from './CategoryData'

// Author Data
export { 
  authors, 
  authorConfig,
  getAuthorById,
  getAllAuthors,
  getAuthorsByExpertise,
  getTopAuthors
} from './AuthorData'

// Site Configuration
export { 
  siteConfig, 
  seoConfig, 
  analyticsConfig, 
  performanceConfig 
} from './SiteConfig'

// Re-export types for convenience
export type { HeroSection, NavigationItem, FooterSection, SocialLink } from '@/types/ui'
export type { CategoryConfig, Author } from '@/types/blog'
export type { SiteConfig, SEOConfig, AnalyticsConfig } from '@/types/site'