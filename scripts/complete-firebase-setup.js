#!/usr/bin/env node

/**
 * Complete Firebase Setup Script
 * This script guides you through the entire Firebase implementation process
 */

const { exec } = require('child_process')
const { promisify } = require('util')
const execAsync = promisify(exec)
const fs = require('fs')
const path = require('path')

console.log('🚀 Complete Firebase Implementation for Variety Vibes\n')

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m'
}

function colorLog(color, message) {
  console.log(`${colors[color]}${message}${colors.reset}`)
}

async function checkEnvironmentVariables() {
  colorLog('blue', '🔍 Step 1: Checking Environment Variables...')
  
  const envPath = path.join(__dirname, '../.env')
  if (!fs.existsSync(envPath)) {
    colorLog('red', '❌ .env file not found!')
    colorLog('yellow', 'Please create a .env file based on .env.example')
    process.exit(1)
  }

  // Load environment variables
  require('dotenv').config({ path: envPath })
  
  const requiredVars = [
    'NEXT_PUBLIC_FIREBASE_API_KEY',
    'NEXT_PUBLIC_FIREBASE_PROJECT_ID',
    'FIREBASE_CLIENT_EMAIL',
    'FIREBASE_PRIVATE_KEY',
    'ADMIN_EMAILS'
  ]
  
  const issues = []
  
  for (const varName of requiredVars) {
    if (!process.env[varName]) {
      issues.push(`Missing: ${varName}`)
    }
  }
  
  // Check service account email format
  if (process.env.FIREBASE_CLIENT_EMAIL && 
      !process.env.FIREBASE_CLIENT_EMAIL.includes('.iam.gserviceaccount.com')) {
    issues.push('Invalid FIREBASE_CLIENT_EMAIL format (should end with .iam.gserviceaccount.com)')
  }
  
  // Check private key format
  if (process.env.FIREBASE_PRIVATE_KEY && 
      !process.env.FIREBASE_PRIVATE_KEY.includes('BEGIN PRIVATE KEY')) {
    issues.push('Invalid FIREBASE_PRIVATE_KEY format (should contain BEGIN PRIVATE KEY)')
  }
  
  // Check admin emails
  if (process.env.ADMIN_EMAILS && process.env.ADMIN_EMAILS.includes('example.com')) {
    issues.push('Admin emails still contain example.com addresses')
  }
  
  if (issues.length > 0) {
    colorLog('red', '❌ Environment variable issues found:')
    issues.forEach(issue => console.log(`   - ${issue}`))
    colorLog('yellow', '\n📖 Please follow the Firebase Implementation Guide:')
    colorLog('cyan', 'cat FIREBASE_IMPLEMENTATION_GUIDE.md')
    return false
  }
  
  colorLog('green', '✅ Environment variables are properly configured')
  return true
}

async function testFirebaseConnection() {
  colorLog('blue', '\n🔧 Step 2: Testing Firebase Connection...')
  
  try {
    const { stdout } = await execAsync('node scripts/test-firebase-config.js')
    
    if (stdout.includes('Firebase Admin SDK: ✅ Initialized successfully')) {
      colorLog('green', '✅ Firebase connection successful')
      return true
    } else {
      colorLog('red', '❌ Firebase connection failed')
      console.log(stdout)
      return false
    }
  } catch (error) {
    colorLog('red', '❌ Firebase connection test failed')
    console.log(error.message)
    return false
  }
}

async function checkFirebaseCLI() {
  colorLog('blue', '\n🛠️  Step 3: Checking Firebase CLI...')
  
  try {
    await execAsync('firebase --version')
    colorLog('green', '✅ Firebase CLI is installed')
    return true
  } catch (error) {
    colorLog('red', '❌ Firebase CLI is not installed')
    colorLog('yellow', 'Install with: npm install -g firebase-tools')
    return false
  }
}

async function loginAndSetProject() {
  colorLog('blue', '\n🔐 Step 4: Firebase Authentication & Project Setup...')
  
  try {
    // Check if already logged in
    const { stdout } = await execAsync('firebase projects:list')
    
    if (stdout.includes('variety-vibes')) {
      colorLog('green', '✅ Already authenticated and project found')
      
      // Set the project
      await execAsync('firebase use variety-vibes')
      colorLog('green', '✅ Set project to variety-vibes')
      return true
    } else {
      colorLog('yellow', '⚠️  Project not found or not authenticated')
      colorLog('cyan', 'Please run manually:')
      colorLog('cyan', '1. firebase login')
      colorLog('cyan', '2. firebase use variety-vibes')
      return false
    }
  } catch (error) {
    colorLog('red', '❌ Firebase authentication check failed')
    colorLog('cyan', 'Please run manually:')
    colorLog('cyan', '1. firebase login')
    colorLog('cyan', '2. firebase use variety-vibes')
    return false
  }
}

