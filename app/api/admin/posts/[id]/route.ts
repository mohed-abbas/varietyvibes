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

// GET /api/admin/posts/[id] - Get single post
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await authenticateUser(request)
    
    if (!user.active) {
      return NextResponse.json({ error: 'Account is inactive' }, { status: 403 })
    }

    // Authors, editors, and admins can view posts
    if (!hasRole(user.role, ['admin', 'editor', 'author'])) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 })
    }

    const postDoc = await db.collection('posts').doc(params.id).get()

    if (!postDoc.exists) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 })
    }

    const postData = postDoc.data()!

    // Authors can only access their own posts
    if (user.role === 'author' && postData.authorId !== user.uid) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 })
    }

    const post = {
      id: postDoc.id,
      ...postData,
      createdAt: postData.createdAt?.toDate?.()?.toISOString() || null,
      updatedAt: postData.updatedAt?.toDate?.()?.toISOString() || null,
      publishDate: postData.publishDate?.toDate?.()?.toISOString() || null,
      scheduledFor: postData.scheduledFor?.toDate?.()?.toISOString() || null
    }

    return NextResponse.json(post)

  } catch (error) {
    console.error('Error fetching post:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch post' },
      { status: error instanceof Error && error.message.includes('Authentication') ? 401 : 500 }
    )
  }
}

// PUT /api/admin/posts/[id] - Update post
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await authenticateUser(request)
    
    if (!user.active) {
      return NextResponse.json({ error: 'Account is inactive' }, { status: 403 })
    }

    // Authors, editors, and admins can update posts
    if (!hasRole(user.role, ['admin', 'editor', 'author'])) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 })
    }

    // Check if post exists
    const postDoc = await db.collection('posts').doc(params.id).get()
    if (!postDoc.exists) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 })
    }

    const existingPost = postDoc.data()!

    // Authors can only update their own posts
    if (user.role === 'author' && existingPost.authorId !== user.uid) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 })
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
      status,
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
    if (status && !['draft', 'published', 'scheduled', 'archived'].includes(status)) {
      return NextResponse.json(
        { error: 'Invalid status. Must be draft, published, scheduled, or archived' },
        { status: 400 }
      )
    }

    // Validate category exists if changed
    if (categoryId !== existingPost.categoryId) {
      const categoryDoc = await db.collection('categories').doc(categoryId).get()
      if (!categoryDoc.exists) {
        return NextResponse.json(
          { error: 'Category not found' },
          { status: 400 }
        )
      }
    }

    // Generate new slug if title changed
    let slug = existingPost.slug
    if (title !== existingPost.title) {
      slug = generateSlug(title)
      
      // Check if new slug is unique
      const existingSlugPost = await db.collection('posts')
        .where('slug', '==', slug)
        .where('__name__', '!=', params.id)
        .limit(1)
        .get()
        
      if (!existingSlugPost.empty) {
        return NextResponse.json(
          { error: 'A post with this title already exists. Please choose a different title.' },
          { status: 400 }
        )
      }
    }

    // Calculate reading time if content changed
    const readingTime = content !== existingPost.content 
      ? calculateReadingTime(content) 
      : existingPost.readingTime

    // Prepare update data
    const updateData: any = {
      slug,
      title,
      description,
      content,
      excerpt: excerpt || description.substring(0, 160),
      
      // Update metadata
      updatedAt: FieldValue.serverTimestamp(),
      lastModifiedBy: user.uid,
      
      // Category & content
      categoryId,
      featuredImage: featuredImage || null,
      tags: Array.isArray(tags) ? tags : [],
      featured,
      readingTime,
      
      // SEO
      seo: seo || {
        metaTitle: title,
        metaDescription: description,
        keywords: [],
        ogImage: featuredImage?.url || '',
        canonicalUrl: ''
      }
    }

    // Handle status changes
    if (status && status !== existingPost.status) {
      updateData.status = status
      
      // Set publish date when publishing
      if (status === 'published' && existingPost.status !== 'published') {
        updateData.publishDate = FieldValue.serverTimestamp()
      }
      
      // Handle scheduling
      if (status === 'scheduled' && scheduledFor) {
        updateData.scheduledFor = Timestamp.fromDate(new Date(scheduledFor))
      } else if (status !== 'scheduled') {
        updateData.scheduledFor = null
      }
    }

    // Update post
    await db.collection('posts').doc(params.id).update(updateData)

    // Update category post counts if category changed
    if (categoryId !== existingPost.categoryId) {
      // Decrement old category
      await db.collection('categories').doc(existingPost.categoryId).update({
        postCount: FieldValue.increment(-1),
        updatedAt: FieldValue.serverTimestamp()
      })
      
      // Increment new category
      await db.collection('categories').doc(categoryId).update({
        postCount: FieldValue.increment(1),
        updatedAt: FieldValue.serverTimestamp()
      })
    }

    // Get updated post
    const updatedPostDoc = await db.collection('posts').doc(params.id).get()
    const updatedPost = {
      id: params.id,
      ...updatedPostDoc.data(),
      createdAt: updatedPostDoc.data()?.createdAt?.toDate?.()?.toISOString() || null,
      updatedAt: new Date().toISOString(),
      publishDate: updatedPostDoc.data()?.publishDate?.toDate?.()?.toISOString() || null,
      scheduledFor: updatedPostDoc.data()?.scheduledFor?.toDate?.()?.toISOString() || null
    }

    return NextResponse.json(updatedPost)

  } catch (error) {
    console.error('Error updating post:', error)
    
    if (error instanceof Error && error.message.includes('Authentication')) {
      return NextResponse.json(
        { error: error.message },
        { status: 401 }
      )
    }

    return NextResponse.json(
      { error: 'Failed to update post' },
      { status: 500 }
    )
  }
}

// DELETE /api/admin/posts/[id] - Delete post
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await authenticateUser(request)
    
    if (!user.active) {
      return NextResponse.json({ error: 'Account is inactive' }, { status: 403 })
    }

    // Only editors and admins can delete posts
    if (!hasRole(user.role, ['admin', 'editor'])) {
      return NextResponse.json({ error: 'Insufficient permissions to delete posts' }, { status: 403 })
    }

    // Check if post exists
    const postDoc = await db.collection('posts').doc(params.id).get()
    if (!postDoc.exists) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 })
    }

    const postData = postDoc.data()!

    // Delete post
    await db.collection('posts').doc(params.id).delete()

    // Update category post count
    if (postData.categoryId) {
      await db.collection('categories').doc(postData.categoryId).update({
        postCount: FieldValue.increment(-1),
        updatedAt: FieldValue.serverTimestamp()
      })
    }

    // Update user post count
    if (postData.authorId) {
      const decrementData: any = {
        postsCount: FieldValue.increment(-1)
      }
      
      if (postData.status === 'draft') {
        decrementData.draftsCount = FieldValue.increment(-1)
      }
      
      await db.collection('users').doc(postData.authorId).update(decrementData)
    }

    return NextResponse.json({ 
      message: 'Post deleted successfully',
      id: params.id 
    })

  } catch (error) {
    console.error('Error deleting post:', error)
    
    if (error instanceof Error && error.message.includes('Authentication')) {
      return NextResponse.json(
        { error: error.message },
        { status: 401 }
      )
    }

    return NextResponse.json(
      { error: 'Failed to delete post' },
      { status: 500 }
    )
  }
}