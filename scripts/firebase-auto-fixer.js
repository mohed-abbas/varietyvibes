#!/usr/bin/env node

/**
 * Firebase Auto-Fixer
 * Automated problem resolution and fix suggestions
 */

require('dotenv').config({ path: '.env' })
const fs = require('fs')
const path = require('path')
const { spawn } = require('child_process')

// Color utilities
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

class FirebaseAutoFixer {
  constructor() {
    this.fixers = [
      { name: 'Environment Variables', method: 'fixEnvironmentVariables', priority: 1 },
      { name: 'Credential Format', method: 'fixCredentialFormat', priority: 2 },
      { name: 'Security Rules', method: 'fixSecurityRules', priority: 3 },
      { name: 'User Documents', method: 'fixUserDocuments', priority: 4 },
      { name: 'Performance Issues', method: 'fixPerformanceIssues', priority: 5 },
      { name: 'Firestore Structure', method: 'fixFirestoreStructure', priority: 6 }
    ]
    
    this.fixes = []
    this.warnings = []
    this.errors = []
    
    this.interactiveMode = process.argv.includes('--interactive')
    this.dryRun = process.argv.includes('--dry-run')
  }

  async run() {
    colorLog('bright', '🤖 Firebase Auto-Fixer v2.0\n')
    
    if (this.dryRun) {
      colorLog('yellow', '🔍 Running in DRY RUN mode - no changes will be made\n')
    }
    
    if (this.interactiveMode) {
      colorLog('cyan', '🎮 Interactive mode enabled - you will be asked before applying fixes\n')
    }
    
    // Run diagnostic first
    colorLog('blue', '1. Running diagnostic scan...')
    const issues = await this.runDiagnostic()
    
    if (issues.length === 0) {
      colorLog('green', '✅ No issues found! Your Firebase setup is healthy.')
      return
    }
    
    colorLog('yellow', `Found ${issues.length} issues to fix\n`)
    
    // Sort fixers by priority
    this.fixers.sort((a, b) => a.priority - b.priority)
    
    // Apply fixes
    for (const fixer of this.fixers) {
      colorLog('blue', `2.${fixer.priority} Checking ${fixer.name}...`)
      
      try {
        await this[fixer.method]()
      } catch (error) {
        this.addError(`${fixer.name} fix failed: ${error.message}`)
      }
    }
    
    // Generate summary
    await this.generateSummary()
  }

  async runDiagnostic() {
    const issues = []
    
    // Check environment variables
    const requiredVars = [
      'NEXT_PUBLIC_FIREBASE_API_KEY',
      'NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN',
      'NEXT_PUBLIC_FIREBASE_PROJECT_ID', 
      'FIREBASE_CLIENT_EMAIL',
      'FIREBASE_PRIVATE_KEY',
      'ADMIN_EMAILS'
    ]
    
    for (const varName of requiredVars) {
      if (!process.env[varName]) {
        issues.push({ type: 'missing_env_var', variable: varName })
      }
    }
    
    // Check credential format
    if (process.env.FIREBASE_CLIENT_EMAIL && !process.env.FIREBASE_CLIENT_EMAIL.includes('.iam.gserviceaccount.com')) {
      issues.push({ type: 'invalid_service_account', value: process.env.FIREBASE_CLIENT_EMAIL })
    }
    
    if (process.env.FIREBASE_PRIVATE_KEY && (!process.env.FIREBASE_PRIVATE_KEY.includes('BEGIN PRIVATE KEY') || process.env.FIREBASE_PRIVATE_KEY.length < 1000)) {
      issues.push({ type: 'invalid_private_key', length: process.env.FIREBASE_PRIVATE_KEY?.length })
    }
    
    if (process.env.ADMIN_EMAILS && process.env.ADMIN_EMAILS.includes('example.com')) {
      issues.push({ type: 'example_admin_emails', value: process.env.ADMIN_EMAILS })
    }
    
    return issues
  }

