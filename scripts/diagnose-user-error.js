#!/usr/bin/env node

/**
 * Comprehensive User Document Error Diagnostic
 * Identifies where "User document not found" error is occurring
 */

require('dotenv').config({ path: '.env' })

const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m'
}

function colorLog(color, message) {
  console.log(`${colors[color]}${message}${colors.reset}`)
}

console.log('🔍 Diagnosing "User document not found" Error\n')

async function checkCredentialStatus() {
  colorLog('blue', '1️⃣ Checking Credential Status...')
  
  const issues = []
  const fixes = []
  
  // Service account check
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL
  if (!clientEmail || !clientEmail.includes('.iam.gserviceaccount.com')) {
    issues.push('❌ Invalid service account format')
    fixes.push('Get proper service account from Firebase Console → Service accounts')
  }
  
  // Private key check  
  const privateKey = process.env.FIREBASE_PRIVATE_KEY
  if (!privateKey || !privateKey.includes('BEGIN PRIVATE KEY') || privateKey.length < 1000) {
    issues.push('❌ Invalid private key format')
    fixes.push('Get proper private key from Firebase service account JSON')
  }
  
  // Admin email check
  const adminEmails = process.env.ADMIN_EMAILS
  if (!adminEmails || adminEmails.includes('example.com')) {
    issues.push('❌ Invalid admin emails')
    fixes.push('Update ADMIN_EMAILS with your real email address')
  }
  
  if (issues.length > 0) {
    colorLog('red', 'Credential Issues Found:')
    issues.forEach(issue => console.log(`  ${issue}`))
    colorLog('yellow', '\nRequired Fixes:')
    fixes.forEach((fix, index) => console.log(`  ${index + 1}. ${fix}`))
    return false
  }
  
  colorLog('green', '✅ Credentials appear valid')
  return true
}

async function testAdminSDKConnection() {
  colorLog('blue', '\n2️⃣ Testing Firebase Admin SDK Connection...')
  
  try {
    // Basic Firebase Admin initialization test
    const admin = require('firebase-admin')
    
    if (admin.apps.length === 0) {
      admin.initializeApp({
        credential: admin.credential.cert({
          type: "service_account",
          project_id: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
          private_key_id: "dummy",
          private_key: process.env.FIREBASE_PRIVATE_KEY,
          client_email: process.env.FIREBASE_CLIENT_EMAIL,
          client_id: "dummy",
          auth_uri: "https://accounts.google.com/o/oauth2/auth",
          token_uri: "https://oauth2.googleapis.com/token"
        })
      })
    }
    
    // Test Firestore connection
    const db = admin.firestore()
    await db.collection('test').limit(1).get()
    
    colorLog('green', '✅ Firebase Admin SDK connected successfully')
    return true
  } catch (error) {
    colorLog('red', `❌ Firebase Admin SDK connection failed:`)
    console.log(`   Error: ${error.message}`)
    return false
  }
}

async function checkFirestoreStructure() {
  colorLog('blue', '\n3️⃣ Checking Firestore Database Structure...')
  
  try {
    const admin = require('firebase-admin')
    const db = admin.firestore()
    
    // Check if users collection exists
    const usersRef = db.collection('users')
    const usersSnapshot = await usersRef.limit(5).get()
    
    if (usersSnapshot.empty) {
      colorLog('yellow', '⚠️  Users collection is empty')
      console.log('   Created collection but no user documents inside')
      return { hasCollection: true, hasUsers: false, userCount: 0 }
    }
    
    colorLog('green', `✅ Found ${usersSnapshot.size} user document(s)`)
    
    // Check specific admin user
    const adminEmails = process.env.ADMIN_EMAILS?.split(',').map(email => email.trim()) || []
    const foundUsers = []
    
    for (const email of adminEmails) {
      const userQuery = await usersRef.where('email', '==', email).limit(1).get()
      if (!userQuery.empty) {
        const userData = userQuery.docs[0].data()
        foundUsers.push({ email, role: userData.role })
        colorLog('green', `✅ Found user: ${email} (${userData.role})`)
      } else {
        colorLog('red', `❌ Missing user: ${email}`)
      }
    }
    
    return { 
      hasCollection: true, 
      hasUsers: true, 
      userCount: usersSnapshot.size,
      foundUsers,
      missingUsers: adminEmails.filter(email => 
        !foundUsers.some(user => user.email === email)
      )
    }
    
  } catch (error) {
    colorLog('red', `❌ Failed to check Firestore structure:`)
    console.log(`   Error: ${error.message}`)
    return { hasCollection: false, hasUsers: false, error: error.message }
  }
}

