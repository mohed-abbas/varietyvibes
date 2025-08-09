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

// GET /api/admin/categories/[id] - Get single category
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await authenticateUser(request)
    
    if (!user.active) {
      return NextResponse.json({ error: 'Account is inactive' }, { status: 403 })
    }

    // All authenticated users can view categories
    if (!hasRole(user.role, ['admin', 'editor', 'author'])) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 })
    }

    const categoryDoc = await db.collection('categories').doc(params.id).get()

    if (!categoryDoc.exists) {
      return NextResponse.json({ error: 'Category not found' }, { status: 404 })
    }

    const categoryData = categoryDoc.data()!
    const category = {
      id: categoryDoc.id,
      ...categoryData,
      createdAt: categoryData.createdAt?.toDate?.()?.toISOString() || null,
      updatedAt: categoryData.updatedAt?.toDate?.()?.toISOString() || null
    }

    return NextResponse.json(category)

  } catch (error) {
    console.error('Error fetching category:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch category' },
      { status: error instanceof Error && error.message.includes('Authentication') ? 401 : 500 }
    )
  }
}

// PUT /api/admin/categories/[id] - Update category
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await authenticateUser(request)
    
    if (!user.active) {
      return NextResponse.json({ error: 'Account is inactive' }, { status: 403 })
    }

    // Only editors and admins can update categories
    if (!hasRole(user.role, ['admin', 'editor'])) {
      return NextResponse.json({ error: 'Insufficient permissions to update categories' }, { status: 403 })
    }

    // Check if category exists
    const categoryDoc = await db.collection('categories').doc(params.id).get()
    if (!categoryDoc.exists) {
      return NextResponse.json({ error: 'Category not found' }, { status: 404 })
    }

    const existingCategory = categoryDoc.data()!

    const body = await request.json()
    const { 
      name, 
      description, 
      color = '#6B7280',
      icon,
      featured = false,
      parentId = null,
      seo
    } = body

    // Validate required fields
    if (!name || !description) {
      return NextResponse.json(
        { error: 'Missing required fields: name, description' },
        { status: 400 }
      )
    }

    // Generate new slug if name changed
    let slug = existingCategory.slug
    if (name !== existingCategory.name) {
      slug = generateSlug(name)
      
      // Check if new slug is unique
      const existingSlugCategory = await db.collection('categories')
        .where('slug', '==', slug)
        .where('__name__', '!=', params.id)
        .limit(1)
        .get()
        
      if (!existingSlugCategory.empty) {
        return NextResponse.json(
          { error: 'A category with this name already exists. Please choose a different name.' },
          { status: 400 }
        )
      }
    }

    // Validate parent category if specified
    if (parentId && parentId !== params.id) {
      const parentDoc = await db.collection('categories').doc(parentId).get()
      if (!parentDoc.exists) {
        return NextResponse.json(
          { error: 'Parent category not found' },
          { status: 400 }
        )
      }

      // Prevent circular references
      const parentData = parentDoc.data()!
      if (parentData.parentId === params.id) {
        return NextResponse.json(
          { error: 'Cannot create circular category relationship' },
          { status: 400 }
        )
      }
    }

    // Prepare update data
    const updateData: any = {
      slug,
      name,
      description,
      color,
      icon: icon || null,
      featured,
      parentId,
      updatedAt: FieldValue.serverTimestamp(),
      lastModifiedBy: user.uid,
      
      // SEO
      seo: seo || {
        metaTitle: name,
        metaDescription: description,
        keywords: [],
        ogImage: '',
        canonicalUrl: ''
      }
    }

    // Update category
    await db.collection('categories').doc(params.id).update(updateData)

    // Get updated category
    const updatedCategoryDoc = await db.collection('categories').doc(params.id).get()
    const updatedCategory = {
      id: params.id,
      ...updatedCategoryDoc.data(),
      createdAt: updatedCategoryDoc.data()?.createdAt?.toDate?.()?.toISOString() || null,
      updatedAt: new Date().toISOString()
    }

    return NextResponse.json(updatedCategory)

  } catch (error) {
    console.error('Error updating category:', error)
    
    if (error instanceof Error && error.message.includes('Authentication')) {
      return NextResponse.json(
        { error: error.message },
        { status: 401 }
      )
    }

    return NextResponse.json(
      { error: 'Failed to update category' },
      { status: 500 }
    )
  }
}

// DELETE /api/admin/categories/[id] - Delete category
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await authenticateUser(request)
    
    if (!user.active) {
      return NextResponse.json({ error: 'Account is inactive' }, { status: 403 })
    }

    // Only admins can delete categories
    if (!hasRole(user.role, ['admin'])) {
      return NextResponse.json({ error: 'Insufficient permissions to delete categories' }, { status: 403 })
    }

    // Check if category exists
    const categoryDoc = await db.collection('categories').doc(params.id).get()
    if (!categoryDoc.exists) {
      return NextResponse.json({ error: 'Category not found' }, { status: 404 })
    }

    const categoryData = categoryDoc.data()!

    // Check if category has posts
    const postsQuery = await db.collection('posts')
      .where('categoryId', '==', params.id)
      .limit(1)
      .get()

    if (!postsQuery.empty) {
      return NextResponse.json(
        { error: 'Cannot delete category with existing posts. Please move or delete posts first.' },
        { status: 400 }
      )
    }

    // Check if category has child categories
    const childCategoriesQuery = await db.collection('categories')
      .where('parentId', '==', params.id)
      .limit(1)
      .get()

    if (!childCategoriesQuery.empty) {
      return NextResponse.json(
        { error: 'Cannot delete category with child categories. Please reassign or delete child categories first.' },
        { status: 400 }
      )
    }

    // Delete category
    await db.collection('categories').doc(params.id).delete()

    return NextResponse.json({ 
      message: 'Category deleted successfully',
      id: params.id,
      name: categoryData.name
    })

  } catch (error) {
    console.error('Error deleting category:', error)
    
    if (error instanceof Error && error.message.includes('Authentication')) {
      return NextResponse.json(
        { error: error.message },
        { status: 401 }
      )
    }

    return NextResponse.json(
      { error: 'Failed to delete category' },
      { status: 500 }
    )
  }
}