  async fixEnvironmentVariables() {
    const envPath = path.join(process.cwd(), '.env')
    
    if (!fs.existsSync(envPath)) {
      if (await this.shouldApplyFix('Create .env file')) {
        await this.createEnvFile()
        this.addFix('Created .env file with template')
      }
      return
    }
    
    // Check for missing variables
    const requiredVars = [
      { key: 'NEXT_PUBLIC_FIREBASE_API_KEY', description: 'Firebase Web API Key' },
      { key: 'NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN', description: 'Firebase Auth Domain', default: 'variety-vibes.firebaseapp.com' },
      { key: 'NEXT_PUBLIC_FIREBASE_PROJECT_ID', description: 'Firebase Project ID', default: 'variety-vibes' },
      { key: 'FIREBASE_CLIENT_EMAIL', description: 'Service Account Email' },
      { key: 'FIREBASE_PRIVATE_KEY', description: 'Service Account Private Key' },
      { key: 'ADMIN_EMAILS', description: 'Admin Email Addresses' }
    ]
    
    const missingVars = requiredVars.filter(v => !process.env[v.key])
    
    if (missingVars.length > 0) {
      if (await this.shouldApplyFix(`Add ${missingVars.length} missing environment variables`)) {
        await this.addMissingEnvVars(missingVars)
        this.addFix(`Added ${missingVars.length} missing environment variables`)
      }
    } else {
      colorLog('green', '   ✅ All environment variables present')
    }
  }

  async fixCredentialFormat() {
    const issues = []
    const fixes = []
    
    // Service account email
    const clientEmail = process.env.FIREBASE_CLIENT_EMAIL
    if (clientEmail && !clientEmail.includes('.iam.gserviceaccount.com')) {
      issues.push('Invalid service account email format')
      fixes.push('Update FIREBASE_CLIENT_EMAIL with proper service account from Firebase Console')
    }
    
    // Private key
    const privateKey = process.env.FIREBASE_PRIVATE_KEY
    if (privateKey && (!privateKey.includes('BEGIN PRIVATE KEY') || privateKey.length < 1000)) {
      issues.push('Invalid private key format')
      fixes.push('Update FIREBASE_PRIVATE_KEY with proper private key from service account JSON')
    }
    
    // Admin emails
    const adminEmails = process.env.ADMIN_EMAILS
    if (adminEmails && adminEmails.includes('example.com')) {
      issues.push('Using example admin emails')
      fixes.push('Replace example.com emails with real email addresses')
    }
    
    if (issues.length > 0) {
      colorLog('yellow', `   ⚠️ Found ${issues.length} credential format issues`)
      
      if (await this.shouldApplyFix('Generate credential fix guide')) {
        await this.generateCredentialGuide(issues, fixes)
        this.addFix('Generated credential fix guide')
      }
    } else {
      colorLog('green', '   ✅ Credential formats are valid')
    }
  }

  async fixSecurityRules() {
    const rulesFiles = [
      { name: 'firestore.rules', template: 'firestoreRulesTemplate' },
      { name: 'storage.rules', template: 'storageRulesTemplate' }
    ]
    
    let created = 0
    
    for (const ruleFile of rulesFiles) {
      const filePath = path.join(process.cwd(), ruleFile.name)
      
      if (!fs.existsSync(filePath)) {
        if (await this.shouldApplyFix(`Create ${ruleFile.name} file`)) {
          await this.createRulesFile(ruleFile.name, ruleFile.template)
          created++
        }
      }
    }
    
    if (created > 0) {
      this.addFix(`Created ${created} security rules file(s)`)
      colorLog('green', `   ✅ Created ${created} security rules files`)
      
      if (await this.shouldApplyFix('Deploy security rules')) {
        await this.deploySecurityRules()
        this.addFix('Deployed security rules to Firebase')
      }
    } else {
      colorLog('green', '   ✅ Security rules files exist')
    }
  }

