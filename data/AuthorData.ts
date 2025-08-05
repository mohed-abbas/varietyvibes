import { Author } from '@/types/blog'

export const authors: Record<string, Author> = {
  "jane-smith": {
    id: "jane-smith",
    name: "Jane Smith",
    bio: "Jane is a certified insurance advisor with over 10 years of experience helping individuals and families navigate complex insurance decisions. She specializes in health and auto insurance planning.",
    avatar: "/images/authors/jane-smith.jpg",
    role: "Insurance Expert",
    expertise: ["Health Insurance", "Auto Insurance", "Financial Planning"],
    social: {
      twitter: "https://twitter.com/janesmith_insurance",
      linkedin: "https://linkedin.com/in/jane-smith-insurance",
      email: "jane@varietyvibes.com"
    },
    joinDate: "2023-01-15",
    articleCount: 45,
    verified: true
  },
  "mike-johnson": {
    id: "mike-johnson",
    name: "Mike Johnson",
    bio: "Mike is a home improvement contractor and interior designer with 15+ years of experience. He loves sharing practical DIY tips and renovation advice with homeowners.",
    avatar: "/images/authors/mike-johnson.jpg",
    role: "Home Improvement Expert",
    expertise: ["Home Renovation", "DIY Projects", "Interior Design"],
    social: {
      instagram: "https://instagram.com/mikejohnson_home",
      linkedin: "https://linkedin.com/in/mike-johnson-contractor",
      email: "mike@varietyvibes.com"
    },
    joinDate: "2023-02-20",
    articleCount: 38,
    verified: true
  },
  "sarah-wilson": {
    id: "sarah-wilson",
    name: "Sarah Wilson",
    bio: "Sarah is a financial advisor and loan specialist who helps people understand their financing options. She has worked with major banks and financial institutions for over 8 years.",
    avatar: "/images/authors/sarah-wilson.jpg",
    role: "Financial Advisor",
    expertise: ["Mortgages", "Personal Loans", "Credit Management"],
    social: {
      twitter: "https://twitter.com/sarahwilson_finance",
      linkedin: "https://linkedin.com/in/sarah-wilson-finance",
      email: "sarah@varietyvibes.com"
    },
    joinDate: "2023-03-10",
    articleCount: 32,
    verified: true
  },
  "david-brown": {
    id: "david-brown",
    name: "David Brown",
    bio: "David is a consumer protection advocate and warranty specialist. He helps consumers understand their rights and make informed decisions about extended warranties and protection plans.",
    avatar: "/images/authors/david-brown.jpg",
    role: "Consumer Protection Expert",
    expertise: ["Warranties", "Consumer Rights", "Product Protection"],
    social: {
      linkedin: "https://linkedin.com/in/david-brown-consumer",
      email: "david@varietyvibes.com"
    },
    joinDate: "2023-04-05",
    articleCount: 28,
    verified: true
  },
  "editorial-team": {
    id: "editorial-team",
    name: "Editorial Team",
    bio: "Our editorial team consists of experienced writers and subject matter experts who collaborate to bring you the most accurate and helpful content across all our categories.",
    avatar: "/images/authors/editorial-team.jpg",
    role: "Editorial Team",
    expertise: ["Content Creation", "Research", "Fact Checking"],
    social: {
      email: "editorial@varietyvibes.com"
    },
    joinDate: "2023-01-01",
    articleCount: 15,
    verified: true
  }
}

export const authorConfig = {
  defaultAuthor: "editorial-team",
  showAuthorBio: true,
  showAuthorArticles: true,
  showSocialLinks: true,
  enableAuthorPages: true,
  articlesPerAuthorPage: 12
}

// Helper functions
export const getAuthorById = (id: string): Author | undefined => {
  return authors[id]
}

export const getAllAuthors = (): Author[] => {
  return Object.values(authors)
}

export const getAuthorsByExpertise = (expertise: string): Author[] => {
  return Object.values(authors).filter(author => 
    author.expertise.some(exp => 
      exp.toLowerCase().includes(expertise.toLowerCase())
    )
  )
}

export const getTopAuthors = (limit: number = 5): Author[] => {
  return Object.values(authors)
    .sort((a, b) => b.articleCount - a.articleCount)
    .slice(0, limit)
}