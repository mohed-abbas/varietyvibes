import { HeroSection } from '@/types/ui'

export const heroData: HeroSection = {
  title: "Variety Vibes",
  subtitle: "Crafting insights and stories through daily content on various topics that matter to you",
  description: "Discover comprehensive guides, expert insights, and practical tips across multiple categories including insurance, home improvement, warranties, and more.",
  ctaButton: {
    text: "Explore All Posts",
    href: "/blog",
    variant: "primary"
  },
  backgroundImage: "/images/hero/hero-bg.jpg",
  badges: [
    {
      text: "Updated Daily",
      color: "green"
    },
    {
      text: "5+ Categories",
      color: "blue"
    }
  ]
}

export const featuredStats = {
  totalPosts: "50+",
  categories: "5+",
  readingTime: "3-5 min",
  updateFrequency: "Daily"
}