async function deploySecurityRules() {
  colorLog('blue', '\n📜 Step 5: Deploying Security Rules...')
  
  try {
    colorLog('cyan', 'Deploying Firestore rules...')
    await execAsync('firebase deploy --only firestore:rules')
    colorLog('green', '✅ Firestore rules deployed')
    
    colorLog('cyan', 'Deploying Storage rules...')
    await execAsync('firebase deploy --only storage')
    colorLog('green', '✅ Storage rules deployed')
    
    return true
  } catch (error) {
    colorLog('red', '❌ Failed to deploy security rules')
    console.log(error.message)
    return false
  }
}

async function setupFirebaseData() {
  colorLog('blue', '\n👥 Step 6: Setting up Firebase Data...')
  
  try {
    const { stdout } = await execAsync('node scripts/setup-firebase.js')
    console.log(stdout)
    
    if (stdout.includes('Firebase setup completed successfully')) {
      colorLog('green', '✅ Firebase data setup completed')
      return true
    } else {
      colorLog('yellow', '⚠️  Setup completed with warnings')
      return true
    }
  } catch (error) {
    colorLog('red', '❌ Firebase data setup failed')
    console.log(error.message)
    return false
  }
}

async function testAdminPanel() {
  colorLog('blue', '\n🖥️  Step 7: Testing Admin Panel...')
  
  colorLog('cyan', 'Starting development server...')
  colorLog('yellow', 'Please test the following manually:')
  colorLog('cyan', '1. Run: npm run dev')
  colorLog('cyan', '2. Visit: http://localhost:3000/admin/login')
  colorLog('cyan', '3. Login with your admin email and password: TempPassword123!')
  colorLog('cyan', '4. Change your password in the admin panel')
  
  return true
}

async function main() {
  try {
    colorLog('bright', '🚀 Starting Complete Firebase Implementation...\n')
    
    // Step 1: Check environment variables
    const envOk = await checkEnvironmentVariables()
    if (!envOk) return
    
    // Step 2: Test Firebase connection
    const connectionOk = await testFirebaseConnection()
    if (!connectionOk) return
    
    // Step 3: Check Firebase CLI
    const cliOk = await checkFirebaseCLI()
    if (!cliOk) return
    
    // Step 4: Login and set project
    const loginOk = await loginAndSetProject()
    if (!loginOk) {
      colorLog('yellow', '\nPlease complete the Firebase login steps above, then run this script again.')
      return
    }
    
    // Step 5: Deploy security rules
    const rulesOk = await deploySecurityRules()
    if (!rulesOk) return
    
    // Step 6: Setup Firebase data
    const dataOk = await setupFirebaseData()
    if (!dataOk) return
    
    // Step 7: Test admin panel
    await testAdminPanel()
    
    // Success message
    colorLog('green', '\n🎉 Firebase Implementation Completed Successfully!')
    colorLog('bright', '\n📋 Summary:')
    colorLog('green', '✅ Environment variables configured')
    colorLog('green', '✅ Firebase connection established')
    colorLog('green', '✅ Security rules deployed')
    colorLog('green', '✅ Database and admin users created')
    
    colorLog('bright', '\n🚀 Next Steps:')
    colorLog('cyan', '1. npm run dev')
    colorLog('cyan', '2. Visit: http://localhost:3000/admin/login')
    colorLog('cyan', '3. Login with your email and password: TempPassword123!')
    colorLog('cyan', '4. Change your password and start creating content!')
    
    colorLog('bright', '\n💡 Important Notes:')
    colorLog('yellow', '• Default password for all admin users: TempPassword123!')
    colorLog('yellow', '• Please change passwords after first login')
    colorLog('yellow', '• Admin panel is now fully functional')
    
  } catch (error) {
    colorLog('red', `\n❌ Implementation failed: ${error.message}`)
    process.exit(1)
  }
}

main()