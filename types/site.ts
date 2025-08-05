// Site configuration and settings TypeScript interfaces

export interface SiteConfig {
  name: string
  description: string
  url: string
  baseUrl: string
  logo: string
  favicon: string
  author: string
  language: string
  locale: string
  timezone: string
  
  contact: {
    email: string
    phone: string
    address: string
  }

  social: {
    twitter: string
    facebook: string
    instagram: string
    linkedin: string
    youtube: string
  }

  features: {
    newsletter: boolean
    search: boolean
    comments: boolean
    darkMode: boolean
    rss: boolean
    sitemap: boolean
    robotsTxt: boolean
  }

  content: {
    postsPerPage: number
    excerptLength: number
    readingTimeWPM: number
    enableRelatedPosts: boolean
    relatedPostsCount: number
    enableTags: boolean
    enableCategories: boolean
    enableAuthors: boolean
  }
}

export interface SEOConfig {
  defaultTitle: string
  titleTemplate: string
  defaultDescription: string
  
  openGraph: {
    type: string
    locale: string
    url: string
    siteName: string
    images: {
      url: string
      width: number
      height: number
      alt: string
    }[]
  }

  twitter: {
    handle: string
    site: string
    cardType: string
  }

  additionalMetaTags: {
    name: string
    content: string
  }[]

  additionalLinkTags: {
    rel: string
    href: string
    sizes?: string
  }[]
}

export interface AnalyticsConfig {
  googleAnalytics: {
    enabled: boolean
    measurementId: string
  }
  
  googleTagManager: {
    enabled: boolean
    containerId: string
  }

  facebookPixel: {
    enabled: boolean
    pixelId: string
  }

  plausible: {
    enabled: boolean
    domain: string
  }
}

export interface PerformanceConfig {
  images: {
    domains: string[]
    formats: string[]
    quality: number
    sizes: Record<string, string>
  }

  cache: {
    staticAssets: number
    pages: number
    api: number
  }

  optimization: {
    removeConsole: boolean
    minimizeCSS: boolean
    compressImages: boolean
    generateSourceMaps: boolean
  }
}