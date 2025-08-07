#!/usr/bin/env node

/**
 * Enhanced Firebase Health Checker
 * Comprehensive diagnostics with real-time monitoring and automated fix suggestions
 */

require('dotenv').config({ path: '.env' })
const fs = require('fs')
const path = require('path')

// Color utilities
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  white: '\x1b[37m'
}

function colorLog(color, message) {
  console.log(`${colors[color]}${message}${colors.reset}`)
}

function createProgressBar(current, total, label = '') {
  const width = 30
  const progress = Math.round((current / total) * width)
  const bar = '█'.repeat(progress) + '░'.repeat(width - progress)
  const percentage = Math.round((current / total) * 100)
  return `${label} [${bar}] ${percentage}%`
}

class FirebaseHealthChecker {
  constructor() {
    this.issues = []
    this.warnings = []
    this.successes = []
    this.autoFixes = []
    this.checks = [
      { name: 'Environment Variables', method: 'checkEnvironmentVariables' },
      { name: 'Credential Format', method: 'checkCredentialFormat' },
      { name: 'Firebase Connection', method: 'checkFirebaseConnection' },
      { name: 'Firestore Structure', method: 'checkFirestoreStructure' },
      { name: 'Security Rules', method: 'checkSecurityRules' },
      { name: 'User Documents', method: 'checkUserDocuments' },
      { name: 'Admin Permissions', method: 'checkAdminPermissions' },
      { name: 'Performance Metrics', method: 'checkPerformanceMetrics' }
    ]
  }

  async run() {
    colorLog('bright', '🏥 Firebase Health Checker v2.0\n')
    colorLog('cyan', 'Running comprehensive diagnostics...\n')

    let currentCheck = 0
    for (const check of this.checks) {
      currentCheck++
      console.log(createProgressBar(currentCheck - 1, this.checks.length, 'Progress'))
      colorLog('blue', `\n${currentCheck}. Checking ${check.name}...`)
      
      try {
        await this[check.method]()
      } catch (error) {
        this.addIssue(`${check.name} check failed: ${error.message}`, 'HIGH', 'Contact support')
      }
    }

    console.log(createProgressBar(this.checks.length, this.checks.length, 'Progress'))
    
    await this.generateReport()
    await this.suggestAutoFixes()
    await this.createHealthReport()
  }

  async checkEnvironmentVariables() {
    const requiredVars = [
      'NEXT_PUBLIC_FIREBASE_API_KEY',
      'NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN', 
      'NEXT_PUBLIC_FIREBASE_PROJECT_ID',
      'FIREBASE_CLIENT_EMAIL',
      'FIREBASE_PRIVATE_KEY',
      'ADMIN_EMAILS'
    ]

    const missing = []
    const present = []

    for (const varName of requiredVars) {
      if (process.env[varName]) {
        present.push(varName)
      } else {
        missing.push(varName)
      }
    }

    if (missing.length > 0) {
      this.addIssue(`Missing environment variables: ${missing.join(', ')}`, 'HIGH', 'Add missing variables to .env file')
    } else {
      this.addSuccess('All required environment variables are present')
    }

    colorLog('green', `   ✅ Found ${present.length}/${requiredVars.length} required variables`)
  }

  async checkCredentialFormat() {
    const checks = [
      {
        name: 'Service Account Email',
        value: process.env.FIREBASE_CLIENT_EMAIL,
        validator: (val) => val && val.includes('.iam.gserviceaccount.com'),
        fix: 'Get service account from Firebase Console → Project Settings → Service accounts'
      },
      {
        name: 'Private Key Format',
        value: process.env.FIREBASE_PRIVATE_KEY,
        validator: (val) => val && val.includes('BEGIN PRIVATE KEY') && val.length > 1000,
        fix: 'Download proper private key from Firebase service account JSON'
      },
      {
        name: 'Admin Emails',
        value: process.env.ADMIN_EMAILS,
        validator: (val) => val && !val.includes('example.com'),
        fix: 'Replace example.com with your real email address'
      },
      {
        name: 'Project ID',
        value: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
        validator: (val) => val === 'variety-vibes',
        fix: 'Should be "variety-vibes" to match your Firebase project'
      }
    ]

    for (const check of checks) {
      if (check.validator(check.value)) {
        this.addSuccess(`${check.name} format is valid`)
        colorLog('green', `   ✅ ${check.name}`)
      } else {
        this.addIssue(`Invalid ${check.name}`, 'HIGH', check.fix)
        colorLog('red', `   ❌ ${check.name}`)
      }
    }
  }

