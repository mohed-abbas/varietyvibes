// Firebase Admin SDK configuration
import { initializeApp, getApps, cert, ServiceAccount, App } from 'firebase-admin/app'
import { getAuth, Auth } from 'firebase-admin/auth'
import { getFirestore, Firestore } from 'firebase-admin/firestore'
import { getStorage, Storage } from 'firebase-admin/storage'

let adminApp: App
let adminAuth: Auth
let adminDb: Firestore
let adminStorage: Storage

export function initializeFirebaseAdmin() {
  if (getApps().length > 0) {
    // Already initialized
    const existingApp = getApps()[0]
    adminApp = existingApp
    adminAuth = getAuth(adminApp)
    adminDb = getFirestore(adminApp)
    adminStorage = getStorage(adminApp)
    return adminApp
  }

  // Admin configuration
  const adminConfig = {
    credential: cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n')
    } as ServiceAccount),
    storageBucket: process.env.FIREBASE_STORAGE_BUCKET
  }

  // Initialize admin app
  adminApp = initializeApp(adminConfig)
  adminAuth = getAuth(adminApp)
  adminDb = getFirestore(adminApp)
  adminStorage = getStorage(adminApp)

  return adminApp
}

// Initialize on import for server-side usage
if (typeof window === 'undefined') {
  initializeFirebaseAdmin()
}

// Export services (initialize if needed)
export function getAdminAuth(): Auth {
  if (!adminAuth) initializeFirebaseAdmin()
  return adminAuth
}

export function getAdminDb(): Firestore {
  if (!adminDb) initializeFirebaseAdmin()
  return adminDb
}

export function getAdminStorage(): Storage {
  if (!adminStorage) initializeFirebaseAdmin()
  return adminStorage
}

export { adminApp, adminAuth, adminDb, adminStorage }