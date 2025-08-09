import { getFirestore, collection, query, where, orderBy, limit as firestoreLimit, getDocs, doc, getDoc } from 'firebase/firestore'
import { initializeApp, getApps } from 'firebase/app'
import { BlogPost, Category } from '@/types/blog'
import { FirestorePost, FirestoreCategory } from '@/types/admin'
import { getCachedOrFetch, CACHE_KEYS, CACHE_TTL } from '@/lib/cache'

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

// Convert Firestore post to BlogPost format
function convertFirestorePostToBlogPost(firestorePost: FirestorePost & { id: string }): BlogPost {
  // Convert Firestore timestamp to ISO string
  const dateField = firestorePost.publishedAt || firestorePost.createdAt
  let dateString: string
  
  if (dateField && typeof dateField === 'object' && 'toDate' in dateField) {
    // Firestore Timestamp object
    dateString = (dateField as any).toDate().toISOString()
  } else if (dateField && typeof dateField === 'string') {
    // Already a string
    dateString = dateField
  } else {
    // Fallback to current date
    dateString = new Date().toISOString()
  }
  
  return {
    slug: firestorePost.slug,
    title: firestorePost.title,
    description: firestorePost.description,
    content: firestorePost.content,
    excerpt: firestorePost.excerpt,
    date: dateString,
    category: firestorePost.categoryId, // Will need to resolve to category slug
    tags: firestorePost.tags || [],
    author: firestorePost.authorId || 'Anonymous', // Fallback for undefined authorId
    featured: firestorePost.featured || false,
    image: firestorePost.featuredImage?.url || '',
    readingTime: firestorePost.readingTime || 5,
    views: firestorePost.views || 0,
    likes: firestorePost.likes || 0
  }
}

// Convert Firestore category to Category format
function convertFirestoreCategoryToCategory(firestoreCategory: FirestoreCategory & { id: string }, postCount: number = 0): Category {
  return {
    slug: firestoreCategory.slug,
    name: firestoreCategory.name,
    description: firestoreCategory.description,
    color: firestoreCategory.color,
    icon: firestoreCategory.icon,
    postCount
  }
}

export async function getAllPostsFromDB(): Promise<BlogPost[]> {
  return getCachedOrFetch(
    CACHE_KEYS.ALL_POSTS,
    async () => {
      try {
        const postsCollection = collection(db, 'posts')
        const q = query(
          postsCollection,
          where('status', '==', 'published')
          // orderBy('publishedAt', 'desc') - Temporarily removed, sorting in JS below
        )
        
        const querySnapshot = await getDocs(q)
        const posts: BlogPost[] = []
        
        for (const docSnap of querySnapshot.docs) {
          const postData = { id: docSnap.id, ...docSnap.data() } as FirestorePost & { id: string }
          const blogPost = convertFirestorePostToBlogPost(postData)
          
          // Resolve category slug
          if (postData.categoryId) {
            const categoryDoc = await getDoc(doc(db, 'categories', postData.categoryId))
            if (categoryDoc.exists()) {
              const categoryData = categoryDoc.data() as FirestoreCategory
              blogPost.category = categoryData.slug
            }
          }
          
          posts.push(blogPost)
        }
        
        // Sort by publishedAt descending since we removed orderBy from query
        posts.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
        
        return posts
      } catch (error) {
        console.error('Error fetching posts from database:', error)
        return []
      }
    },
    CACHE_TTL.MEDIUM
  )
}

export async function getPostBySlugFromDB(slug: string): Promise<BlogPost | null> {
  return getCachedOrFetch(
    CACHE_KEYS.POST_BY_SLUG(slug),
    async () => {
      try {
        const postsCollection = collection(db, 'posts')
        const q = query(
          postsCollection,
          where('slug', '==', slug),
          where('status', '==', 'published'),
          firestoreLimit(1)
        )
        
        const querySnapshot = await getDocs(q)
        
        if (querySnapshot.empty) {
          return null
        }
        
        const docSnap = querySnapshot.docs[0]
        const postData = { id: docSnap.id, ...docSnap.data() } as FirestorePost & { id: string }
        const blogPost = convertFirestorePostToBlogPost(postData)
        
        // Resolve category slug
        if (postData.categoryId) {
          const categoryDoc = await getDoc(doc(db, 'categories', postData.categoryId))
          if (categoryDoc.exists()) {
            const categoryData = categoryDoc.data() as FirestoreCategory
            blogPost.category = categoryData.slug
          }
        }
        
        return blogPost
      } catch (error) {
        console.error(`Error fetching post ${slug} from database:`, error)
        return null
      }
    },
    CACHE_TTL.LONG
  )
}

