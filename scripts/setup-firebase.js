#!/usr/bin/env node

/**
 * Firebase Setup Script for Variety Vibes Admin Panel
 * 
 * This script helps set up Firebase for the admin panel:
 * 1. Validates environment variables
 * 2. Tests Firebase connections
 * 3. Creates initial admin users
 * 4. Sets up basic collections
 */

const { initializeApp, cert } = require('firebase-admin/app')
const { getAuth } = require('firebase-admin/auth')
const { getFirestore, FieldValue } = require('firebase-admin/firestore')
const path = require('path')
require('dotenv').config({ path: path.join(__dirname, '../.env') })

// Role permissions
const ROLE_PERMISSIONS = {
  admin: [
    'posts.create', 'posts.edit', 'posts.delete', 'posts.publish', 'posts.moderate',
    'categories.create', 'categories.edit', 'categories.delete',
    'users.create', 'users.edit', 'users.delete', 'users.roles', 'users.view',
    'media.upload', 'media.delete', 'media.manage',
    'settings.edit', 'settings.view',
    'analytics.view',
    'system.backup', 'system.maintenance'
  ],
  editor: [
    'posts.create', 'posts.edit', 'posts.publish', 'posts.moderate',
    'categories.create', 'categories.edit',
    'media.upload', 'media.manage',
    'analytics.view', 'users.view'
  ],
  author: [
    'posts.create', 'posts.edit.own', 'posts.draft',
    'media.upload', 'media.own'
  ]
}

async function validateEnvironment() {
  console.log('🔍 Validating environment variables...')
  
  const required = [
    'FIREBASE_PROJECT_ID',
    'FIREBASE_CLIENT_EMAIL', 
    'FIREBASE_PRIVATE_KEY'
  ]
  
  const missing = required.filter(key => !process.env[key])
  
  if (missing.length > 0) {
    console.error('❌ Missing required environment variables:')
    missing.forEach(key => console.error(`   - ${key}`))
    console.error('\nPlease copy .env.example to .env.local and fill in your Firebase credentials.')
    process.exit(1)
  }
  
  console.log('✅ Environment variables validated')
}

async function initializeFirebase() {
  console.log('🔧 Initializing Firebase Admin SDK...')
  
  try {
    const app = initializeApp({
      credential: cert({
        projectId: process.env.FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n')
      })
    })
    
    const auth = getAuth(app)
    const db = getFirestore(app)
    
    console.log('✅ Firebase Admin SDK initialized')
    return { auth, db }
  } catch (error) {
    console.error('❌ Failed to initialize Firebase:', error.message)
    process.exit(1)
  }
}

async function createAdminUsers(auth, db) {
  console.log('👤 Setting up admin users...')
  
  const adminEmails = process.env.ADMIN_EMAILS?.split(',') || []
  
  if (adminEmails.length === 0) {
    console.log('⚠️  No admin emails configured in ADMIN_EMAILS')
    return
  }
  
  for (const email of adminEmails) {
    const trimmedEmail = email.trim()
    if (!trimmedEmail) continue
    
    try {
      // Check if user already exists
      let userRecord
      try {
        userRecord = await auth.getUserByEmail(trimmedEmail)
        console.log(`👤 User ${trimmedEmail} already exists`)
      } catch {
        // Create new user
        userRecord = await auth.createUser({
          email: trimmedEmail,
          displayName: trimmedEmail.split('@')[0].replace(/[._]/g, ' '),
          emailVerified: true
        })
        console.log(`✅ Created user: ${trimmedEmail}`)
      }
      
      // Create/update user document in Firestore
      const userData = {
        email: trimmedEmail,
        displayName: userRecord.displayName || trimmedEmail.split('@')[0],
        role: 'admin',
        permissions: ROLE_PERMISSIONS.admin,
        active: true,
        bio: '',
        expertise: [],
        social: {},
        createdAt: FieldValue.serverTimestamp(),
        lastLogin: FieldValue.serverTimestamp(),
        joinDate: FieldValue.serverTimestamp(),
        postsCount: 0,
        draftsCount: 0,
        totalViews: 0
      }
      
      await db.collection('users').doc(userRecord.uid).set(userData, { merge: true })
      console.log(`✅ Updated Firestore document for: ${trimmedEmail}`)
      
    } catch (error) {
      console.error(`❌ Failed to setup admin user ${trimmedEmail}:`, error.message)
    }
  }
}

async function setupCollections(db) {
  console.log('📁 Setting up collections...')
  
  try {
    // Create site config
    await db.collection('site_config').doc('main').set({
      siteName: 'Variety Vibes',
      tagline: 'Your go-to source for diverse content',
      description: 'A comprehensive blog covering various topics from lifestyle to technology.',
      defaultSEO: {
        title: 'Variety Vibes - Diverse Content Blog',
        description: 'Discover diverse content on lifestyle, technology, health, and more.',
        keywords: ['blog', 'lifestyle', 'technology', 'health', 'variety'],
        ogImage: '/images/og-default.jpg'
      },
      socialMedia: {
        twitter: '',
        facebook: '',
        instagram: '',
        linkedin: '',
        youtube: ''
      },
      features: {
        comments: false,
        newsletter: true,
        darkMode: true,
        search: true
      },
      maintenanceMode: false,
      updatedAt: FieldValue.serverTimestamp(),
      updatedBy: 'system'
    }, { merge: true })
    
    console.log('✅ Site configuration created')
    
    // Create sample category
    await db.collection('categories').doc('general').set({
      slug: 'general',
      name: 'General',
      description: 'General topics and discussions',
      color: '#3b82f6',
      icon: 'folder',
      featured: true,
      active: true,
      sortOrder: 1,
      seo: {
        title: 'General - Variety Vibes',
        description: 'General topics and discussions',
        keywords: ['general', 'blog', 'topics']
      },
      hero: {
        title: 'General Topics',
        subtitle: 'Explore a wide range of subjects'
      },
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
      createdBy: 'system',
      postCount: 0,
      totalViews: 0
    }, { merge: true })
    
    console.log('✅ Sample category created')
    
  } catch (error) {
    console.error('❌ Failed to setup collections:', error.message)
  }
}

async function main() {
  console.log('🚀 Starting Firebase setup for Variety Vibes Admin Panel\n')
  
  try {
    await validateEnvironment()
    const { auth, db } = await initializeFirebase()
    await createAdminUsers(auth, db)
    await setupCollections(db)
    
    console.log('\n🎉 Firebase setup completed successfully!')
    console.log('\nNext steps:')
    console.log('1. Deploy Firestore rules: firebase deploy --only firestore:rules')
    console.log('2. Deploy Storage rules: firebase deploy --only storage')
    console.log('3. Start development server: npm run dev')
    console.log('4. Visit http://localhost:3000/admin/login to test login')
    
  } catch (error) {
    console.error('\n❌ Setup failed:', error.message)
    process.exit(1)
  }
}

if (require.main === module) {
  main()
}