  async checkFirebaseConnection() {
    try {
      const admin = require('firebase-admin')
      
      // Clean up existing apps
      admin.apps.forEach(app => app.delete())
      
      const app = admin.initializeApp({
        credential: admin.credential.cert({
          type: "service_account",
          project_id: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
          private_key_id: "dummy",
          private_key: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
          client_email: process.env.FIREBASE_CLIENT_EMAIL,
          client_id: "dummy",
          auth_uri: "https://accounts.google.com/o/oauth2/auth",
          token_uri: "https://oauth2.googleapis.com/token"
        })
      })

      // Test Firestore connection
      const db = admin.firestore()
      await db.collection('health-check').doc('test').get()
      
      this.addSuccess('Firebase Admin SDK connected successfully')
      colorLog('green', '   ✅ Connection established')
      
      return { connected: true, db, admin }
    } catch (error) {
      this.addIssue(`Firebase connection failed: ${error.message}`, 'CRITICAL', 'Check credentials and Firebase project status')
      colorLog('red', `   ❌ Connection failed: ${error.message}`)
      
      return { connected: false }
    }
  }

  async checkFirestoreStructure() {
    const connectionResult = await this.checkFirebaseConnection()
    if (!connectionResult.connected) return

    try {
      const db = connectionResult.db
      
      // Check collections
      const collections = ['users', 'posts', 'categories', 'media']
      const existingCollections = []
      
      for (const collectionName of collections) {
        try {
          const snapshot = await db.collection(collectionName).limit(1).get()
          if (snapshot.exists !== false) {
            existingCollections.push(collectionName)
          }
        } catch (error) {
          // Collection might not exist, which is fine
        }
      }

      if (existingCollections.length > 0) {
        this.addSuccess(`Found collections: ${existingCollections.join(', ')}`)
        colorLog('green', `   ✅ Found ${existingCollections.length} collections`)
      } else {
        this.addWarning('No collections found - may need setup')
        this.addAutoFix('Run: npm run firebase:setup to create initial collections')
      }

    } catch (error) {
      this.addIssue(`Firestore structure check failed: ${error.message}`, 'MEDIUM', 'Check Firestore database in Firebase Console')
    }
  }

  async checkSecurityRules() {
    try {
      // Check if rules files exist
      const rulesFiles = ['firestore.rules', 'storage.rules']
      const existingRules = []

      for (const ruleFile of rulesFiles) {
        if (fs.existsSync(path.join(process.cwd(), ruleFile))) {
          existingRules.push(ruleFile)
        }
      }

      if (existingRules.length === rulesFiles.length) {
        this.addSuccess('Security rules files found')
        colorLog('green', '   ✅ Rules files present')
        this.addAutoFix('Deploy rules: npm run firebase:deploy-rules')
      } else {
        this.addWarning(`Missing rules files: ${rulesFiles.filter(f => !existingRules.includes(f)).join(', ')}`)
      }

    } catch (error) {
      this.addIssue(`Security rules check failed: ${error.message}`, 'MEDIUM', 'Create firestore.rules and storage.rules files')
    }
  }

  async checkUserDocuments() {
    const connectionResult = await this.checkFirebaseConnection()
    if (!connectionResult.connected) return

    try {
      const db = connectionResult.db
      const usersRef = db.collection('users')
      
      // Check if users collection exists and has documents
      const usersSnapshot = await usersRef.limit(5).get()
      
      if (usersSnapshot.empty) {
        this.addIssue('Users collection is empty', 'HIGH', 'Run: npm run firebase:setup to create admin users')
        colorLog('yellow', '   ⚠️  No user documents found')
        this.addAutoFix('Create admin users: npm run firebase:setup')
        return
      }

      // Check for admin users
      const adminEmails = process.env.ADMIN_EMAILS?.split(',').map(e => e.trim()) || []
      const foundAdmins = []
      
      for (const email of adminEmails) {
        const userQuery = await usersRef.where('email', '==', email).limit(1).get()
        if (!userQuery.empty) {
          const userData = userQuery.docs[0].data()
          foundAdmins.push({ email, role: userData.role })
        }
      }

      if (foundAdmins.length > 0) {
        this.addSuccess(`Found admin users: ${foundAdmins.map(u => `${u.email} (${u.role})`).join(', ')}`)
        colorLog('green', `   ✅ Found ${foundAdmins.length} admin user(s)`)
      } else {
        this.addIssue('No admin users found', 'HIGH', 'Run setup script to create admin users')
        this.addAutoFix('Create admin users: npm run firebase:setup')
      }

    } catch (error) {
      this.addIssue(`User documents check failed: ${error.message}`, 'MEDIUM', 'Check Firestore users collection')
    }
  }

  async checkAdminPermissions() {
    // This would integrate with your actual permission system
    // For now, we'll check basic structure
    const connectionResult = await this.checkFirebaseConnection()
    if (!connectionResult.connected) return

    try {
      const db = connectionResult.db
      const adminEmails = process.env.ADMIN_EMAILS?.split(',').map(e => e.trim()) || []
      
      for (const email of adminEmails) {
        const userQuery = await db.collection('users').where('email', '==', email).limit(1).get()
        if (!userQuery.empty) {
          const userData = userQuery.docs[0].data()
          const hasPermissions = userData.permissions && Array.isArray(userData.permissions)
          
          if (hasPermissions && userData.permissions.length > 0) {
            this.addSuccess(`${email} has ${userData.permissions.length} permissions`)
          } else {
            this.addWarning(`${email} has no permissions configured`)
            this.addAutoFix(`Update permissions for ${email}`)
          }
        }
      }
    } catch (error) {
      this.addWarning(`Permission check failed: ${error.message}`)
    }
  }