export async function getPostsByCategoryFromDB(categorySlug: string): Promise<BlogPost[]> {
  try {
    // First, find the category by slug
    const categoriesCollection = collection(db, 'categories')
    const categoryQuery = query(
      categoriesCollection,
      where('slug', '==', categorySlug),
      where('active', '==', true),
      firestoreLimit(1)
    )
    
    const categorySnapshot = await getDocs(categoryQuery)
    if (categorySnapshot.empty) {
      return []
    }
    
    const categoryId = categorySnapshot.docs[0].id
    
    // Then find posts in that category
    const postsCollection = collection(db, 'posts')
    const postsQuery = query(
      postsCollection,
      where('categoryId', '==', categoryId),
      where('status', '==', 'published')
      // orderBy('publishedAt', 'desc') - Temporarily removed, sorting in JS below
    )
    
    const postsSnapshot = await getDocs(postsQuery)
    const posts: BlogPost[] = []
    
    for (const docSnap of postsSnapshot.docs) {
      const postData = { id: docSnap.id, ...docSnap.data() } as FirestorePost & { id: string }
      const blogPost = convertFirestorePostToBlogPost(postData)
      blogPost.category = categorySlug // We already know the category slug
      posts.push(blogPost)
    }
    
    // Sort by publishedAt descending since we removed orderBy from query
    posts.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    
    return posts
  } catch (error) {
    console.error(`Error fetching posts for category ${categorySlug}:`, error)
    return []
  }
}

export async function getFeaturedPostsFromDB(): Promise<BlogPost[]> {
  return getCachedOrFetch(
    CACHE_KEYS.FEATURED_POSTS,
    async () => {
      try {
        const postsCollection = collection(db, 'posts')
        const q = query(
          postsCollection,
          where('status', '==', 'published'),
          where('featured', '==', true)
          // orderBy('publishedAt', 'desc') - Temporarily removed, sorting in JS below
        )
        
        const querySnapshot = await getDocs(q)
        const posts: BlogPost[] = []
        
        for (const docSnap of querySnapshot.docs) {
          const postData = { id: docSnap.id, ...docSnap.data() } as FirestorePost & { id: string }
          const blogPost = convertFirestorePostToBlogPost(postData)
          
          // Resolve category slug
          if (postData.categoryId) {
            const categoryDoc = await getDoc(doc(db, 'categories', postData.categoryId))
            if (categoryDoc.exists()) {
              const categoryData = categoryDoc.data() as FirestoreCategory
              blogPost.category = categoryData.slug
            }
          }
          
          posts.push(blogPost)
        }
        
        // Sort by publishedAt descending since we removed orderBy from query
        posts.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
        
        return posts
      } catch (error) {
        console.error('Error fetching featured posts from database:', error)
        return []
      }
    },
    CACHE_TTL.MEDIUM
  )
}

export async function getLatestPostsFromDB(limitCount: number = 6): Promise<BlogPost[]> {
  return getCachedOrFetch(
    CACHE_KEYS.LATEST_POSTS(limitCount),
    async () => {
      try {
        const postsCollection = collection(db, 'posts')
        const q = query(
          postsCollection,
          where('status', '==', 'published')
          // orderBy('publishedAt', 'desc'), - Temporarily removed, sorting in JS below
          // firestoreLimit(limitCount) - Will limit after sorting
        )
        
        const querySnapshot = await getDocs(q)
        const posts: BlogPost[] = []
        
        for (const docSnap of querySnapshot.docs) {
          const postData = { id: docSnap.id, ...docSnap.data() } as FirestorePost & { id: string }
          const blogPost = convertFirestorePostToBlogPost(postData)
          
          // Resolve category slug
          if (postData.categoryId) {
            const categoryDoc = await getDoc(doc(db, 'categories', postData.categoryId))
            if (categoryDoc.exists()) {
              const categoryData = categoryDoc.data() as FirestoreCategory
              blogPost.category = categoryData.slug
            }
          }
          
          posts.push(blogPost)
        }
        
        // Sort by publishedAt descending and limit since we removed orderBy from query
        posts.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
        
        return posts.slice(0, limitCount)
      } catch (error) {
        console.error('Error fetching latest posts from database:', error)
        return []
      }
    },
    CACHE_TTL.MEDIUM
  )
}

