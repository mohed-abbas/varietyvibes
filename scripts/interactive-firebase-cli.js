#!/usr/bin/env node

/**
 * Interactive Firebase Diagnostic CLI
 * User-friendly command-line interface for Firebase troubleshooting
 */

require('dotenv').config({ path: '.env' })
const readline = require('readline')
const { FirebaseHealthChecker } = require('./firebase-health-checker')
const { spawn } = require('child_process')
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
  cyan: '\x1b[36m'
}

function colorLog(color, message) {
  console.log(`${colors[color]}${message}${colors.reset}`)
}

class InteractiveFirebaseCLI {
  constructor() {
    this.rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    })
    
    this.commands = {
      '1': { name: 'Quick Health Check', method: 'quickHealthCheck' },
      '2': { name: 'Full Diagnostic Scan', method: 'fullDiagnosticScan' },
      '3': { name: 'Fix Credentials Wizard', method: 'credentialWizard' },
      '4': { name: 'Setup Users', method: 'setupUsers' },
      '5': { name: 'Test Connection', method: 'testConnection' },
      '6': { name: 'Performance Monitor', method: 'performanceMonitor' },
      '7': { name: 'View Health History', method: 'viewHealthHistory' },
      '8': { name: 'Auto-Fix Issues', method: 'autoFixIssues' },
      '9': { name: 'Generate Report', method: 'generateReport' },
      '0': { name: 'Exit', method: 'exit' }
    }
  }

  async start() {
    console.clear()
    this.showWelcome()
    await this.showMainMenu()
  }

  showWelcome() {
    colorLog('bright', '╔══════════════════════════════════════════════╗')
    colorLog('bright', '║       🔥 Firebase Interactive CLI v2.0       ║')
    colorLog('bright', '║           Variety Vibes Blog Setup           ║')
    colorLog('bright', '╚══════════════════════════════════════════════╝\n')
    
    colorLog('cyan', 'Welcome to the Firebase diagnostic and setup tool!')
    colorLog('white', 'This tool will help you troubleshoot and fix Firebase issues.\n')
  }

  async showMainMenu() {
    colorLog('bright', '📋 Main Menu - Choose an option:\n')
    
    Object.entries(this.commands).forEach(([key, cmd]) => {
      const icon = this.getCommandIcon(key)
      colorLog('white', `  ${key}. ${icon} ${cmd.name}`)
    })
    
    colorLog('cyan', '\nEnter your choice (0-9): ')
    
    return new Promise((resolve) => {
      this.rl.question('', async (answer) => {
        await this.handleCommand(answer.trim())
        resolve()
      })
    })
  }

  getCommandIcon(key) {
    const icons = {
      '1': '⚡', '2': '🔍', '3': '🔧', '4': '👥',
      '5': '🌐', '6': '📊', '7': '📈', '8': '🤖',
      '9': '📋', '0': '🚪'
    }
    return icons[key] || '•'
  }

  async handleCommand(choice) {
    const command = this.commands[choice]
    
    if (!command) {
      colorLog('red', '❌ Invalid choice. Please try again.\n')
      return await this.showMainMenu()
    }
    
    colorLog('blue', `\n🚀 Executing: ${command.name}\n`)
    
    try {
      await this[command.method]()
    } catch (error) {
      colorLog('red', `❌ Error executing command: ${error.message}\n`)
    }
    
    if (choice !== '0') {
      await this.waitForContinue()
      await this.showMainMenu()
    }
  }

  async quickHealthCheck() {
    colorLog('yellow', '⚡ Running Quick Health Check...\n')
    
    const checker = new FirebaseHealthChecker()
    
    // Override the run method to only do essential checks
    const essentialChecks = [
      'checkEnvironmentVariables',
      'checkCredentialFormat', 
      'checkFirebaseConnection'
    ]
    
    let passed = 0
    let failed = 0
    
    for (const checkMethod of essentialChecks) {
      try {
        console.log(`Checking ${checkMethod.replace('check', '')}...`)
        await checker[checkMethod]()
        passed++
        colorLog('green', '✅ Passed')
      } catch (error) {
        failed++
        colorLog('red', `❌ Failed: ${error.message}`)
      }
    }
    
    colorLog('bright', `\n📊 Quick Check Results: ${passed} passed, ${failed} failed`)
    
    if (failed > 0) {
      colorLog('yellow', 'Recommendation: Run Full Diagnostic Scan for detailed analysis')
    } else {
      colorLog('green', '🎉 Basic setup looks good!')
    }
  }

  async fullDiagnosticScan() {
    colorLog('yellow', '🔍 Running Full Diagnostic Scan...\n')
    
    const checker = new FirebaseHealthChecker()
    await checker.run()
    
    colorLog('green', '\n✅ Full scan completed! Check the output above for details.')
  }

  async credentialWizard() {
    colorLog('yellow', '🔧 Firebase Credentials Setup Wizard\n')
    
    colorLog('cyan', 'This wizard will help you fix Firebase credential issues.\n')
    
    // Check current status
    colorLog('blue', '1. Checking current credential status...')
    const issues = []
    
    if (!process.env.FIREBASE_CLIENT_EMAIL?.includes('.iam.gserviceaccount.com')) {
      issues.push('Invalid service account email')
    }
    
    if (!process.env.FIREBASE_PRIVATE_KEY?.includes('BEGIN PRIVATE KEY')) {
      issues.push('Invalid private key format')
    }
    
    if (process.env.ADMIN_EMAILS?.includes('example.com')) {
      issues.push('Using example admin emails')
    }
    
    if (issues.length === 0) {
      colorLog('green', '✅ Credentials appear to be valid!')
      return
    }
    
    colorLog('red', `❌ Found ${issues.length} credential issues:`)
    issues.forEach(issue => colorLog('yellow', `   • ${issue}`))
    
    colorLog('bright', '\n📋 To fix these issues:')
    colorLog('white', '1. Go to Firebase Console: https://console.firebase.google.com/project/variety-vibes/settings/serviceaccounts/adminsdk')
    colorLog('white', '2. Click "Generate new private key"')
    colorLog('white', '3. Download the JSON file')
    colorLog('white', '4. Update your .env file with the values from the JSON')
    
    const shouldOpenGuide = await this.askYesNo('\nWould you like me to show the .env template? (y/n): ')
    
    if (shouldOpenGuide) {
      this.showEnvTemplate()
    }
  }

  showEnvTemplate() {
    colorLog('bright', '\n📝 .env File Template:')
    console.log(`
# Firebase Client Config (from Firebase Console → Project Settings → General)
NEXT_PUBLIC_FIREBASE_API_KEY=your-api-key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=variety-vibes.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=variety-vibes
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=variety-vibes.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
NEXT_PUBLIC_FIREBASE_APP_ID=your-app-id

# Firebase Admin SDK (from downloaded service account JSON)
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xyz@variety-vibes.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\\nYOUR-VERY-LONG-PRIVATE-KEY\\n-----END PRIVATE KEY-----\\n"

# Admin Users (your email addresses)
ADMIN_EMAILS=your-email@gmail.com,another-admin@gmail.com
    `)
    
    colorLog('cyan', '💡 Replace the placeholder values with your actual Firebase configuration.')
  }

  async setupUsers() {
    colorLog('yellow', '👥 Setting up admin users...\n')
    
    const shouldRun = await this.askYesNo('This will create admin user documents in Firestore. Continue? (y/n): ')
    
    if (shouldRun) {
      try {
        await this.runCommand('node', ['scripts/setup-firebase.js'])
        colorLog('green', '✅ User setup completed!')
      } catch (error) {
        colorLog('red', `❌ User setup failed: ${error.message}`)
        colorLog('yellow', 'Try fixing credentials first with option 3')
      }
    }
  }

  async testConnection() {
    colorLog('yellow', '🌐 Testing Firebase connection...\n')
    
    try {
      await this.runCommand('node', ['scripts/test-firebase-config.js'])
      colorLog('green', '✅ Connection test completed!')
    } catch (error) {
      colorLog('red', `❌ Connection test failed: ${error.message}`)
    }
  }

  async performanceMonitor() {
    colorLog('yellow', '📊 Starting Performance Monitor...\n')
    
    const iterations = await this.askNumber('How many test iterations? (1-10): ', 1, 10)
    
    colorLog('blue', `Running ${iterations} performance tests...`)
    
    for (let i = 1; i <= iterations; i++) {
      try {
        const startTime = Date.now()
        
        // Simple connection test
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
        await db.collection('health-check').doc('test').get()
        
        const duration = Date.now() - startTime
        colorLog('green', `   Test ${i}: ${duration}ms`)
        
      } catch (error) {
        colorLog('red', `   Test ${i}: Failed - ${error.message}`)
      }
    }
    
    colorLog('blue', 'Performance monitoring completed.')
  }

  async viewHealthHistory() {
    colorLog('yellow', '📈 Viewing Health Check History...\n')
    
    const reportPath = path.join(process.cwd(), 'firebase-health-report.json')
    
    if (!fs.existsSync(reportPath)) {
      colorLog('yellow', '⚠️ No health report found. Run option 2 (Full Diagnostic Scan) first.')
      return
    }
    
    try {
      const report = JSON.parse(fs.readFileSync(reportPath, 'utf8'))
      
      colorLog('bright', '📋 Latest Health Report:')
      colorLog('white', `   Date: ${new Date(report.timestamp).toLocaleString()}`)
      colorLog('white', `   Health Score: ${Math.round(report.healthScore)}%`)
      colorLog('green', `   Successes: ${report.summary.successCount}`)
      colorLog('yellow', `   Warnings: ${report.summary.warningsCount}`)
      colorLog('red', `   Issues: ${report.summary.issuesCount}`)
      
      if (report.issues.length > 0) {
        colorLog('red', '\n❌ Current Issues:')
        report.issues.forEach((issue, i) => {
          colorLog('red', `   ${i + 1}. [${issue.severity}] ${issue.message}`)
        })
      }
      
    } catch (error) {
      colorLog('red', `❌ Error reading health report: ${error.message}`)
    }
  }

  async autoFixIssues() {
    colorLog('yellow', '🤖 Auto-Fix Issues...\n')
    
    const reportPath = path.join(process.cwd(), 'firebase-health-report.json')
    
    if (!fs.existsSync(reportPath)) {
      colorLog('yellow', '⚠️ No health report found. Run option 2 (Full Diagnostic Scan) first.')
      return
    }
    
    try {
      const report = JSON.parse(fs.readFileSync(reportPath, 'utf8'))
      
      if (report.autoFixes.length === 0) {
        colorLog('green', '✅ No auto-fixes needed!')
        return
      }
      
      colorLog('bright', `Found ${report.autoFixes.length} auto-fix suggestions:`)
      report.autoFixes.forEach((fix, i) => {
        colorLog('cyan', `   ${i + 1}. ${fix}`)
      })
      
      const shouldApply = await this.askYesNo('\nWould you like to run these fixes? (y/n): ')
      
      if (shouldApply) {
        for (const fix of report.autoFixes) {
          if (fix.startsWith('npm run')) {
            const command = fix.replace('npm run ', '')
            colorLog('blue', `Running: ${fix}`)
            try {
              await this.runCommand('npm', ['run', command])
              colorLog('green', `✅ ${fix} completed`)
            } catch (error) {
              colorLog('red', `❌ ${fix} failed: ${error.message}`)
            }
          }
        }
      }
      
    } catch (error) {
      colorLog('red', `❌ Error processing auto-fixes: ${error.message}`)
    }
  }

  async generateReport() {
    colorLog('yellow', '📋 Generating comprehensive report...\n')
    
    try {
      await this.runCommand('node', ['scripts/firebase-health-checker.js'])
      colorLog('green', '✅ Report generated successfully!')
      colorLog('cyan', 'Check firebase-health-report.json for details')
    } catch (error) {
      colorLog('red', `❌ Report generation failed: ${error.message}`)
    }
  }

  async askYesNo(question) {
    return new Promise((resolve) => {
      this.rl.question(question, (answer) => {
        resolve(answer.toLowerCase().startsWith('y'))
      })
    })
  }

  async askNumber(question, min = 1, max = 100) {
    return new Promise((resolve) => {
      this.rl.question(question, (answer) => {
        const num = parseInt(answer)
        if (isNaN(num) || num < min || num > max) {
          resolve(min) // Default to minimum
        } else {
          resolve(num)
        }
      })
    })
  }

  async runCommand(command, args = []) {
    return new Promise((resolve, reject) => {
      const child = spawn(command, args, { 
        stdio: 'inherit',
        shell: true 
      })
      
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

  async waitForContinue() {
    colorLog('cyan', '\nPress Enter to continue...')
    return new Promise((resolve) => {
      this.rl.question('', resolve)
    })
  }

  exit() {
    colorLog('green', '\n👋 Thanks for using Firebase Interactive CLI!')
    colorLog('cyan', 'Run "npm run firebase:cli" anytime to use this tool again.\n')
    this.rl.close()
    process.exit(0)
  }
}

// Run if called directly
if (require.main === module) {
  const cli = new InteractiveFirebaseCLI()
  cli.start().catch(error => {
    colorLog('red', `CLI error: ${error.message}`)
    process.exit(1)
  })
}

module.exports = { InteractiveFirebaseCLI }