import { FooterSection, SocialLink } from '@/types/ui'

export const footerSections: FooterSection[] = [
  {
    title: "About Variety Vibes",
    links: [
      {
        name: "Our Mission",
        href: "/about",
        description: "Learn about our commitment to providing quality content"
      },
      {
        name: "Editorial Team",
        href: "/about/team",
        description: "Meet our expert writers and editors"
      },
      {
        name: "Content Guidelines",
        href: "/about/guidelines",
        description: "Our standards for quality content"
      },
      {
        name: "Contact Us",
        href: "/contact",
        description: "Get in touch with our team"
      }
    ]
  },
  {
    title: "Categories",
    links: [
      {
        name: "Auto Insurance",
        href: "/category/auto-insurance",
        description: "Vehicle insurance guides and tips"
      },
      {
        name: "Health Insurance",
        href: "/category/health-insurance",
        description: "Healthcare coverage information"
      },
      {
        name: "Home Improvement",
        href: "/category/home-improvement",
        description: "Home renovation and maintenance"
      },
      {
        name: "Warranty",
        href: "/category/warranty",
        description: "Product protection and warranties"
      },
      {
        name: "Loans",
        href: "/category/loans",
        description: "Financial guidance and loan information"
      }
    ]
  },
  {
    title: "Resources",
    links: [
      {
        name: "Blog",
        href: "/blog",
        description: "All our latest articles"
      },
      {
        name: "Popular Posts",
        href: "/blog?sort=popular",
        description: "Most read articles"
      },
      {
        name: "Newsletter",
        href: "/newsletter",
        description: "Subscribe to our updates"
      },
      {
        name: "RSS Feed",
        href: "/feed.xml",
        description: "Stay updated with RSS"
      }
    ]
  },
  {
    title: "Legal",
    links: [
      {
        name: "Privacy Policy",
        href: "/privacy-policy",
        description: "How we protect your privacy"
      },
      {
        name: "Terms of Service",
        href: "/terms",
        description: "Terms and conditions"
      },
      {
        name: "Cookie Policy",
        href: "/cookies",
        description: "Our cookie usage policy"
      },
      {
        name: "Disclaimer",
        href: "/disclaimer",
        description: "Important disclaimers"
      }
    ]
  }
]

export const socialLinks: SocialLink[] = [
  {
    name: "Twitter",
    href: "https://twitter.com/varietyvibes",
    icon: "twitter",
    color: "#1DA1F2"
  },
  {
    name: "Facebook",
    href: "https://facebook.com/varietyvibes",
    icon: "facebook",
    color: "#1877F2"
  },
  {
    name: "LinkedIn",
    href: "https://linkedin.com/company/varietyvibes",
    icon: "linkedin",
    color: "#0A66C2"
  },
  {
    name: "Instagram",
    href: "https://instagram.com/varietyvibes",
    icon: "instagram",
    color: "#E4405F"
  },
  {
    name: "YouTube",
    href: "https://youtube.com/@varietyvibes",
    icon: "youtube",
    color: "#FF0000"
  }
]

export const footerConfig = {
  showNewsletter: true,
  showSocialLinks: true,
  showBackToTop: true,
  copyrightText: "© 2024 Variety Vibes. All rights reserved.",
  companyInfo: {
    name: "Variety Vibes",
    description: "Crafting insights and stories through daily content on various topics that matter to you.",
    address: "Your Address Here",
    email: "hello@varietyvibes.com",
    phone: "+1 (555) 123-4567"
  }
}

export const newsletterData = {
  title: "Stay Updated",
  description: "Get the latest insights and stories delivered directly to your inbox.",
  placeholder: "Enter your email address",
  buttonText: "Subscribe",
  successMessage: "Thanks for subscribing! Check your email to confirm.",
  errorMessage: "Something went wrong. Please try again."
}