export async function getAllCategoriesFromDB(): Promise<Category[]> {
  return getCachedOrFetch(
    CACHE_KEYS.ALL_CATEGORIES,
    async () => {
      try {
        const categoriesCollection = collection(db, 'categories')
        const q = query(
          categoriesCollection,
          where('active', '==', true)
          // orderBy('sortOrder', 'asc') - Temporarily removed, sorting in JS below
        )
        
        const querySnapshot = await getDocs(q)
        const categoriesWithSort: Array<Category & { sortOrder: number }> = []
        
        for (const docSnap of querySnapshot.docs) {
          const categoryData = { id: docSnap.id, ...docSnap.data() } as FirestoreCategory & { id: string }
          
          // Count posts in this category
          const postsCollection = collection(db, 'posts')
          const postsQuery = query(
            postsCollection,
            where('categoryId', '==', docSnap.id),
            where('status', '==', 'published')
          )
          
          const postsSnapshot = await getDocs(postsQuery)
          const postCount = postsSnapshot.size
          
          const category = convertFirestoreCategoryToCategory(categoryData, postCount)
          categoriesWithSort.push({ ...category, sortOrder: categoryData.sortOrder || 0 })
        }
        
        // Sort by sortOrder since we removed orderBy from query
        categoriesWithSort.sort((a, b) => a.sortOrder - b.sortOrder)
        
        // Remove sortOrder from final result
        const categories = categoriesWithSort.map(({ sortOrder, ...category }) => category)
        
        return categories
      } catch (error) {
        console.error('Error fetching categories from database:', error)
        return []
      }
    },
    CACHE_TTL.LONG
  )
}

export async function getCategoryBySlugFromDB(slug: string): Promise<Category | null> {
  try {
    const categoriesCollection = collection(db, 'categories')
    const q = query(
      categoriesCollection,
      where('slug', '==', slug),
      where('active', '==', true),
      firestoreLimit(1)
    )
    
    const querySnapshot = await getDocs(q)
    
    if (querySnapshot.empty) {
      return null
    }
    
    const docSnap = querySnapshot.docs[0]
    const categoryData = { id: docSnap.id, ...docSnap.data() } as FirestoreCategory & { id: string }
    
    // Count posts in this category
    const postsCollection = collection(db, 'posts')
    const postsQuery = query(
      postsCollection,
      where('categoryId', '==', docSnap.id),
      where('status', '==', 'published')
    )
    
    const postsSnapshot = await getDocs(postsQuery)
    const postCount = postsSnapshot.size
    
    return convertFirestoreCategoryToCategory(categoryData, postCount)
  } catch (error) {
    console.error(`Error fetching category ${slug} from database:`, error)
    return null
  }
}

export async function getAllTagsFromDB(): Promise<string[]> {
  try {
    const postsCollection = collection(db, 'posts')
    const q = query(
      postsCollection,
      where('status', '==', 'published')
    )
    
    const querySnapshot = await getDocs(q)
    const tagSet = new Set<string>()
    
    querySnapshot.forEach(doc => {
      const post = doc.data() as FirestorePost
      if (post.tags) {
        post.tags.forEach(tag => tagSet.add(tag))
      }
    })
    
    return Array.from(tagSet).sort()
  } catch (error) {
    console.error('Error fetching tags from database:', error)
    return []
  }
}

export async function searchPostsFromDB(searchQuery: string): Promise<BlogPost[]> {
  try {
    const postsCollection = collection(db, 'posts')
    const q = query(
      postsCollection,
      where('status', '==', 'published')
      // orderBy('publishedAt', 'desc') - Temporarily removed, sorting in JS below
    )
    
    const querySnapshot = await getDocs(q)
    const posts: BlogPost[] = []
    const searchTerm = searchQuery.toLowerCase()
    
    for (const docSnap of querySnapshot.docs) {
      const postData = { id: docSnap.id, ...docSnap.data() } as FirestorePost & { id: string }
      
      // Filter posts based on search term
      const matchesTitle = postData.title.toLowerCase().includes(searchTerm)
      const matchesDescription = postData.description.toLowerCase().includes(searchTerm)
      const matchesTags = postData.tags?.some(tag => tag.toLowerCase().includes(searchTerm)) || false
      
      if (matchesTitle || matchesDescription || matchesTags) {
        const blogPost = convertFirestorePostToBlogPost(postData)
        
        // Resolve category slug
        if (postData.categoryId) {
          const categoryDoc = await getDoc(doc(db, 'categories', postData.categoryId))
          if (categoryDoc.exists()) {
            const categoryData = categoryDoc.data() as FirestoreCategory
            blogPost.category = categoryData.slug
          }
        }
        
        posts.push(blogPost)
      }
    }
    
    // Sort by publishedAt descending since we removed orderBy from query
    posts.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    
    return posts
  } catch (error) {
    console.error('Error searching posts from database:', error)
    return []
  }
}