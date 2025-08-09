import { NextRequest, NextResponse } from 'next/server'
import { headers } from 'next/headers'
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

// GET /api/admin/users - List users with pagination and filters
export async function GET(request: NextRequest) {
  try {
    const user = await authenticateUser(request)
    
    if (!user.active) {
      return NextResponse.json({ error: 'Account is inactive' }, { status: 403 })
    }

    // Only admins can list users
    if (!hasRole(user.role, ['admin'])) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 })
    }

    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = Math.min(parseInt(searchParams.get('limit') || '10'), 50) // Max 50
    const role = searchParams.get('role')
    const status = searchParams.get('status')
    const search = searchParams.get('search')

    let query = db.collection('users')
      .orderBy('createdAt', 'desc')
      .limit(limit)
      .offset((page - 1) * limit)

    // Apply filters
    if (role && ['admin', 'editor', 'author'].includes(role)) {
      query = query.where('role', '==', role)
    }
    
    if (status === 'active') {
      query = query.where('active', '==', true)
    } else if (status === 'inactive') {
      query = query.where('active', '==', false)
    }

    const snapshot = await query.get()
    
    let users = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate?.()?.toISOString() || null,
      lastLogin: doc.data().lastLogin?.toDate?.()?.toISOString() || null,
      joinDate: doc.data().joinDate?.toDate?.()?.toISOString() || null
    }))

    // Apply text search filter (client-side for simplicity)
    if (search) {
      const searchLower = search.toLowerCase()
      users = users.filter(u => 
        u.displayName?.toLowerCase().includes(searchLower) ||
        u.email?.toLowerCase().includes(searchLower)
      )
    }

    // Get total count for pagination
    let totalQuery = db.collection('users')
    if (role && ['admin', 'editor', 'author'].includes(role)) {
      totalQuery = totalQuery.where('role', '==', role)
    }
    if (status === 'active') {
      totalQuery = totalQuery.where('active', '==', true)
    } else if (status === 'inactive') {
      totalQuery = totalQuery.where('active', '==', false)
    }

    const countSnapshot = await totalQuery.count().get()
    const total = countSnapshot.data().count

    return NextResponse.json({
      users,
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
    console.error('Error fetching users:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch users' },
      { status: error instanceof Error && error.message.includes('Authentication') ? 401 : 500 }
    )
  }
}

// POST /api/admin/users - Create new user
export async function POST(request: NextRequest) {
  try {
    const user = await authenticateUser(request)
    
    if (!user.active) {
      return NextResponse.json({ error: 'Account is inactive' }, { status: 403 })
    }

    // Only admins can create users
    if (!hasRole(user.role, ['admin'])) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 })
    }

    const body = await request.json()
    const { email, displayName, role, password, bio, expertise } = body

    // Validate required fields
    if (!email || !displayName || !role || !password) {
      return NextResponse.json(
        { error: 'Missing required fields: email, displayName, role, password' },
        { status: 400 }
      )
    }

    // Validate role
    if (!['admin', 'editor', 'author'].includes(role)) {
      return NextResponse.json(
        { error: 'Invalid role. Must be admin, editor, or author' },
        { status: 400 }
      )
    }

    // Validate password strength
    if (password.length < 6) {
      return NextResponse.json(
        { error: 'Password must be at least 6 characters long' },
        { status: 400 }
      )
    }

    // Create Firebase Auth user
    const userRecord = await auth.createUser({
      email,
      password,
      displayName,
      emailVerified: false
    })

    // Define permissions based on role
    const permissions = {
      admin: [
        'posts.create', 'posts.edit', 'posts.delete', 'posts.publish',
        'categories.create', 'categories.edit', 'categories.delete',
        'users.create', 'users.edit', 'users.delete', 'users.roles',
        'media.upload', 'media.delete', 'settings.edit', 'analytics.view'
      ],
      editor: [
        'posts.create', 'posts.edit', 'posts.publish', 'posts.moderate',
        'categories.create', 'categories.edit',
        'media.upload', 'media.manage', 'analytics.view'
      ],
      author: [
        'posts.create', 'posts.edit.own', 'posts.draft',
        'media.upload', 'media.own'
      ]
    }

    // Create Firestore user document
    const userDoc = {
      uid: userRecord.uid,
      email: userRecord.email,
      displayName,
      role,
      permissions: permissions[role as keyof typeof permissions],
      active: true,
      bio: bio || '',
      expertise: expertise || [],
      social: {},
      createdAt: FieldValue.serverTimestamp(),
      joinDate: FieldValue.serverTimestamp(),
      lastLogin: null,
      postsCount: 0,
      draftsCount: 0,
      totalViews: 0
    }

    await db.collection('users').doc(userRecord.uid).set(userDoc)

    // Return created user (without sensitive data)
    const newUser = {
      id: userRecord.uid,
      ...userDoc,
      createdAt: new Date().toISOString(),
      joinDate: new Date().toISOString()
    }

    return NextResponse.json(newUser, { status: 201 })

  } catch (error) {
    console.error('Error creating user:', error)
    
    // Handle specific Firebase Auth errors
    if (error instanceof Error) {
      if (error.message.includes('email-already-exists')) {
        return NextResponse.json(
          { error: 'Email address is already in use' },
          { status: 400 }
        )
      }
      if (error.message.includes('invalid-email')) {
        return NextResponse.json(
          { error: 'Invalid email address format' },
          { status: 400 }
        )
      }
      if (error.message.includes('Authentication')) {
        return NextResponse.json(
          { error: error.message },
          { status: 401 }
        )
      }
    }

    return NextResponse.json(
      { error: 'Failed to create user' },
      { status: 500 }
    )
  }
}