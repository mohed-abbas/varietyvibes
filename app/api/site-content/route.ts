import { NextRequest, NextResponse } from 'next/server'
import { getFirestore, doc, getDoc, setDoc, collection, getDocs, query, where, orderBy, limit } from 'firebase/firestore'
import { initializeApp, getApps } from 'firebase/app'

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

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type') // 'hero' or 'stats'
    
    if (type && ['hero', 'stats'].includes(type)) {
      // Get specific content type
      const docRef = doc(db, 'site_content', type)
      const docSnap = await getDoc(docRef)
      
      if (docSnap.exists()) {
        return NextResponse.json({ data: docSnap.data() })
      } else {
        // Return default values if document doesn't exist
        const defaultData = await getDefaultSiteContent(type)
        return NextResponse.json({ data: defaultData })
      }
    } else {
      // Get all site content
      const heroRef = doc(db, 'site_content', 'hero')
      const statsRef = doc(db, 'site_content', 'stats')
      
      const [heroSnap, statsSnap] = await Promise.all([
        getDoc(heroRef),
        getDoc(statsRef)
      ])
      
      // Calculate real-time stats from the database
      const realTimeStats = await calculateRealTimeStats()
      
      return NextResponse.json({
        data: {
          hero: heroSnap.exists() ? heroSnap.data() : await getDefaultSiteContent('hero'),
          stats: statsSnap.exists() ? statsSnap.data() : realTimeStats
        }
      })
    }
  } catch (error) {
    console.error('Error fetching site content:', error)
    return NextResponse.json(
      { error: 'Failed to fetch site content' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { type, data } = body
    
    if (!type || !['hero', 'stats'].includes(type)) {
      return NextResponse.json(
        { error: 'Invalid content type' },
        { status: 400 }
      )
    }
    
    // Update the document
    const docRef = doc(db, 'site_content', type)
    await setDoc(docRef, {
      ...data,
      updatedAt: new Date().toISOString()
    }, { merge: true })
    
    return NextResponse.json({ 
      message: `Site ${type} content updated successfully`,
      data 
    })
  } catch (error) {
    console.error('Error updating site content:', error)
    return NextResponse.json(
      { error: 'Failed to update site content' },
      { status: 500 }
    )
  }
}

// Helper function to calculate real-time stats
async function calculateRealTimeStats() {
  try {
    const postsCollection = collection(db, 'posts')
    const categoriesCollection = collection(db, 'categories')
    
    // Get posts count
    const postsQuery = query(postsCollection, where('status', '==', 'published'))
    const postsSnap = await getDocs(postsQuery)
    const totalPosts = postsSnap.size
    
    // Get categories count
    const categoriesQuery = query(categoriesCollection, where('active', '==', true))
    const categoriesSnap = await getDocs(categoriesQuery)
    const totalCategories = categoriesSnap.size
    
    // Calculate average reading time
    let totalReadingTime = 0
    let postCount = 0
    
    postsSnap.forEach(doc => {
      const post = doc.data()
      if (post.readingTime) {
        totalReadingTime += post.readingTime
        postCount++
      }
    })
    
    const avgReadingTime = postCount > 0 ? Math.round(totalReadingTime / postCount) : 5
    
    return {
      totalPosts: totalPosts > 0 ? `${totalPosts}+` : '0',
      categories: totalCategories > 0 ? `${totalCategories}+` : '0',
      readingTime: `${avgReadingTime} min`,
      updateFrequency: 'Daily'
    }
  } catch (error) {
    console.error('Error calculating real-time stats:', error)
    // Return fallback stats
    return {
      totalPosts: '50+',
      categories: '5+',
      readingTime: '3-5 min',
      updateFrequency: 'Daily'
    }
  }
}

// Helper function to get default site content
async function getDefaultSiteContent(type: string) {
  if (type === 'hero') {
    return {
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
  }
  
  // For stats, always return calculated real-time stats
  return await calculateRealTimeStats()
}