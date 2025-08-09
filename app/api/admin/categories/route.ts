import { NextRequest, NextResponse } from 'next/server'
import { getAuth } from 'firebase-admin/auth'
import { getFirestore, FieldValue } from 'firebase-admin/firestore'
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

// Generate slug from name
function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim()
}

// GET /api/admin/categories - List categories with pagination and filters
export async function GET(request: NextRequest) {
  try {
    const user = await authenticateUser(request)
    
    if (!user.active) {
      return NextResponse.json({ error: 'Account is inactive' }, { status: 403 })
    }

    // All authenticated users can view categories
    if (!hasRole(user.role, ['admin', 'editor', 'author'])) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 })
    }

    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = Math.min(parseInt(searchParams.get('limit') || '10'), 50) // Max 50
    const status = searchParams.get('status')
    const featured = searchParams.get('featured')
    const search = searchParams.get('search')
    const sort = searchParams.get('sort') || 'sortOrder'

    let query = db.collection('categories')
    
    // Apply filters
    if (status === 'active') {
      query = query.where('active', '==', true)
    } else if (status === 'inactive') {
      query = query.where('active', '==', false)
    }
    
    if (featured === 'true') {
      query = query.where('featured', '==', true)
    } else if (featured === 'false') {
      query = query.where('featured', '==', false)
    }

    // Apply sorting
    if (sort === 'name') {
      query = query.orderBy('name', 'asc')
    } else if (sort === '-name') {
      query = query.orderBy('name', 'desc')
    } else if (sort === 'posts') {
      query = query.orderBy('postCount', 'desc')
    } else if (sort === 'views') {
      query = query.orderBy('totalViews', 'desc')
    } else if (sort === '-created') {
      query = query.orderBy('createdAt', 'desc')
    } else {
      // Default sort by sortOrder
      query = query.orderBy('sortOrder', 'asc')
    }

    // Apply pagination
    query = query.limit(limit).offset((page - 1) * limit)

    const snapshot = await query.get()
    
    let categories = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate?.()?.toISOString() || null,
      updatedAt: doc.data().updatedAt?.toDate?.()?.toISOString() || null
    }))

    // Apply text search filter (client-side for simplicity)
    if (search) {
      const searchLower = search.toLowerCase()
      categories = categories.filter(c => 
        c.name?.toLowerCase().includes(searchLower) ||
        c.description?.toLowerCase().includes(searchLower)
      )
    }

    // Get total count for pagination
    let totalQuery = db.collection('categories')
    if (status === 'active') {
      totalQuery = totalQuery.where('active', '==', true)
    } else if (status === 'inactive') {
      totalQuery = totalQuery.where('active', '==', false)
    }
    if (featured === 'true') {
      totalQuery = totalQuery.where('featured', '==', true)
    } else if (featured === 'false') {
      totalQuery = totalQuery.where('featured', '==', false)
    }

    const countSnapshot = await totalQuery.count().get()
    const total = countSnapshot.data().count

    return NextResponse.json({
      categories,
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
    console.error('Error fetching categories:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch categories' },
      { status: error instanceof Error && error.message.includes('Authentication') ? 401 : 500 }
    )
  }
}

// POST /api/admin/categories - Create new category
export async function POST(request: NextRequest) {
  try {
    const user = await authenticateUser(request)
    
    if (!user.active) {
      return NextResponse.json({ error: 'Account is inactive' }, { status: 403 })
    }

    // Only editors and admins can create categories
    if (!hasRole(user.role, ['admin', 'editor'])) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 })
    }

    const body = await request.json()
    const { 
      name, 
      description,
      color = '#3B82F6',
      icon = '📁',
      featured = false,
      active = true,
      sortOrder = 999,
      seo,
      hero
    } = body

    // Validate required fields
    if (!name || !description) {
      return NextResponse.json(
        { error: 'Missing required fields: name, description' },
        { status: 400 }
      )
    }

    // Generate slug
    const slug = generateSlug(name)
    
    // Check if slug is unique
    const existingCategory = await db.collection('categories').where('slug', '==', slug).limit(1).get()
    if (!existingCategory.empty) {
      return NextResponse.json(
        { error: 'A category with this name already exists. Please choose a different name.' },
        { status: 400 }
      )
    }

    // Validate color format (hex color)
    const colorRegex = /^#[0-9A-F]{6}$/i
    if (color && !colorRegex.test(color)) {
      return NextResponse.json(
        { error: 'Invalid color format. Please use hex format like #3B82F6' },
        { status: 400 }
      )
    }

    // Create category document
    const categoryData = {
      slug,
      name,
      description,
      
      // Appearance
      color,
      icon,
      featuredImage: '',
      
      // Configuration
      featured,
      active,
      sortOrder: parseInt(sortOrder) || 999,
      
      // SEO
      seo: seo || {
        title: name,
        description,
        keywords: []
      },
      
      // Hero section config
      hero: hero || {
        title: name,
        subtitle: description,
        backgroundImage: ''
      },
      
      // Metadata
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
      createdBy: user.uid,
      
      // Statistics
      postCount: 0,
      totalViews: 0
    }

    const docRef = await db.collection('categories').add(categoryData)
    const newCategory = await docRef.get()

    const responseData = {
      id: docRef.id,
      ...newCategory.data(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }

    return NextResponse.json(responseData, { status: 201 })

  } catch (error) {
    console.error('Error creating category:', error)
    
    if (error instanceof Error) {
      if (error.message.includes('Authentication')) {
        return NextResponse.json(
          { error: error.message },
          { status: 401 }
        )
      }
    }

    return NextResponse.json(
      { error: 'Failed to create category' },
      { status: 500 }
    )
  }
}