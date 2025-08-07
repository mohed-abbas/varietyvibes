#!/usr/bin/env node

/**
 * User Setup Verification Script
 * 
 * This script verifies that the user documents have been created successfully
 */

const { initializeApp, cert } = require('firebase-admin/app')
const { getAuth } = require('firebase-admin/auth')
const { getFirestore } = require('firebase-admin/firestore')
const path = require('path')
require('dotenv').config({ path: path.join(__dirname, '../.env') })

async function initializeFirebase() {
  console.log('🔧 Initializing Firebase Admin SDK...')
  
  try {
    const app = initializeApp({
      credential: cert({
        projectId: process.env.FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n')
      })
    }, 'verify-app')
    
    const auth = getAuth(app)
    const db = getFirestore(app)
    
    console.log('✅ Firebase Admin SDK initialized')
    return { auth, db }
  } catch (error) {
    console.error('❌ Failed to initialize Firebase:', error.message)
    process.exit(1)
  }
}

async function verifyUserSetup(auth, db) {
  console.log('🔍 Verifying user setup...')
  
  const adminEmails = process.env.ADMIN_EMAILS?.split(',') || []
  
  for (const email of adminEmails) {
    const trimmedEmail = email.trim()
    if (!trimmedEmail) continue
    
    try {
      // Check Firebase Auth
      const userRecord = await auth.getUserByEmail(trimmedEmail)
      console.log(`✅ Auth user exists: ${trimmedEmail} (${userRecord.uid})`)
      
      // Check Firestore document
      const userDoc = await db.collection('users').doc(userRecord.uid).get()
      
      if (userDoc.exists) {
        const userData = userDoc.data()
        console.log(`✅ Firestore document exists: ${trimmedEmail}`)
        console.log(`   - Role: ${userData.role}`)
        console.log(`   - Active: ${userData.active}`)
        console.log(`   - Permissions: ${userData.permissions?.length || 0} permissions`)
      } else {
        console.log(`❌ Firestore document missing: ${trimmedEmail}`)
      }
      
    } catch (error) {
      console.error(`❌ Error checking user ${trimmedEmail}:`, error.message)
    }
    
    console.log('') // Empty line for readability
  }
}

async function main() {
  console.log('🚀 Starting user setup verification\n')
  
  try {
    const { auth, db } = await initializeFirebase()
    await verifyUserSetup(auth, db)
    
    console.log('🎉 User setup verification completed!')
    
  } catch (error) {
    console.error('\n❌ Verification failed:', error.message)
    process.exit(1)
  }
}

if (require.main === module) {
  main()
}