  async fixUserDocuments() {
    try {
      // Test Firebase connection first
      const admin = require('firebase-admin')
      
      if (admin.apps.length === 0) {
        admin.initializeApp({
          credential: admin.credential.cert({
            type: "service_account",
            project_id: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
            private_key: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
            client_email: process.env.FIREBASE_CLIENT_EMAIL,
          })
        })
      }
      
      const db = admin.firestore()
      
      // Check for users collection
      const usersRef = db.collection('users')
      const usersSnapshot = await usersRef.limit(1).get()
      
      if (usersSnapshot.empty) {
        if (await this.shouldApplyFix('Create user documents in Firestore')) {
          await this.createUserDocuments()
          this.addFix('Created admin user documents')
        }
      } else {
        // Check for admin users
        const adminEmails = process.env.ADMIN_EMAILS?.split(',').map(e => e.trim()) || []
        const missingAdmins = []
        
        for (const email of adminEmails) {
          const userQuery = await usersRef.where('email', '==', email).limit(1).get()
          if (userQuery.empty) {
            missingAdmins.push(email)
          }
        }
        
        if (missingAdmins.length > 0) {
          if (await this.shouldApplyFix(`Create missing admin users: ${missingAdmins.join(', ')}`)) {
            await this.createMissingAdminUsers(missingAdmins)
            this.addFix(`Created ${missingAdmins.length} missing admin user(s)`)
          }
        } else {
          colorLog('green', '   ✅ All admin users exist')
        }
      }
      
    } catch (error) {
      this.addWarning(`Cannot fix user documents: ${error.message} (fix credentials first)`)
    }
  }

  async fixPerformanceIssues() {
    // Check for performance optimization opportunities
    const optimizations = []
    
    // Check if Firebase indexes are needed
    try {
      const indexesPath = path.join(process.cwd(), 'firestore.indexes.json')
      if (!fs.existsSync(indexesPath)) {
        optimizations.push({
          name: 'Create Firestore indexes',
          description: 'Create indexes for better query performance',
          action: 'createFirestoreIndexes'
        })
      }
    } catch (error) {
      // Ignore
    }
    
    // Check for Firebase SDK optimization
    const packagePath = path.join(process.cwd(), 'package.json')
    if (fs.existsSync(packagePath)) {
      const packageJson = JSON.parse(fs.readFileSync(packagePath, 'utf8'))
      
      // Check Firebase version
      const firebaseVersion = packageJson.dependencies?.firebase
      if (firebaseVersion && !firebaseVersion.includes('12.')) {
        optimizations.push({
          name: 'Update Firebase SDK',
          description: 'Update to latest Firebase SDK for better performance',
          action: 'updateFirebaseSDK'
        })
      }
    }
    
    if (optimizations.length > 0) {
      for (const optimization of optimizations) {
        if (await this.shouldApplyFix(optimization.name)) {
          await this[optimization.action]()
          this.addFix(optimization.description)
        }
      }
    } else {
      colorLog('green', '   ✅ No performance issues detected')
    }
  }

  async fixFirestoreStructure() {
    try {
      // Test Firebase connection
      const admin = require('firebase-admin')
      
      if (admin.apps.length === 0) {
        admin.initializeApp({
          credential: admin.credential.cert({
            type: "service_account", 
            project_id: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
            private_key: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
            client_email: process.env.FIREBASE_CLIENT_EMAIL,
          })
        })
      }
      
      const db = admin.firestore()
      
      // Check for required collections
      const requiredCollections = ['users', 'posts', 'categories', 'media']
      const missingCollections = []
      
      for (const collectionName of requiredCollections) {
        try {
          const snapshot = await db.collection(collectionName).limit(1).get()
          if (snapshot.empty && collectionName === 'users') {
            // Users collection is critical
            missingCollections.push(collectionName)
          }
        } catch (error) {
          missingCollections.push(collectionName)
        }
      }
      
      if (missingCollections.length > 0) {
        if (await this.shouldApplyFix(`Initialize ${missingCollections.join(', ')} collections`)) {
          await this.initializeCollections(missingCollections)
          this.addFix(`Initialized ${missingCollections.length} Firestore collections`)
        }
      } else {
        colorLog('green', '   ✅ Firestore structure is correct')
      }
      
    } catch (error) {
      this.addWarning(`Cannot fix Firestore structure: ${error.message} (fix credentials first)`)
    }
  }

