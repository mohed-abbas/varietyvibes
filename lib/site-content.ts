import { HeroSection } from '@/types/ui'

export interface SiteStats {
  totalPosts: string
  categories: string
  readingTime: string
  updateFrequency: string
}

export interface SiteContent {
  hero: HeroSection
  stats: SiteStats
}

// Server-side function to fetch site content
export async function getSiteContent(): Promise<SiteContent> {
  try {
    // Instead of API call, directly query Firestore (more reliable for server-side)
    const { getFirestore, doc, getDoc, collection, getDocs, query, where } = await import('firebase/firestore')
    const { initializeApp, getApps } = await import('firebase/app')
    
    const firebaseConfig = {
      apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
      authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
      projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
      storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
      messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
      appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
    }
    
    const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0]
    const db = getFirestore(app)
    
    // Try to get site content from Firestore
    const heroRef = doc(db, 'site_content', 'hero')
    const statsRef = doc(db, 'site_content', 'stats')
    
    const [heroSnap, statsSnap] = await Promise.all([
      getDoc(heroRef),
      getDoc(statsRef)
    ])
    
    // Calculate real-time stats if not in database
    let stats
    if (statsSnap.exists()) {
      stats = statsSnap.data()
    } else {
      // Calculate from actual data
      const postsCollection = collection(db, 'posts')
      const categoriesCollection = collection(db, 'categories')
      
      const [postsSnap, categoriesSnap] = await Promise.all([
        getDocs(query(postsCollection, where('status', '==', 'published'))),
        getDocs(query(categoriesCollection, where('active', '==', true)))
      ])
      
      stats = {
        totalPosts: postsSnap.size > 0 ? `${postsSnap.size}+` : '0',
        categories: categoriesSnap.size > 0 ? `${categoriesSnap.size}+` : '0',
        readingTime: '3-5 min',
        updateFrequency: 'Daily'
      }
    }
    
    const hero = heroSnap.exists() ? heroSnap.data() : {
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
        { text: "Updated Daily", color: "green" },
        { text: "5+ Categories", color: "blue" }
      ]
    }
    
    return { hero, stats }
  } catch (error) {
    console.error('Error fetching site content:', error)
    
    // Return fallback content
    return {
      hero: {
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
      },
      stats: {
        totalPosts: '50+',
        categories: '5+',
        readingTime: '3-5 min',
        updateFrequency: 'Daily'
      }
    }
  }
}

// Client-side function to fetch site content
export async function fetchSiteContent(type?: 'hero' | 'stats'): Promise<any> {
  try {
    const url = type ? `/api/site-content?type=${type}` : '/api/site-content'
    const response = await fetch(url)
    
    if (!response.ok) {
      throw new Error('Failed to fetch site content')
    }
    
    const result = await response.json()
    return result.data
  } catch (error) {
    console.error('Error fetching site content:', error)
    throw error
  }
}

// Function to update site content (admin only)
export async function updateSiteContent(type: 'hero' | 'stats', data: any): Promise<void> {
  try {
    const response = await fetch('/api/site-content', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ type, data })
    })
    
    if (!response.ok) {
      throw new Error('Failed to update site content')
    }
  } catch (error) {
    console.error('Error updating site content:', error)
    throw error
  }
}