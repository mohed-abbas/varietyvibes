// Firebase client configuration
import { initializeApp, FirebaseApp } from 'firebase/app'
import { getAuth, Auth, connectAuthEmulator, setPersistence, browserLocalPersistence } from 'firebase/auth'
import { getFirestore, Firestore, connectFirestoreEmulator } from 'firebase/firestore'
import { getStorage, FirebaseStorage, connectStorageEmulator } from 'firebase/storage'

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID
}

// Initialize Firebase app
let app: FirebaseApp
let auth: Auth
let db: Firestore
let storage: FirebaseStorage

if (typeof window !== 'undefined') {
  // Client-side initialization
  app = initializeApp(firebaseConfig)
  auth = getAuth(app)
  db = getFirestore(app)
  storage = getStorage(app)

  // Set authentication persistence to local storage
  setPersistence(auth, browserLocalPersistence).catch((error) => {
    console.warn('Failed to set auth persistence:', error)
  })

  // Connect to emulators in development (disabled for production Firebase)
  if (process.env.NODE_ENV === 'development' && process.env.USE_FIREBASE_EMULATOR === 'true') {
    const isEmulatorConnected = {
      auth: false,
      firestore: false,
      storage: false
    }

    if (!isEmulatorConnected.auth) {
      try {
        connectAuthEmulator(auth, 'http://localhost:9099', { disableWarnings: true })
        isEmulatorConnected.auth = true
      } catch (error) {
        console.warn('Firebase Auth Emulator connection failed:', error)
      }
    }

    if (!isEmulatorConnected.firestore) {
      try {
        connectFirestoreEmulator(db, 'localhost', 8080)
        isEmulatorConnected.firestore = true
      } catch (error) {
        console.warn('Firebase Firestore Emulator connection failed:', error)
      }
    }

    if (!isEmulatorConnected.storage) {
      try {
        connectStorageEmulator(storage, 'localhost', 9199)
        isEmulatorConnected.storage = true
      } catch (error) {
        console.warn('Firebase Storage Emulator connection failed:', error)
      }
    }
  }
}

export { app, auth, db, storage }
export default firebaseConfig