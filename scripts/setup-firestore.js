#!/usr/bin/env node

/**
 * Firestore Database Setup Script
 * Sets up initial collections, sample data, and indexes for Variety Vibes admin panel
 */

require('dotenv').config()
const admin = require('firebase-admin')

// Initialize Firebase Admin SDK with environment variables
const serviceAccount = {
  type: "service_account",
  project_id: process.env.FIREBASE_PROJECT_ID,
  private_key: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
  client_email: process.env.FIREBASE_CLIENT_EMAIL,
  auth_uri: "https://accounts.google.com/o/oauth2/auth",
  token_uri: "https://oauth2.googleapis.com/token",
  auth_provider_x509_cert_url: "https://www.googleapis.com/oauth2/v1/certs",
  client_x509_cert_url: `https://www.googleapis.com/robot/v1/metadata/x509/${process.env.FIREBASE_CLIENT_EMAIL}`
}

console.log('🔧 Firebase Config Check:')
console.log('- Project ID:', process.env.FIREBASE_PROJECT_ID)
console.log('- Client Email:', process.env.FIREBASE_CLIENT_EMAIL)
console.log('- Private Key Length:', process.env.FIREBASE_PRIVATE_KEY?.length || 0)

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    storageBucket: process.env.FIREBASE_STORAGE_BUCKET
  })
}

const db = admin.firestore()
const auth = admin.auth()