  // Helper methods
  async shouldApplyFix(description) {
    if (this.dryRun) {
      colorLog('cyan', `   [DRY RUN] Would apply: ${description}`)
      return false
    }
    
    if (!this.interactiveMode) {
      return true
    }
    
    return await this.askConfirmation(`   Apply fix: ${description}? (y/n): `)
  }

  async askConfirmation(question) {
    const readline = require('readline').createInterface({
      input: process.stdin,
      output: process.stdout
    })
    
    return new Promise((resolve) => {
      readline.question(question, (answer) => {
        readline.close()
        resolve(answer.toLowerCase().startsWith('y'))
      })
    })
  }

  async createEnvFile() {
    const envTemplate = `# Firebase Web Config (from Firebase Console → Project Settings → General)
NEXT_PUBLIC_FIREBASE_API_KEY=your-api-key-here
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=variety-vibes.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=variety-vibes
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=variety-vibes.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
NEXT_PUBLIC_FIREBASE_APP_ID=your-app-id

# Firebase Admin SDK (from downloaded service account JSON)
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xyz@variety-vibes.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\\nYOUR-PRIVATE-KEY-HERE\\n-----END PRIVATE KEY-----\\n"

# Admin Users (your email addresses)
ADMIN_EMAILS=your-email@gmail.com
`
    
    fs.writeFileSync('.env', envTemplate)
  }

  async addMissingEnvVars(missingVars) {
    let envContent = fs.readFileSync('.env', 'utf8')
    
    for (const variable of missingVars) {
      const defaultValue = variable.default || 'your-value-here'
      const line = `${variable.key}=${defaultValue}\n`
      
      if (!envContent.includes(variable.key)) {
        envContent += `\n# ${variable.description}\n${line}`
      }
    }
    
    fs.writeFileSync('.env', envContent)
  }

  async generateCredentialGuide(issues, fixes) {
    const guide = `# 🔧 Credential Fix Guide - Auto-Generated

## Issues Found:
${issues.map(issue => `- ❌ ${issue}`).join('\n')}

## Required Fixes:
${fixes.map((fix, i) => `${i + 1}. ${fix}`).join('\n')}

## Step-by-Step Instructions:

### 1. Get Service Account from Firebase Console
1. Go to: https://console.firebase.google.com/project/variety-vibes/settings/serviceaccounts/adminsdk
2. Click "Generate new private key"
3. Download the JSON file

### 2. Update .env File
Update these values in your .env file with values from the downloaded JSON:

\`\`\`env
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xyz@variety-vibes.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\\n[VERY-LONG-KEY]\\n-----END PRIVATE KEY-----\\n"
ADMIN_EMAILS=your-real-email@gmail.com
\`\`\`

### 3. Test the Fix
Run: npm run firebase:test

This guide was auto-generated on ${new Date().toISOString()}
`
    
    fs.writeFileSync('AUTO_CREDENTIAL_FIX.md', guide)
  }

  async createUserDocuments() {
    await this.runCommand('node', ['scripts/setup-firebase.js'])
  }

  async createMissingAdminUsers(emails) {
    // This would integrate with your user creation script
    await this.runCommand('node', ['scripts/setup-firebase.js', ...emails])
  }

  async deploySecurityRules() {
    if (fs.existsSync('scripts/deploy-firebase-rules.js')) {
      await this.runCommand('node', ['scripts/deploy-firebase-rules.js'])
    }
  }

  async createRulesFile(filename, templateMethod) {
    const template = this[templateMethod]()
    fs.writeFileSync(filename, template)
  }

