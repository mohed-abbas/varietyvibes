#!/usr/bin/env node

/**
 * Firebase Configuration Test Script
 * Tests if Firebase configuration is properly set up
 */

const path = require('path')
require('dotenv').config({ path: path.join(__dirname, '../.env') })

console.log('🔥 Testing Firebase Configuration...\n')

// Test environment variables
console.log('📋 Environment Variables:')
console.log('NEXT_PUBLIC_FIREBASE_API_KEY:', process.env.NEXT_PUBLIC_FIREBASE_API_KEY ? '✅ Set' : '❌ Missing')
console.log('NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN:', process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN ? '✅ Set' : '❌ Missing')
console.log('NEXT_PUBLIC_FIREBASE_PROJECT_ID:', process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID ? '✅ Set' : '❌ Missing')
console.log('FIREBASE_CLIENT_EMAIL:', process.env.FIREBASE_CLIENT_EMAIL ? '✅ Set' : '❌ Missing')
console.log('FIREBASE_PRIVATE_KEY:', process.env.FIREBASE_PRIVATE_KEY ? '✅ Set' : '❌ Missing')
console.log('ADMIN_EMAILS:', process.env.ADMIN_EMAILS ? '✅ Set' : '❌ Missing')

// Validate service account email format
if (process.env.FIREBASE_CLIENT_EMAIL) {
  const isValidServiceAccount = process.env.FIREBASE_CLIENT_EMAIL.includes('@') && 
    process.env.FIREBASE_CLIENT_EMAIL.includes('.iam.gserviceaccount.com')
  console.log('Service Account Format:', isValidServiceAccount ? '✅ Valid' : '❌ Invalid (should end with .iam.gserviceaccount.com)')
}

// Validate private key format
if (process.env.FIREBASE_PRIVATE_KEY) {
  const hasProperKeyFormat = process.env.FIREBASE_PRIVATE_KEY.includes('BEGIN PRIVATE KEY') && 
    process.env.FIREBASE_PRIVATE_KEY.length > 1000
  console.log('Private Key Format:', hasProperKeyFormat ? '✅ Valid' : '❌ Invalid (should be long and contain BEGIN PRIVATE KEY)')
}

// Validate admin emails
if (process.env.ADMIN_EMAILS) {
  const hasRealEmails = !process.env.ADMIN_EMAILS.includes('example.com')
  console.log('Admin Emails:', hasRealEmails ? '✅ Valid' : '❌ Still using example emails')
}

console.log('\n🧪 Testing Firebase Admin SDK Connection...')

try {
  const { initializeApp, cert } = require('firebase-admin/app')
  const { getAuth } = require('firebase-admin/auth')
  
  const app = initializeApp({
    credential: cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n')
    })
  })
  
  const auth = getAuth(app)
  console.log('Firebase Admin SDK:', '✅ Initialized successfully')
  
} catch (error) {
  console.log('Firebase Admin SDK:', '❌ Failed to initialize')
  console.log('Error:', error.message)
}

console.log('\n📝 Next Steps:')
console.log('1. Fix any ❌ issues above')
console.log('2. Follow FIREBASE_SETUP_GUIDE.md for detailed instructions')
console.log('3. Run: npm run dev')
console.log('4. Visit: http://localhost:3000/admin/login')
console.log('5. Run: node scripts/setup-firebase.js (after fixing credentials)')