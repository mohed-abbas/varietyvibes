import { NextRequest, NextResponse } from 'next/server'
import { getAuth } from 'firebase-admin/auth'
import { getFirestore, FieldValue, Timestamp } from 'firebase-admin/firestore'
import { initializeFirebaseAdmin } from '@/lib/firebase/admin'

// Initialize Firebase Admin
initializeFirebaseAdmin()

const auth = getAuth()
const db = getFirestore()

// Authenticate request and get user
async function authenticateUser(request: NextRequest) {
  const authHeader = request.headers.get('authorization') || 
                     request.headers.get('Authorization')
  
  if (!authHeader?.startsWith('Bearer ')) {
    throw new Error('Missing or invalid authorization header')
  }

  const token = authHeader.replace('Bearer ', '')
  
  try {
    const decodedToken = await auth.verifyIdToken(token)
    const userDoc = await db.collection('users').doc(decodedToken.uid).get()
    
    if (!userDoc.exists) {
      throw new Error('User not found in database')
    }

    const userData = userDoc.data()
    
    return {
      uid: decodedToken.uid,
      email: decodedToken.email,
      role: userData?.role || 'author',
      permissions: userData?.permissions || [],
      active: userData?.active !== false
    }
  } catch (error) {
    throw new Error('Authentication failed: ' + (error as Error).message)
  }
}

// Check if user has required role
function hasRole(userRole: string, allowedRoles: string[]): boolean {
  return allowedRoles.includes(userRole)
}

// Generate slug from title
function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim()
}

// Calculate reading time (words per minute = 200)
function calculateReadingTime(content: string): number {
  const words = content.trim().split(/\s+/).length
  return Math.ceil(words / 200)
}

// GET /api/admin/posts - List posts with pagination and filters
export async function GET(request: NextRequest) {
  try {
    const user = await authenticateUser(request)
    
    if (!user.active) {
      return NextResponse.json({ error: 'Account is inactive' }, { status: 403 })
    }

    // Authors, editors, and admins can view posts (with role-based filtering)
    if (!hasRole(user.role, ['admin', 'editor', 'author'])) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 })
    }

    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = Math.min(parseInt(searchParams.get('limit') || '10'), 50) // Max 50
    const status = searchParams.get('status')
    const category = searchParams.get('category')
    const author = searchParams.get('author')
    const search = searchParams.get('search')

    let query = db.collection('posts')
      .orderBy('updatedAt', 'desc')
      .limit(limit)
      .offset((page - 1) * limit)

    // Apply filters
    if (status && ['draft', 'published', 'scheduled', 'archived'].includes(status)) {
      query = query.where('status', '==', status)
    }
    
    if (category) {
      query = query.where('categoryId', '==', category)
    }

    // Authors can only see their own posts
    if (user.role === 'author') {
      query = query.where('authorId', '==', user.uid)
    } else if (author) {
      query = query.where('authorId', '==', author)
    }

    const snapshot = await query.get()
    
    let posts = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate?.()?.toISOString() || null,
      updatedAt: doc.data().updatedAt?.toDate?.()?.toISOString() || null,
      publishDate: doc.data().publishDate?.toDate?.()?.toISOString() || null,
      scheduledFor: doc.data().scheduledFor?.toDate?.()?.toISOString() || null
    }))

    // Apply text search filter (client-side for simplicity)
    if (search) {
      const searchLower = search.toLowerCase()
      posts = posts.filter(p => 
        p.title?.toLowerCase().includes(searchLower) ||
        p.description?.toLowerCase().includes(searchLower) ||
        p.content?.toLowerCase().includes(searchLower)
      )
    }

    // Get total count for pagination
    let totalQuery = db.collection('posts')
    if (status && ['draft', 'published', 'scheduled', 'archived'].includes(status)) {
      totalQuery = totalQuery.where('status', '==', status)
    }
    if (category) {
      totalQuery = totalQuery.where('categoryId', '==', category)
    }
    if (user.role === 'author') {
      totalQuery = totalQuery.where('authorId', '==', user.uid)
    } else if (author) {
      totalQuery = totalQuery.where('authorId', '==', author)
    }

    const countSnapshot = await totalQuery.count().get()
    const total = countSnapshot.data().count

    return NextResponse.json({
      posts,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
        hasNext: page < Math.ceil(total / limit),
        hasPrev: page > 1
      }
    })

  } catch (error) {
    console.error('Error fetching posts:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch posts' },
      { status: error instanceof Error && error.message.includes('Authentication') ? 401 : 500 }
    )
  }
}