async function setupCollections() {
  console.log('🚀 Setting up Firestore collections...')
  
  try {
    // 1. Set up initial admin users from environment variables
    const adminEmails = process.env.ADMIN_EMAILS?.split(',') || []
    const defaultPassword = process.env.ADMIN_DEFAULT_PASSWORD || 'TempPassword123!'
    
    console.log('👥 Setting up admin users...')
    for (const email of adminEmails) {
      const cleanEmail = email.trim()
      if (!cleanEmail) continue
      
      try {
        // Create Firebase Auth user
        let userRecord
        try {
          userRecord = await auth.getUserByEmail(cleanEmail)
          console.log(`✅ Admin user ${cleanEmail} already exists`)
        } catch (error) {
          if (error.code === 'auth/user-not-found') {
            userRecord = await auth.createUser({
              email: cleanEmail,
              password: defaultPassword,
              displayName: cleanEmail.split('@')[0],
              emailVerified: true
            })
            console.log(`✅ Created admin user: ${cleanEmail}`)
          } else {
            throw error
          }
        }
        
        // Create Firestore user document
        const userDoc = {
          uid: userRecord.uid,
          email: userRecord.email,
          displayName: userRecord.displayName || cleanEmail.split('@')[0],
          role: 'admin',
          permissions: [
            'posts.create', 'posts.edit', 'posts.delete', 'posts.publish',
            'categories.create', 'categories.edit', 'categories.delete',
            'users.create', 'users.edit', 'users.delete', 'users.roles',
            'media.upload', 'media.delete', 'settings.edit', 'analytics.view'
          ],
          active: true,
          bio: 'Administrator',
          expertise: ['Administration'],
          social: {},
          createdAt: admin.firestore.FieldValue.serverTimestamp(),
          joinDate: admin.firestore.FieldValue.serverTimestamp(),
          lastLogin: admin.firestore.FieldValue.serverTimestamp(),
          postsCount: 0,
          draftsCount: 0,
          totalViews: 0
        }
        
        await db.collection('users').doc(userRecord.uid).set(userDoc, { merge: true })
        console.log(`✅ Created Firestore document for: ${cleanEmail}`)
        
      } catch (error) {
        console.error(`❌ Error setting up user ${cleanEmail}:`, error.message)
      }
    }
    
    // 2. Set up sample categories
    console.log('📁 Setting up sample categories...')
    const categories = [
      {
        slug: 'auto-insurance',
        name: 'Auto Insurance',
        description: 'Everything about car insurance, coverage options, and tips for getting the best rates.',
        color: '#3B82F6',
        icon: '🚗',
        featured: true,
        active: true,
        sortOrder: 1,
        seo: {
          title: 'Auto Insurance - Tips and Coverage Guide',
          description: 'Comprehensive guide to auto insurance, coverage options, and money-saving tips.',
          keywords: ['auto insurance', 'car insurance', 'coverage', 'rates']
        },
        hero: {
          title: 'Auto Insurance Guide',
          subtitle: 'Find the perfect coverage for your needs',
          backgroundImage: ''
        },
        postCount: 0,
        totalViews: 0
      },
      {
        slug: 'health-insurance',
        name: 'Health Insurance',
        description: 'Health insurance insights, coverage comparisons, and healthcare cost management.',
        color: '#10B981',
        icon: '🏥',
        featured: true,
        active: true,
        sortOrder: 2,
        seo: {
          title: 'Health Insurance - Coverage and Cost Guide',
          description: 'Navigate health insurance options, understand coverage, and manage healthcare costs.',
          keywords: ['health insurance', 'healthcare', 'medical coverage', 'insurance plans']
        },
        hero: {
          title: 'Health Insurance Central',
          subtitle: 'Your guide to better healthcare coverage',
          backgroundImage: ''
        },
        postCount: 0,
        totalViews: 0
      },
      {
        slug: 'home-improvement',
        name: 'Home Improvement',
        description: 'Home renovation ideas, DIY projects, and property value enhancement tips.',
        color: '#F59E0B',
        icon: '🏠',
        featured: false,
        active: true,
        sortOrder: 3,
        seo: {
          title: 'Home Improvement - Renovation and DIY Ideas',
          description: 'Transform your home with renovation ideas, DIY projects, and value-adding improvements.',
          keywords: ['home improvement', 'renovation', 'DIY', 'home value', 'property']
        },
        hero: {
          title: 'Home Improvement Hub',
          subtitle: 'Transform your space with expert tips',
          backgroundImage: ''
        },
        postCount: 0,
        totalViews: 0
      },
      {
        slug: 'warranty',
        name: 'Warranty',
        description: 'Product warranties, extended coverage options, and protection plan guides.',
        color: '#8B5CF6',
        icon: '🛡️',
        featured: false,
        active: true,
        sortOrder: 4,
        seo: {
          title: 'Warranty Guide - Protection Plans and Coverage',
          description: 'Understand warranties, extended coverage, and protection plans for your purchases.',
          keywords: ['warranty', 'extended warranty', 'protection plan', 'coverage']
        },
        hero: {
          title: 'Warranty Central',
          subtitle: 'Protect your investments with the right coverage',
          backgroundImage: ''
        },
        postCount: 0,
        totalViews: 0
      },
      {
        slug: 'loans',
        name: 'Loans',
        description: 'Personal loans, mortgages, refinancing, and lending options guide.',
        color: '#EF4444',
        icon: '💰',
        featured: true,
        active: true,
        sortOrder: 5,
        seo: {
          title: 'Loans and Lending - Your Financial Guide',
          description: 'Navigate personal loans, mortgages, and lending options with expert advice.',
          keywords: ['loans', 'personal loan', 'mortgage', 'refinancing', 'lending']
        },
        hero: {
          title: 'Loan Guide',
          subtitle: 'Smart borrowing for your financial goals',
          backgroundImage: ''
        },
        postCount: 0,
        totalViews: 0
      }
    ]
    
    for (const category of categories) {
      const docData = {
        ...category,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        createdBy: adminEmails[0]?.trim() || 'system'
      }
      
      await db.collection('categories').add(docData)
      console.log(`✅ Created category: ${category.name}`)
    }
    
    // 3. Set up site configuration
    console.log('⚙️ Setting up site configuration...')
    const siteConfig = {
      id: 'main',
      siteName: 'Variety Vibes',
      tagline: 'Insights and Stories for Every Day',
      description: 'Crafting insights and stories through daily content on various topics that matter to you.',
      defaultSEO: {
        title: 'Variety Vibes - Insights and Stories for Every Day',
        description: 'Get expert insights on insurance, home improvement, and financial topics.',
        keywords: ['insurance', 'home improvement', 'loans', 'warranty', 'financial advice'],
        ogImage: ''
      },
      socialMedia: {
        twitter: 'https://twitter.com/varietyvibes',
        facebook: 'https://facebook.com/varietyvibes',
        instagram: 'https://instagram.com/varietyvibes',
        linkedin: 'https://linkedin.com/company/varietyvibes',
        youtube: 'https://youtube.com/@varietyvibes'
      },
      googleAnalyticsId: process.env.NEXT_PUBLIC_GOOGLE_ANALYTICS_ID || '',
      googleTagManagerId: '',
      features: {
        comments: true,
        newsletter: true,
        darkMode: true,
        search: true
      },
      maintenanceMode: false,
      maintenanceMessage: '',
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedBy: adminEmails[0]?.trim() || 'system'
    }
    
    await db.collection('site_config').doc('main').set(siteConfig)
    console.log('✅ Created site configuration')
    
    console.log('🎉 Firestore setup completed successfully!')
    
  } catch (error) {
    console.error('❌ Error setting up Firestore:', error)
    process.exit(1)
  }
}

// Run setup if called directly
if (require.main === module) {
  setupCollections()
    .then(() => {
      console.log('✅ Setup completed!')
      process.exit(0)
    })
    .catch((error) => {
      console.error('❌ Setup failed:', error)
      process.exit(1)
    })
}

module.exports = { setupCollections }