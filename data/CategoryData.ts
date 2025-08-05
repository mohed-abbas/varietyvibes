import { CategoryConfig, CategoryMeta } from '@/types/blog'

export const categoryConfigs: CategoryConfig[] = [
  {
    slug: "auto-insurance",
    name: "Auto Insurance",
    description: "Comprehensive guides for vehicle insurance, coverage options, and tips to save money on your auto insurance.",
    color: "#3B82F6",
    icon: "🚗",
    postCount: 0,
    featured: true,
    seo: {
      title: "Auto Insurance Guides & Tips | Variety Vibes",
      description: "Expert auto insurance guides covering coverage options, discounts, and tips to find the best rates for your vehicle insurance needs.",
      keywords: ["auto insurance", "car insurance", "vehicle coverage", "insurance tips"]
    },
    hero: {
      title: "Auto Insurance Guides",
      subtitle: "Navigate vehicle insurance with confidence",
      backgroundImage: "/images/categories/auto-insurance-hero.jpg"
    }
  },
  {
    slug: "health-insurance",
    name: "Health Insurance",
    description: "Essential health insurance information, coverage comparisons, and guidance for making the right healthcare decisions.",
    color: "#10B981",
    icon: "🏥",
    postCount: 0,
    featured: true,
    seo: {
      title: "Health Insurance Guide | Variety Vibes",
      description: "Complete health insurance guide covering Medicare, individual plans, and healthcare coverage options for all ages.",
      keywords: ["health insurance", "medicare", "healthcare", "medical coverage"]
    },
    hero: {
      title: "Health Insurance Guide",
      subtitle: "Your path to better healthcare coverage",
      backgroundImage: "/images/categories/health-insurance-hero.jpg"
    }
  },
  {
    slug: "home-improvement",
    name: "Home Improvement",
    description: "Transform your living space with expert home improvement tips, renovation guides, and DIY project ideas.",
    color: "#F59E0B",
    icon: "🏠",
    postCount: 0,
    featured: true,
    seo: {
      title: "Home Improvement Tips & Guides | Variety Vibes",
      description: "Expert home improvement advice covering renovations, DIY projects, energy efficiency, and interior design ideas.",
      keywords: ["home improvement", "renovation", "DIY", "home design"]
    },
    hero: {
      title: "Home Improvement",
      subtitle: "Transform your space with expert guidance",
      backgroundImage: "/images/categories/home-improvement-hero.jpg"
    }
  },
  {
    slug: "warranty",
    name: "Warranty",
    description: "Understanding product warranties, extended protection plans, and how to make the most of your coverage.",
    color: "#8B5CF6",
    icon: "🛡️",
    postCount: 0,
    featured: false,
    seo: {
      title: "Warranty & Protection Plans Guide | Variety Vibes",
      description: "Learn about product warranties, extended protection plans, and how to protect your valuable purchases.",
      keywords: ["warranty", "extended warranty", "protection plans", "consumer protection"]
    },
    hero: {
      title: "Warranty & Protection",
      subtitle: "Protect your investments with the right coverage",
      backgroundImage: "/images/categories/warranty-hero.jpg"
    }
  },
  {
    slug: "loans",
    name: "Loans",
    description: "Navigate the world of personal loans, mortgages, and financing options with expert guidance and tips.",
    color: "#EF4444",
    icon: "💰",
    postCount: 0,
    featured: true,
    seo: {
      title: "Loan Guides & Financial Advice | Variety Vibes",
      description: "Expert guidance on personal loans, mortgages, auto loans, and smart financing strategies for your financial goals.",
      keywords: ["loans", "mortgage", "personal loans", "financing", "credit"]
    },
    hero: {
      title: "Loan & Finance Guide",
      subtitle: "Smart financing for your financial goals",
      backgroundImage: "/images/categories/loans-hero.jpg"
    }
  }
]

export const categoryMeta: CategoryMeta = {
  defaultDescription: "Expert guides and insights to help you make informed decisions.",
  defaultColor: "#6B7280",
  defaultIcon: "📄",
  featuredLimit: 4,
  postsPerPage: 12,
  enableSearch: true,
  enableFiltering: true,
  sortOptions: [
    { value: "date", label: "Latest First" },
    { value: "title", label: "A-Z" },
    { value: "popular", label: "Most Popular" }
  ]
}

// Helper function to get category by slug
export const getCategoryBySlug = (slug: string): CategoryConfig | undefined => {
  return categoryConfigs.find(category => category.slug === slug)
}

// Helper function to get featured categories
export const getFeaturedCategories = (): CategoryConfig[] => {
  return categoryConfigs.filter(category => category.featured)
}

// Helper function to get all category slugs (for static generation)
export const getAllCategorySlugs = (): string[] => {
  return categoryConfigs.map(category => category.slug)
}