// API authentication middleware for Next.js
import { NextRequest, NextResponse } from 'next/server'
import { adminAuth, adminDb } from '@/lib/firebase/admin'
import { AuthUser, UserRole } from '@/types/admin'
import { hasPermission, hasRole } from './permissions'

interface AuthenticatedRequest extends NextRequest {
  user?: AuthUser
}

export interface MiddlewareConfig {
  allowedRoles?: UserRole[]
  requiredPermissions?: string[]
  allowOwner?: boolean
  ownerField?: string
}

export class AuthenticationError extends Error {
  constructor(message: string, public status: number = 401) {
    super(message)
    this.name = 'AuthenticationError'
  }
}

export class AuthorizationError extends Error {
  constructor(message: string, public status: number = 403) {
    super(message)
    this.name = 'AuthorizationError'
  }
}

/**
 * Extracts and verifies Firebase ID token from request headers
 */
export async function verifyAuthToken(request: NextRequest): Promise<AuthUser> {
  const authHeader = request.headers.get('authorization')
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    throw new AuthenticationError('Missing or invalid authorization header')
  }

  const token = authHeader.substring(7) // Remove 'Bearer ' prefix
  
  try {
    // Verify the Firebase ID token
    const decodedToken = await adminAuth.verifyIdToken(token)
    
    // Get user data from Firestore
    const userDoc = await adminDb.collection('users').doc(decodedToken.uid).get()
    
    if (!userDoc.exists) {
      throw new AuthenticationError('User not found')
    }

    const userData = userDoc.data()
    
    if (!userData) {
      throw new AuthenticationError('Invalid user data')
    }

    if (!userData.active) {
      throw new AuthenticationError('Account deactivated')
    }

    return {
      uid: decodedToken.uid,
      email: decodedToken.email || userData.email,
      displayName: userData.displayName,
      role: userData.role,
      permissions: userData.permissions || [],
      avatar: userData.avatar,
      active: userData.active,
      createdAt: userData.createdAt?.toDate?.()?.toISOString() || new Date().toISOString(),
      lastLogin: userData.lastLogin?.toDate?.()?.toISOString() || new Date().toISOString()
    }
  } catch (error: any) {
    if (error instanceof AuthenticationError) {
      throw error
    }
    throw new AuthenticationError(`Token verification failed: ${error.message}`)
  }
}

/**
 * Checks if user has required permissions and roles
 */
export function authorizeUser(
  user: AuthUser, 
  config: MiddlewareConfig,
  resourceOwnerId?: string
): void {
  const { allowedRoles, requiredPermissions, allowOwner } = config

  // Check role-based access
  if (allowedRoles && !hasRole(user.role, allowedRoles)) {
    throw new AuthorizationError('Insufficient role permissions')
  }

  // Check permission-based access
  if (requiredPermissions) {
    for (const permission of requiredPermissions) {
      if (!hasPermission(user.permissions, permission)) {
        // Check if user owns the resource
        if (allowOwner && resourceOwnerId === user.uid) {
          const ownerPermission = permission + '.own'
          if (hasPermission(user.permissions, ownerPermission)) {
            continue
          }
        }
        throw new AuthorizationError(`Missing permission: ${permission}`)
      }
    }
  }
}

/**
 * Middleware wrapper for API routes
 */
export function withAuth(config: MiddlewareConfig = {}) {
  return function middleware(
    handler: (request: AuthenticatedRequest) => Promise<NextResponse>
  ) {
    return async (request: AuthenticatedRequest): Promise<NextResponse> => {
      try {
        // Verify authentication
        const user = await verifyAuthToken(request)
        request.user = user

        // Get resource owner ID if needed
        let resourceOwnerId: string | undefined
        if (config.allowOwner && config.ownerField) {
          const body = await request.clone().json().catch(() => ({}))
          resourceOwnerId = body[config.ownerField] || request.url.split('/').pop()
        }

        // Check authorization
        authorizeUser(user, config, resourceOwnerId)

        // Call the actual handler
        return await handler(request)
      } catch (error) {
        console.error('Auth middleware error:', error)

        if (error instanceof AuthenticationError) {
          return NextResponse.json(
            { error: error.message, code: 'AUTH_ERROR' },
            { status: error.status }
          )
        }

        if (error instanceof AuthorizationError) {
          return NextResponse.json(
            { error: error.message, code: 'AUTHORIZATION_ERROR' },
            { status: error.status }
          )
        }

        return NextResponse.json(
          { error: 'Internal server error', code: 'INTERNAL_ERROR' },
          { status: 500 }
        )
      }
    }
  }
}

/**
 * Convenience middleware functions for common scenarios
 */
export const withAdminAuth = withAuth({ 
  allowedRoles: ['admin'] 
})

export const withEditorAuth = withAuth({ 
  allowedRoles: ['admin', 'editor'] 
})

export const withAuthorAuth = withAuth({ 
  allowedRoles: ['admin', 'editor', 'author'] 
})

export const withOwnerOrAdminAuth = withAuth({
  allowedRoles: ['admin', 'editor', 'author'],
  allowOwner: true,
  ownerField: 'authorId'
})

/**
 * Helper to extract user from authenticated request
 */
export function getAuthUser(request: AuthenticatedRequest): AuthUser {
  if (!request.user) {
    throw new AuthenticationError('User not authenticated')
  }
  return request.user
}

export type { AuthenticatedRequest }