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

// GET /api/admin/users/[id] - Get single user
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await authenticateUser(request)
    
    if (!user.active) {
      return NextResponse.json({ error: 'Account is inactive' }, { status: 403 })
    }

    // Users can view their own profile, admins can view all
    const canView = user.uid === params.id || hasRole(user.role, ['admin'])
    
    if (!canView) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 })
    }

    const userDoc = await db.collection('users').doc(params.id).get()
    
    if (!userDoc.exists) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const userData = userDoc.data()
    const userResponse = {
      id: userDoc.id,
      ...userData,
      createdAt: userData?.createdAt?.toDate?.()?.toISOString() || null,
      lastLogin: userData?.lastLogin?.toDate?.()?.toISOString() || null,
      joinDate: userData?.joinDate?.toDate?.()?.toISOString() || null
    }

    return NextResponse.json(userResponse)

  } catch (error) {
    console.error('Error fetching user:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch user' },
      { status: error instanceof Error && error.message.includes('Authentication') ? 401 : 500 }
    )
  }
}

// PUT /api/admin/users/[id] - Update user
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await authenticateUser(request)
    
    if (!user.active) {
      return NextResponse.json({ error: 'Account is inactive' }, { status: 403 })
    }

    const body = await request.json()
    const { displayName, role, bio, expertise, social, active } = body

    // Check permissions
    const isOwnProfile = user.uid === params.id
    const isAdmin = hasRole(user.role, ['admin'])
    
    if (!isOwnProfile && !isAdmin) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 })
    }

    // Check if user exists
    const userDoc = await db.collection('users').doc(params.id).get()
    if (!userDoc.exists) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Prepare update data
    const updateData: any = {
      updatedAt: FieldValue.serverTimestamp()
    }

    // Users can update their own profile (limited fields)
    if (isOwnProfile) {
      if (displayName !== undefined) updateData.displayName = displayName
      if (bio !== undefined) updateData.bio = bio
      if (expertise !== undefined) updateData.expertise = expertise
      if (social !== undefined) updateData.social = social
    }

    // Admins can update everything (including role and active status)
    if (isAdmin) {
      if (displayName !== undefined) updateData.displayName = displayName
      if (bio !== undefined) updateData.bio = bio
      if (expertise !== undefined) updateData.expertise = expertise
      if (social !== undefined) updateData.social = social
      if (active !== undefined) updateData.active = active
      
      // Role update with permissions
      if (role !== undefined && ['admin', 'editor', 'author'].includes(role)) {
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
        
        updateData.role = role
        updateData.permissions = permissions[role as keyof typeof permissions]
      }
    }

    // Update Firestore document
    await db.collection('users').doc(params.id).update(updateData)

    // Get updated user
    const updatedDoc = await db.collection('users').doc(params.id).get()
    const updatedData = updatedDoc.data()

    const userResponse = {
      id: updatedDoc.id,
      ...updatedData,
      createdAt: updatedData?.createdAt?.toDate?.()?.toISOString() || null,
      lastLogin: updatedData?.lastLogin?.toDate?.()?.toISOString() || null,
      joinDate: updatedData?.joinDate?.toDate?.()?.toISOString() || null
    }

    return NextResponse.json(userResponse)

  } catch (error) {
    console.error('Error updating user:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to update user' },
      { status: error instanceof Error && error.message.includes('Authentication') ? 401 : 500 }
    )
  }
}

// DELETE /api/admin/users/[id] - Delete user
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await authenticateUser(request)
    
    if (!user.active) {
      return NextResponse.json({ error: 'Account is inactive' }, { status: 403 })
    }

    // Only admins can delete users
    if (!hasRole(user.role, ['admin'])) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 })
    }

    // Check if user exists
    const userDoc = await db.collection('users').doc(params.id).get()
    if (!userDoc.exists) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Prevent self-deletion
    if (user.uid === params.id) {
      return NextResponse.json({ error: 'Cannot delete your own account' }, { status: 400 })
    }

    // Delete from Firebase Auth
    try {
      await auth.deleteUser(params.id)
    } catch (error) {
      console.error('Error deleting from Firebase Auth:', error)
      // Continue with Firestore deletion even if Auth deletion fails
    }

    // Delete from Firestore
    await db.collection('users').doc(params.id).delete()

    return NextResponse.json({ 
      message: 'User deleted successfully',
      id: params.id 
    })

  } catch (error) {
    console.error('Error deleting user:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to delete user' },
      { status: error instanceof Error && error.message.includes('Authentication') ? 401 : 500 }
    )
  }
}