  async checkPerformanceMetrics() {
    const startTime = Date.now()
    
    try {
      const connectionResult = await this.checkFirebaseConnection()
      if (!connectionResult.connected) return

      const db = connectionResult.db
      
      // Test read performance
      const readStart = Date.now()
      await db.collection('users').limit(1).get()
      const readTime = Date.now() - readStart
      
      // Test write performance (to a test collection)
      const writeStart = Date.now()
      await db.collection('health-check').doc('perf-test').set({ 
        timestamp: Date.now(),
        test: true 
      })
      const writeTime = Date.now() - writeStart
      
      // Clean up test document
      await db.collection('health-check').doc('perf-test').delete()
      
      const metrics = {
        totalTime: Date.now() - startTime,
        readTime,
        writeTime
      }

      if (readTime < 200 && writeTime < 500) {
        this.addSuccess(`Performance: Read ${readTime}ms, Write ${writeTime}ms`)
        colorLog('green', `   ✅ Good performance (Read: ${readTime}ms, Write: ${writeTime}ms)`)
      } else {
        this.addWarning(`Slow performance: Read ${readTime}ms, Write ${writeTime}ms`)
      }

    } catch (error) {
      this.addWarning(`Performance check failed: ${error.message}`)
    }
  }

  addIssue(message, severity, fix) {
    this.issues.push({ message, severity, fix, type: 'issue' })
  }

  addWarning(message, fix = null) {
    this.warnings.push({ message, fix, type: 'warning' })
  }

  addSuccess(message) {
    this.successes.push({ message, type: 'success' })
  }

  addAutoFix(command) {
    this.autoFixes.push(command)
  }

  async generateReport() {
    colorLog('bright', '\n\n📊 Health Check Report\n')
    
    // Summary
    const total = this.issues.length + this.warnings.length + this.successes.length
    const healthScore = total > 0 ? Math.round((this.successes.length / total) * 100) : 0
    
    colorLog('cyan', `Health Score: ${healthScore}% (${this.successes.length}/${total} checks passed)`)
    
    // Issues
    if (this.issues.length > 0) {
      colorLog('red', `\n❌ Issues Found (${this.issues.length}):`)
      this.issues.forEach((issue, index) => {
        colorLog('red', `  ${index + 1}. [${issue.severity}] ${issue.message}`)
        colorLog('yellow', `     Fix: ${issue.fix}`)
      })
    }

    // Warnings  
    if (this.warnings.length > 0) {
      colorLog('yellow', `\n⚠️  Warnings (${this.warnings.length}):`)
      this.warnings.forEach((warning, index) => {
        colorLog('yellow', `  ${index + 1}. ${warning.message}`)
        if (warning.fix) {
          colorLog('cyan', `     Suggestion: ${warning.fix}`)
        }
      })
    }

    // Successes
    if (this.successes.length > 0) {
      colorLog('green', `\n✅ Successful Checks (${this.successes.length}):`)
      this.successes.forEach((success, index) => {
        colorLog('green', `  ${index + 1}. ${success.message}`)
      })
    }
  }

  async suggestAutoFixes() {
    if (this.autoFixes.length === 0) return

    colorLog('bright', '\n🔧 Automated Fix Suggestions:\n')
    
    this.autoFixes.forEach((fix, index) => {
      colorLog('cyan', `${index + 1}. ${fix}`)
    })

    colorLog('magenta', '\nRun these commands in order to resolve most issues automatically.')
  }

  async createHealthReport() {
    const report = {
      timestamp: new Date().toISOString(),
      healthScore: this.successes.length / (this.issues.length + this.warnings.length + this.successes.length) * 100,
      issues: this.issues,
      warnings: this.warnings, 
      successes: this.successes,
      autoFixes: this.autoFixes,
      summary: {
        totalChecks: this.checks.length,
        issuesCount: this.issues.length,
        warningsCount: this.warnings.length,
        successCount: this.successes.length
      }
    }

    // Write to file
    const reportPath = path.join(process.cwd(), 'firebase-health-report.json')
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2))
    
    colorLog('bright', `\n📋 Detailed report saved to: firebase-health-report.json`)
    colorLog('cyan', 'Use this report for tracking improvements over time.')
  }
}

// Run if called directly
if (require.main === module) {
  const checker = new FirebaseHealthChecker()
  checker.run().catch(error => {
    colorLog('red', `\nHealth check failed: ${error.message}`)
    process.exit(1)
  })
}

module.exports = { FirebaseHealthChecker }