// POST /api/admin/posts - Create new post
export async function POST(request: NextRequest) {
  try {
    const user = await authenticateUser(request)
    
    if (!user.active) {
      return NextResponse.json({ error: 'Account is inactive' }, { status: 403 })
    }

    // Authors, editors, and admins can create posts
    if (!hasRole(user.role, ['admin', 'editor', 'author'])) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 })
    }

    const body = await request.json()
    const { 
      title, 
      description, 
      content, 
      excerpt,
      categoryId, 
      tags = [],
      featured = false,
      featuredImage,
      seo,
      status = 'draft',
      scheduledFor
    } = body

    // Validate required fields
    if (!title || !description || !content || !categoryId) {
      return NextResponse.json(
        { error: 'Missing required fields: title, description, content, categoryId' },
        { status: 400 }
      )
    }

    // Validate status
    if (!['draft', 'published', 'scheduled'].includes(status)) {
      return NextResponse.json(
        { error: 'Invalid status. Must be draft, published, or scheduled' },
        { status: 400 }
      )
    }

    // Validate category exists
    const categoryDoc = await db.collection('categories').doc(categoryId).get()
    if (!categoryDoc.exists) {
      return NextResponse.json(
        { error: 'Category not found' },
        { status: 400 }
      )
    }

    // Generate slug if not provided
    const slug = generateSlug(title)
    
    // Check if slug is unique
    const existingPost = await db.collection('posts').where('slug', '==', slug).limit(1).get()
    if (!existingPost.empty) {
      return NextResponse.json(
        { error: 'A post with this title already exists. Please choose a different title.' },
        { status: 400 }
      )
    }

    // Calculate reading time
    const readingTime = calculateReadingTime(content)

    // Create post document
    const postData: any = {
      slug,
      title,
      description,
      content,
      excerpt: excerpt || description.substring(0, 160),
      
      // Metadata
      status,
      publishDate: status === 'published' ? FieldValue.serverTimestamp() : null,
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
      scheduledFor: scheduledFor ? Timestamp.fromDate(new Date(scheduledFor)) : null,
      
      // Author & Category
      authorId: user.uid,
      categoryId,
      
      // Content details
      featuredImage: featuredImage || null,
      tags: Array.isArray(tags) ? tags : [],
      featured,
      readingTime,
      
      // SEO & Social
      seo: seo || {
        metaTitle: title,
        metaDescription: description,
        keywords: [],
        ogImage: featuredImage?.url || '',
        canonicalUrl: ''
      },
      
      // Analytics
      views: 0,
      likes: 0,
      shares: 0,
      
      // Moderation
      moderationStatus: 'approved', // Auto-approve for now
      moderationNotes: '',
      lastModifiedBy: user.uid
    }

    const docRef = await db.collection('posts').add(postData)
    const newPost = await docRef.get()

    // Update category post count
    await db.collection('categories').doc(categoryId).update({
      postCount: FieldValue.increment(1),
      updatedAt: FieldValue.serverTimestamp()
    })

    // Update user post count
    await db.collection('users').doc(user.uid).update({
      postsCount: FieldValue.increment(1),
      draftsCount: status === 'draft' ? FieldValue.increment(1) : 0
    })

    const responseData = {
      id: docRef.id,
      ...newPost.data(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      publishDate: status === 'published' ? new Date().toISOString() : null
    }

    return NextResponse.json(responseData, { status: 201 })

  } catch (error) {
    console.error('Error creating post:', error)
    
    if (error instanceof Error) {
      if (error.message.includes('Authentication')) {
        return NextResponse.json(
          { error: error.message },
          { status: 401 }
        )
      }
    }

    return NextResponse.json(
      { error: 'Failed to create post' },
      { status: 500 }
    )
  }
}