async function generateSolution(credentialStatus, connectionStatus, dbStatus) {
  colorLog('blue', '\n4️⃣ Generating Solution Plan...')
  
  const solutions = []
  
  if (!credentialStatus) {
    solutions.push({
      priority: 'HIGH',
      title: 'Fix Firebase Credentials',
      steps: [
        'Go to Firebase Console → Project Settings → Service accounts',
        'Generate new private key and download JSON',
        'Update .env with proper service account email and private key',
        'Update ADMIN_EMAILS with your real email'
      ]
    })
  }
  
  if (!connectionStatus) {
    solutions.push({
      priority: 'HIGH', 
      title: 'Fix Firebase Connection',
      steps: [
        'Ensure Firestore database is created in Firebase Console',
        'Check that all environment variables are set correctly',
        'Restart development server after changing .env'
      ]
    })
  }
  
  if (dbStatus.hasCollection && !dbStatus.hasUsers) {
    solutions.push({
      priority: 'MEDIUM',
      title: 'Create User Documents',
      steps: [
        'Run: npm run firebase:setup',
        'This will create admin user documents in Firestore',
        'User documents contain email, role, permissions, etc.'
      ]
    })
  }
  
  if (dbStatus.missingUsers?.length > 0) {
    solutions.push({
      priority: 'MEDIUM',
      title: `Create Missing Users: ${dbStatus.missingUsers.join(', ')}`,
      steps: [
        'Run: npm run firebase:setup',
        'Will create missing admin users',
        'Default password: TempPassword123!'
      ]
    })
  }
  
  return solutions
}

async function main() {
  try {
    colorLog('bright', '🚨 User Document Error Diagnostic Report\n')
    
    // Run diagnostic steps
    const credentialStatus = await checkCredentialStatus()
    const connectionStatus = credentialStatus ? await testAdminSDKConnection() : false
    const dbStatus = connectionStatus ? await checkFirestoreStructure() : { hasCollection: false, hasUsers: false }
    
    // Generate solutions
    const solutions = await generateSolution(credentialStatus, connectionStatus, dbStatus)
    
    // Display results
    colorLog('bright', '\n📊 Diagnostic Summary:')
    console.log(`Credentials: ${credentialStatus ? '✅' : '❌'}`)
    console.log(`Connection: ${connectionStatus ? '✅' : '❌'}`) 
    console.log(`Database: ${dbStatus.hasCollection ? '✅' : '❌'}`)
    console.log(`Users: ${dbStatus.hasUsers ? '✅' : '❌'}`)
    
    if (solutions.length > 0) {
      colorLog('bright', '\n🔧 Required Solutions:')
      solutions.forEach((solution, index) => {
        colorLog('yellow', `\n${index + 1}. ${solution.title} (${solution.priority} PRIORITY)`)
        solution.steps.forEach(step => console.log(`   • ${step}`))
      })
    } else {
      colorLog('green', '\n🎉 All checks passed! Your setup should be working.')
      colorLog('cyan', 'Test login at: http://localhost:3000/admin/login')
    }
    
    // Next steps
    colorLog('bright', '\n🎯 Next Steps:')
    if (!credentialStatus) {
      colorLog('cyan', '1. Fix credentials first: cat URGENT_FIX_CREDENTIALS.md')
    } else if (!connectionStatus) {
      colorLog('cyan', '1. Check Firebase Console for database creation')
    } else if (!dbStatus.hasUsers) {
      colorLog('cyan', '1. Create user documents: npm run firebase:setup')
    } else {
      colorLog('cyan', '1. Test login: npm run dev → http://localhost:3000/admin/login')
    }
    
  } catch (error) {
    colorLog('red', `\n💥 Diagnostic failed: ${error.message}`)
    process.exit(1)
  }
}

main()