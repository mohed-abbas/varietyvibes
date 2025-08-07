// Firebase Admin SDK configuration
import { initializeApp, getApps, cert, ServiceAccount } from 'firebase-admin/app'
import { getAuth } from 'firebase-admin/auth'
import { getFirestore } from 'firebase-admin/firestore'
import { getStorage } from 'firebase-admin/storage'

// Admin configuration
const adminConfig = {
  credential: cert({
    projectId: process.env.FIREBASE_PROJECT_ID,
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
    privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n')
  } as ServiceAccount)
}

// Initialize admin app only once
const adminApp = getApps().length === 0 
  ? initializeApp(adminConfig, 'admin') 
  : getApps().find(app => app.name === 'admin') || initializeApp(adminConfig, 'admin')

// Export admin services
export const adminAuth = getAuth(adminApp)
export const adminDb = getFirestore(adminApp)
export const adminStorage = getStorage(adminApp)

export default adminApp