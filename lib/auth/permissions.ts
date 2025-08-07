// Role-based access control permissions
import { RolePermissions, UserRole } from '@/types/admin'

export const ROLE_PERMISSIONS: RolePermissions = {
  admin: [
    // Posts
    'posts.create',
    'posts.edit',
    'posts.delete', 
    'posts.publish',
    'posts.moderate',
    
    // Categories
    'categories.create',
    'categories.edit',
    'categories.delete',
    
    // Users
    'users.create',
    'users.edit',
    'users.delete',
    'users.roles',
    'users.view',
    
    // Media
    'media.upload',
    'media.delete',
    'media.manage',
    
    // Settings
    'settings.edit',
    'settings.view',
    
    // Analytics
    'analytics.view',
    
    // System
    'system.backup',
    'system.maintenance'
  ],
  
  editor: [
    // Posts
    'posts.create',
    'posts.edit',
    'posts.publish',
    'posts.moderate',
    
    // Categories
    'categories.create',
    'categories.edit',
    
    // Media
    'media.upload',
    'media.manage',
    
    // Analytics
    'analytics.view',
    
    // Limited users
    'users.view'
  ],
  
  author: [
    // Posts (own only)
    'posts.create',
    'posts.edit.own',
    'posts.draft',
    
    // Media (own only)
    'media.upload',
    'media.own'
  ]
}

export function getRolePermissions(role: UserRole): string[] {
  return ROLE_PERMISSIONS[role] || []
}

export function hasPermission(userPermissions: string[], requiredPermission: string): boolean {
  // Check for exact permission match
  if (userPermissions.includes(requiredPermission)) {
    return true
  }
  
  // Check for wildcard permissions (e.g., 'posts.*' allows 'posts.create')
  const wildcardPermissions = userPermissions.filter(p => p.endsWith('.*'))
  for (const wildcardPerm of wildcardPermissions) {
    const prefix = wildcardPerm.slice(0, -2) // Remove '.*'
    if (requiredPermission.startsWith(prefix + '.')) {
      return true
    }
  }
  
  return false
}

export function hasRole(userRole: UserRole, allowedRoles: UserRole[]): boolean {
  return allowedRoles.includes(userRole)
}

export function canAccessResource(
  userRole: UserRole,
  userPermissions: string[],
  requiredPermission: string,
  ownerId?: string,
  userId?: string
): boolean {
  // Admins have access to everything
  if (userRole === 'admin') {
    return true
  }
  
  // Check if user has the base permission
  if (hasPermission(userPermissions, requiredPermission)) {
    return true
  }
  
  // Check for owner-specific permissions (e.g., 'posts.edit.own')
  if (ownerId && userId && ownerId === userId) {
    const ownPermission = requiredPermission + '.own'
    if (hasPermission(userPermissions, ownPermission)) {
      return true
    }
  }
  
  return false
}