import { SiteConfig, SEOConfig, AnalyticsConfig } from '@/types/site'

export const siteConfig: SiteConfig = {
  name: "Variety Vibes",
  description: "Crafting insights and stories through daily content on various topics that matter to you.",
  url: "https://varietyvibes.com",
  baseUrl: process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000",
  logo: "/images/logo/logo.svg",
  favicon: "/favicon.ico",
  author: "Variety Vibes Editorial Team",
  language: "en",
  locale: "en_US",
  timezone: "UTC",
  
  // Contact Information
  contact: {
    email: "hello@varietyvibes.com",
    phone: "+1 (555) 123-4567",
    address: "123 Content Street, Blog City, BC 12345"
  },

  // Social Media
  social: {
    twitter: "@varietyvibes",
    facebook: "varietyvibes",
    instagram: "varietyvibes",
    linkedin: "company/varietyvibes",
    youtube: "@varietyvibes"
  },

  // Features
  features: {
    newsletter: true,
    search: true,
    comments: false,
    darkMode: false,
    rss: true,
    sitemap: true,
    robotsTxt: true
  },

  // Content Settings
  content: {
    postsPerPage: 12,
    excerptLength: 160,
    readingTimeWPM: 200,
    enableRelatedPosts: true,
    relatedPostsCount: 3,
    enableTags: true,
    enableCategories: true,
    enableAuthors: true
  }
}

export const seoConfig: SEOConfig = {
  defaultTitle: "Variety Vibes - Daily Insights & Stories",
  titleTemplate: "%s | Variety Vibes",
  defaultDescription: "Discover comprehensive guides, expert insights, and practical tips across multiple categories including insurance, home improvement, warranties, and more.",
  
  openGraph: {
    type: "website",
    locale: "en_US",
    url: siteConfig.url,
    siteName: siteConfig.name,
    images: [
      {
        url: "/images/og/default-og.jpg",
        width: 1200,
        height: 630,
        alt: "Variety Vibes - Daily Insights & Stories"
      }
    ]
  },

  twitter: {
    handle: "@varietyvibes",
    site: "@varietyvibes",
    cardType: "summary_large_image"
  },

  additionalMetaTags: [
    {
      name: "viewport",
      content: "width=device-width, initial-scale=1"
    },
    {
      name: "theme-color",
      content: "#3B82F6"
    },
    {
      name: "application-name",
      content: siteConfig.name
    },
    {
      name: "apple-mobile-web-app-title",
      content: siteConfig.name
    }
  ],

  additionalLinkTags: [
    {
      rel: "icon",
      href: "/favicon.ico"
    },
    {
      rel: "apple-touch-icon",
      href: "/icons/apple-touch-icon.png",
      sizes: "180x180"
    },
    {
      rel: "manifest",
      href: "/manifest.json"
    }
  ]
}

export const analyticsConfig: AnalyticsConfig = {
  googleAnalytics: {
    enabled: false,
    measurementId: process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID || ""
  },
  
  googleTagManager: {
    enabled: false,
    containerId: process.env.NEXT_PUBLIC_GTM_CONTAINER_ID || ""
  },

  facebookPixel: {
    enabled: false,
    pixelId: process.env.NEXT_PUBLIC_FB_PIXEL_ID || ""
  },

  plausible: {
    enabled: false,
    domain: process.env.NEXT_PUBLIC_PLAUSIBLE_DOMAIN || ""
  }
}

export const performanceConfig = {
  // Image optimization
  images: {
    domains: ["localhost", "varietyvibes.com"],
    formats: ["image/avif", "image/webp"],
    quality: 85,
    sizes: {
      thumbnail: "(max-width: 768px) 100vw, 200px",
      card: "(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw",
      hero: "100vw",
      full: "100vw"
    }
  },

  // Caching
  cache: {
    staticAssets: 31536000, // 1 year
    pages: 3600, // 1 hour
    api: 300 // 5 minutes
  },

  // Bundle optimization
  optimization: {
    removeConsole: process.env.NODE_ENV === "production",
    minimizeCSS: true,
    compressImages: true,
    generateSourceMaps: process.env.NODE_ENV === "development"
  }
}