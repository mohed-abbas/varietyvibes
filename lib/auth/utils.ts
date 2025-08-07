// Authentication utility functions
import { adminAuth, adminDb } from '@/lib/firebase/admin'
import { FieldValue } from 'firebase-admin/firestore'
import { getRolePermissions } from './permissions'
import { UserRole, FirestoreUser } from '@/types/admin'

/**
 * Creates a new admin user in Firestore
 */
export async function createAdminUser(
  email: string,
  displayName: string,
  role: UserRole = 'admin'
): Promise<FirestoreUser> {
  try {
    // Create the user in Firebase Auth
    const userRecord = await adminAuth.createUser({
      email,
      displayName,
      emailVerified: true
    })

    // Get role permissions
    const permissions = getRolePermissions(role)

    // Create user document in Firestore
    const userData: Omit<FirestoreUser, 'uid'> = {
      email,
      displayName,
      role,
      permissions,
      active: true,
      bio: '',
      expertise: [],
      social: {},
      createdAt: new Date(),
      lastLogin: new Date(),
      joinDate: new Date(),
      postsCount: 0,
      draftsCount: 0,
      totalViews: 0
    }

    await adminDb.collection('users').doc(userRecord.uid).set({
      ...userData,
      createdAt: FieldValue.serverTimestamp(),
      lastLogin: FieldValue.serverTimestamp(),
      joinDate: FieldValue.serverTimestamp()
    })

    return {
      uid: userRecord.uid,
      ...userData
    }
  } catch (error) {
    console.error('Error creating admin user:', error)
    throw new Error(`Failed to create admin user: ${error}`)
  }
}

/**
 * Bootstraps initial admin users from environment variables
 */
export async function bootstrapAdminUsers(): Promise<void> {
  const adminEmails = process.env.ADMIN_EMAILS?.split(',') || []
  
  for (const email of adminEmails) {
    const trimmedEmail = email.trim()
    if (!trimmedEmail) continue

    try {
      // Check if user already exists
      const existingUser = await adminAuth.getUserByEmail(trimmedEmail).catch(() => null)
      
      if (existingUser) {
        console.log(`Admin user ${trimmedEmail} already exists`)
        
        // Update their role to admin if they exist but aren't admin
        const userDoc = await adminDb.collection('users').doc(existingUser.uid).get()
        if (userDoc.exists && userDoc.data()?.role !== 'admin') {
          await adminDb.collection('users').doc(existingUser.uid).update({
            role: 'admin',
            permissions: getRolePermissions('admin'),
            updatedAt: FieldValue.serverTimestamp()
          })
          console.log(`Updated ${trimmedEmail} to admin role`)
        }
      } else {
        // Create new admin user
        const displayName = trimmedEmail.split('@')[0].replace(/[._]/g, ' ')
        await createAdminUser(trimmedEmail, displayName, 'admin')
        console.log(`Created admin user: ${trimmedEmail}`)
      }
    } catch (error) {
      console.error(`Failed to bootstrap admin user ${trimmedEmail}:`, error)
    }
  }
}

/**
 * Updates user permissions when role changes
 */
export async function updateUserRole(uid: string, newRole: UserRole): Promise<void> {
  try {
    const permissions = getRolePermissions(newRole)
    
    await adminDb.collection('users').doc(uid).update({
      role: newRole,
      permissions,
      updatedAt: FieldValue.serverTimestamp()
    })
  } catch (error) {
    console.error('Error updating user role:', error)
    throw new Error(`Failed to update user role: ${error}`)
  }
}

/**
 * Deactivates a user account
 */
export async function deactivateUser(uid: string): Promise<void> {
  try {
    // Disable in Firebase Auth
    await adminAuth.updateUser(uid, { disabled: true })
    
    // Update in Firestore
    await adminDb.collection('users').doc(uid).update({
      active: false,
      updatedAt: FieldValue.serverTimestamp()
    })
  } catch (error) {
    console.error('Error deactivating user:', error)
    throw new Error(`Failed to deactivate user: ${error}`)
  }
}

/**
 * Reactivates a user account
 */
export async function reactivateUser(uid: string): Promise<void> {
  try {
    // Enable in Firebase Auth
    await adminAuth.updateUser(uid, { disabled: false })
    
    // Update in Firestore
    await adminDb.collection('users').doc(uid).update({
      active: true,
      updatedAt: FieldValue.serverTimestamp()
    })
  } catch (error) {
    console.error('Error reactivating user:', error)
    throw new Error(`Failed to reactivate user: ${error}`)
  }
}

/**
 * Validates if an email is in the admin emails list
 */
export function isAdminEmail(email: string): boolean {
  const adminEmails = process.env.ADMIN_EMAILS?.split(',').map(e => e.trim()) || []
  return adminEmails.includes(email)
}

/**
 * Creates a user document for newly authenticated users
 * This is called automatically when a user signs in for the first time
 */
export async function ensureUserDocument(uid: string, email: string, displayName?: string): Promise<FirestoreUser> {
  try {
    // Check if user document already exists
    const userDoc = await adminDb.collection('users').doc(uid).get()
    
    if (userDoc.exists) {
      // Update last login
      await adminDb.collection('users').doc(uid).update({
        lastLogin: FieldValue.serverTimestamp()
      })
      return { uid, ...userDoc.data() } as FirestoreUser
    }

    // Determine role based on admin email list
    const role: UserRole = isAdminEmail(email) ? 'admin' : 'author'
    const permissions = getRolePermissions(role)

    // Create new user document
    const userData: Omit<FirestoreUser, 'uid'> = {
      email,
      displayName: displayName || email.split('@')[0].replace(/[._]/g, ' '),
      role,
      permissions,
      active: true,
      bio: '',
      expertise: [],
      social: {},
      createdAt: new Date(),
      lastLogin: new Date(),
      joinDate: new Date(),
      postsCount: 0,
      draftsCount: 0,
      totalViews: 0
    }

    await adminDb.collection('users').doc(uid).set({
      ...userData,
      createdAt: FieldValue.serverTimestamp(),
      lastLogin: adminDb.FieldValue.serverTimestamp(),
      joinDate: FieldValue.serverTimestamp()
    })

    console.log(`Created user document for: ${email} with role: ${role}`)
    
    return {
      uid,
      ...userData
    }
  } catch (error) {
    console.error('Error ensuring user document:', error)
    throw new Error(`Failed to create user document: ${error}`)
  }
}