  async runCommand(command, args = []) {
    return new Promise((resolve, reject) => {
      const child = spawn(command, args, { stdio: 'pipe' })
      
      child.on('close', (code) => {
        if (code === 0) {
          resolve()
        } else {
          reject(new Error(`Command failed with code ${code}`))
        }
      })
      
      child.on('error', reject)
    })
  }

  firestoreRulesTemplate() {
    return `rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users collection - only admins can read/write
    match /users/{userId} {
      allow read, write: if request.auth != null && 
        exists(/databases/$(database)/documents/users/$(request.auth.uid)) &&
        get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin';
    }
    
    // Posts collection - public read, admin write
    match /posts/{postId} {
      allow read: if true;
      allow write: if request.auth != null && 
        exists(/databases/$(database)/documents/users/$(request.auth.uid)) &&
        get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin';
    }
    
    // Categories collection - public read, admin write
    match /categories/{categoryId} {
      allow read: if true;
      allow write: if request.auth != null && 
        exists(/databases/$(database)/documents/users/$(request.auth.uid)) &&
        get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin';
    }
    
    // Media collection - admin only
    match /media/{mediaId} {
      allow read, write: if request.auth != null && 
        exists(/databases/$(database)/documents/users/$(request.auth.uid)) &&
        get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin';
    }
  }
}`
  }

  storageRulesTemplate() {
    return `rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    // Admin only access to all files
    match /{allPaths=**} {
      allow read, write: if request.auth != null && 
        firestore.exists(/databases/(default)/documents/users/$(request.auth.uid)) &&
        firestore.get(/databases/(default)/documents/users/$(request.auth.uid)).data.role == 'admin';
    }
  }
}`
  }

  addFix(message) {
    this.fixes.push(message)
    colorLog('green', `   ✅ ${message}`)
  }

  addWarning(message) {
    this.warnings.push(message)
    colorLog('yellow', `   ⚠️ ${message}`)
  }

  addError(message) {
    this.errors.push(message)
    colorLog('red', `   ❌ ${message}`)
  }

  async generateSummary() {
    colorLog('bright', '\n🎯 Auto-Fix Summary:\n')
    
    if (this.fixes.length > 0) {
      colorLog('green', `✅ Applied Fixes (${this.fixes.length}):`)
      this.fixes.forEach((fix, i) => colorLog('green', `   ${i + 1}. ${fix}`))
    }
    
    if (this.warnings.length > 0) {
      colorLog('yellow', `\n⚠️ Warnings (${this.warnings.length}):`)
      this.warnings.forEach((warning, i) => colorLog('yellow', `   ${i + 1}. ${warning}`))
    }
    
    if (this.errors.length > 0) {
      colorLog('red', `\n❌ Errors (${this.errors.length}):`)
      this.errors.forEach((error, i) => colorLog('red', `   ${i + 1}. ${error}`))
    }
    
    colorLog('bright', '\n🎯 Recommendations:')
    
    if (this.fixes.length > 0) {
      colorLog('cyan', '1. Run: npm run firebase:test - to verify fixes')
      colorLog('cyan', '2. Run: npm run dev - to test your application')
    }
    
    if (this.warnings.length > 0) {
      colorLog('cyan', '3. Review warnings and apply manual fixes if needed')
    }
    
    if (this.errors.length > 0) {
      colorLog('cyan', '4. Resolve errors manually or contact support')
    }
    
    // Save summary to file
    const summary = {
      timestamp: new Date().toISOString(),
      fixes: this.fixes,
      warnings: this.warnings,
      errors: this.errors
    }
    
    fs.writeFileSync('firebase-autofix-summary.json', JSON.stringify(summary, null, 2))
    colorLog('cyan', '\n📋 Detailed summary saved to: firebase-autofix-summary.json')
  }
}

// Run if called directly
if (require.main === module) {
  const autoFixer = new FirebaseAutoFixer()
  autoFixer.run().catch(error => {
    colorLog('red', `Auto-fixer failed: ${error.message}`)
    process.exit(1)
  })
}

module.exports = { FirebaseAutoFixer }