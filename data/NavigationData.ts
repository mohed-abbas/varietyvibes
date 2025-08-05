import { NavigationItem, MobileMenuConfig } from '@/types/ui'

export const navigationData: NavigationItem[] = [
  {
    name: 'Home',
    href: '/',
    current: false,
    description: 'Welcome to Variety Vibes'
  },
  {
    name: 'Blog',
    href: '/blog',
    current: false,
    description: 'Browse all blog posts',
    children: [
      {
        name: 'All Posts',
        href: '/blog',
        current: false,
        description: 'View all blog posts'
      },
      {
        name: 'Featured',
        href: '/blog?featured=true',
        current: false,
        description: 'Featured articles'
      },
      {
        name: 'Recent',
        href: '/blog?sort=recent',
        current: false,
        description: 'Latest posts'
      }
    ]
  },
  {
    name: 'Categories',
    href: '/categories',
    current: false,
    description: 'Browse by category',
    children: [
      {
        name: 'Auto Insurance',
        href: '/category/auto-insurance',
        current: false,
        description: 'Auto insurance guides and tips',
        icon: '🚗'
      },
      {
        name: 'Health Insurance',
        href: '/category/health-insurance',
        current: false,
        description: 'Health insurance information',
        icon: '🏥'
      },
      {
        name: 'Home Improvement',
        href: '/category/home-improvement',
        current: false,
        description: 'Home renovation and improvement',
        icon: '🏠'
      },
      {
        name: 'Warranty',
        href: '/category/warranty',
        current: false,
        description: 'Product warranties and protection',
        icon: '🛡️'
      },
      {
        name: 'Loans',
        href: '/category/loans',
        current: false,
        description: 'Loan guides and financial advice',
        icon: '💰'
      }
    ]
  },
  {
    name: 'About',
    href: '/about',
    current: false,
    description: 'Learn about our mission'
  },
  {
    name: 'Contact',
    href: '/contact',
    current: false,
    description: 'Get in touch with us'
  }
]

export const mobileMenuConfig: MobileMenuConfig = {
  showSearch: true,
  showCategories: true,
  showSocialLinks: true,
  closeOnNavigate: true
}

export const brandData = {
  name: "Variety Vibes",
  logo: "/images/logo/logo.svg",
  tagline: "Daily Insights & Stories",
  description: "Your trusted source for comprehensive guides and expert insights across multiple topics."
}