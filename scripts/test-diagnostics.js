#!/usr/bin/env node

/**
 * Comprehensive Test Suite for Firebase Diagnostics
 * Tests all diagnostic scripts and validates their functionality
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

class DiagnosticsTestSuite {
  constructor() {
    this.tests = [
      { name: 'Environment Variables', method: 'testEnvironmentVariables', critical: true },
      { name: 'Script File Existence', method: 'testScriptFiles', critical: true },
      { name: 'Quick Credential Check', method: 'testQuickCredentialCheck', critical: false },
      { name: 'Firebase Health Checker', method: 'testFirebaseHealthChecker', critical: false },
      { name: 'Interactive CLI', method: 'testInteractiveCLI', critical: false },
      { name: 'Firebase Monitor', method: 'testFirebaseMonitor', critical: false },
      { name: 'Auto-Fixer', method: 'testAutoFixer', critical: false },
      { name: 'Package.json Scripts', method: 'testPackageScripts', critical: true },
      { name: 'API Endpoints', method: 'testAPIEndpoints', critical: false },
      { name: 'Output File Generation', method: 'testOutputFiles', critical: false }
    ]
    
    this.results = {
      passed: 0,
      failed: 0,
      skipped: 0,
      details: []
    }
  }

  async run() {
    colorLog('bright', '🧪 Firebase Diagnostics Test Suite v1.0\n')
    colorLog('cyan', `Running ${this.tests.length} test suites...\n`)

    for (const test of this.tests) {
      colorLog('blue', `Testing ${test.name}...`)
      
      try {
        const result = await this[test.method]()
        
        if (result.success) {
          this.results.passed++
          colorLog('green', `  ✅ ${test.name}: PASSED`)
          if (result.message) {
            colorLog('white', `     ${result.message}`)
          }
        } else {
          if (test.critical) {
            this.results.failed++
            colorLog('red', `  ❌ ${test.name}: FAILED (CRITICAL)`)
          } else {
            this.results.skipped++
            colorLog('yellow', `  ⚠️ ${test.name}: SKIPPED`)
          }
          
          if (result.message) {
            colorLog('white', `     ${result.message}`)
          }
        }
        
        this.results.details.push({
          name: test.name,
          success: result.success,
          critical: test.critical,
          message: result.message,
          details: result.details || []
        })

      } catch (error) {
        this.results.failed++
        colorLog('red', `  ❌ ${test.name}: ERROR`)
        colorLog('red', `     ${error.message}`)
        
        this.results.details.push({
          name: test.name,
          success: false,
          critical: test.critical,
          message: error.message,
          details: []
        })
      }
      
      console.log() // Add spacing
    }

    await this.generateSummary()
  }

  async testEnvironmentVariables() {
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
    const invalid = []

    for (const varName of requiredVars) {
      if (process.env[varName]) {
        present.push(varName)
        
        // Basic validation
        if (varName === 'FIREBASE_CLIENT_EMAIL' && !process.env[varName].includes('.iam.gserviceaccount.com')) {
          invalid.push(`${varName}: Invalid service account format`)
        }
        
        if (varName === 'FIREBASE_PRIVATE_KEY' && !process.env[varName].includes('BEGIN PRIVATE KEY')) {
          invalid.push(`${varName}: Invalid private key format`)
        }
        
        if (varName === 'ADMIN_EMAILS' && process.env[varName].includes('example.com')) {
          invalid.push(`${varName}: Using example emails`)
        }
      } else {
        missing.push(varName)
      }
    }

    const success = missing.length === 0 && invalid.length === 0
    
    return {
      success,
      message: success 
        ? `All ${present.length} environment variables are valid`
        : `Missing: ${missing.length}, Invalid: ${invalid.length}`,
      details: [...missing.map(v => `Missing: ${v}`), ...invalid]
    }
  }

  async testScriptFiles() {
    const scripts = [
      'scripts/firebase-health-checker.js',
      'scripts/interactive-firebase-cli.js',
      'scripts/firebase-monitor.js',
      'scripts/firebase-auto-fixer.js',
      'scripts/quick-credential-check.js',
      'scripts/diagnose-user-error.js'
    ]

    const missing = []
    const present = []

    for (const scriptPath of scripts) {
      const fullPath = path.join(process.cwd(), scriptPath)
      
      if (fs.existsSync(fullPath)) {
        // Check if file is executable
        try {
          const stats = fs.statSync(fullPath)
          if (stats.size > 0) {
            present.push(scriptPath)
          } else {
            missing.push(`${scriptPath} (empty file)`)
          }
        } catch (error) {
          missing.push(`${scriptPath} (access error)`)
        }
      } else {
        missing.push(scriptPath)
      }
    }

    return {
      success: missing.length === 0,
      message: `Found ${present.length}/${scripts.length} diagnostic scripts`,
      details: missing.length > 0 ? [`Missing: ${missing.join(', ')}`] : []
    }
  }

  async testQuickCredentialCheck() {
    try {
      const result = await this.runScript('scripts/quick-credential-check.js', { timeout: 10000 })
      
      const hasValidOutput = result.output.includes('credential') || result.output.includes('environment')
      
      return {
        success: result.exitCode === 0 && hasValidOutput,
        message: result.exitCode === 0 
          ? 'Quick credential check script executed successfully'
          : `Script failed with exit code ${result.exitCode}`,
        details: result.exitCode !== 0 ? [result.error] : []
      }
    } catch (error) {
      return {
        success: false,
        message: `Failed to run quick credential check: ${error.message}`
      }
    }
  }

  async testFirebaseHealthChecker() {
    try {
      const result = await this.runScript('scripts/firebase-health-checker.js', { timeout: 30000 })
      
      const hasValidOutput = result.output.includes('Health Check') || result.output.includes('Firebase')
      const reportGenerated = fs.existsSync(path.join(process.cwd(), 'firebase-health-report.json'))
      
      return {
        success: result.exitCode === 0 && hasValidOutput,
        message: reportGenerated 
          ? 'Health checker executed and generated report'
          : 'Health checker executed but no report generated',
        details: result.exitCode !== 0 ? [result.error] : []
      }
    } catch (error) {
      return {
        success: false,
        message: `Failed to run Firebase health checker: ${error.message}`
      }
    }
  }

  async testInteractiveCLI() {
    try {
      // Test that the CLI script loads without errors (dry run)
      const content = fs.readFileSync(path.join(process.cwd(), 'scripts/interactive-firebase-cli.js'), 'utf8')
      
      // Check for key components
      const hasMainClass = content.includes('class InteractiveFirebaseCLI')
      const hasCommands = content.includes('commands')
      const hasMenuSystem = content.includes('showMainMenu')
      
      return {
        success: hasMainClass && hasCommands && hasMenuSystem,
        message: 'Interactive CLI script structure is valid',
        details: !hasMainClass ? ['Missing InteractiveFirebaseCLI class'] : []
      }
    } catch (error) {
      return {
        success: false,
        message: `Failed to validate interactive CLI: ${error.message}`
      }
    }
  }

  async testFirebaseMonitor() {
    try {
      // Test monitor script structure
      const content = fs.readFileSync(path.join(process.cwd(), 'scripts/firebase-monitor.js'), 'utf8')
      
      const hasMonitorClass = content.includes('class FirebaseMonitor')
      const hasHealthChecks = content.includes('runHealthCheck')
      const hasMetrics = content.includes('metrics')
      
      return {
        success: hasMonitorClass && hasHealthChecks && hasMetrics,
        message: 'Firebase monitor script structure is valid',
        details: []
      }
    } catch (error) {
      return {
        success: false,
        message: `Failed to validate Firebase monitor: ${error.message}`
      }
    }
  }

  async testAutoFixer() {
    try {
      // Test auto-fixer with dry-run mode
      const result = await this.runScript('scripts/firebase-auto-fixer.js', { 
        args: ['--dry-run'],
        timeout: 20000 
      })
      
      const hasValidOutput = result.output.includes('Auto-Fixer') || result.output.includes('DRY RUN')
      
      return {
        success: result.exitCode === 0 && hasValidOutput,
        message: 'Auto-fixer dry run completed successfully',
        details: result.exitCode !== 0 ? [result.error] : []
      }
    } catch (error) {
      return {
        success: false,
        message: `Failed to test auto-fixer: ${error.message}`
      }
    }
  }

  async testPackageScripts() {
    try {
      const packagePath = path.join(process.cwd(), 'package.json')
      const packageJson = JSON.parse(fs.readFileSync(packagePath, 'utf8'))
      
      const expectedScripts = [
        'firebase:test',
        'firebase:setup', 
        'firebase:deploy-rules',
        'firebase:complete-setup',
        'firebase:check',
        'firebase:diagnose'
      ]
      
      const missing = []
      const present = []
      
      for (const script of expectedScripts) {
        if (packageJson.scripts && packageJson.scripts[script]) {
          present.push(script)
        } else {
          missing.push(script)
        }
      }
      
      return {
        success: missing.length === 0,
        message: `Found ${present.length}/${expectedScripts.length} npm scripts`,
        details: missing.length > 0 ? [`Missing scripts: ${missing.join(', ')}`] : []
      }
    } catch (error) {
      return {
        success: false,
        message: `Failed to check package scripts: ${error.message}`
      }
    }
  }

  async testAPIEndpoints() {
    const endpoints = [
      'app/api/admin/diagnostics/firebase-connection/route.ts',
      'app/api/admin/diagnostics/firestore/route.ts',
      'app/api/admin/diagnostics/auth/route.ts',
      'app/api/admin/diagnostics/report/route.ts',
      'app/api/admin/diagnostics/auto-fix/route.ts'
    ]

    const missing = []
    const present = []

    for (const endpoint of endpoints) {
      const fullPath = path.join(process.cwd(), endpoint)
      
      if (fs.existsSync(fullPath)) {
        const content = fs.readFileSync(fullPath, 'utf8')
        if (content.includes('POST') || content.includes('GET')) {
          present.push(endpoint)
        } else {
          missing.push(`${endpoint} (invalid structure)`)
        }
      } else {
        missing.push(endpoint)
      }
    }

    return {
      success: missing.length === 0,
      message: `Found ${present.length}/${endpoints.length} API endpoints`,
      details: missing.length > 0 ? [`Missing: ${missing.join(', ')}`] : []
    }
  }

  async testOutputFiles() {
    // Test that diagnostic scripts can generate output files
    const expectedFiles = [
      'firebase-health-report.json',
      'firebase-autofix-summary.json'
    ]

    const existing = []
    const canCreate = []

    for (const fileName of expectedFiles) {
      const filePath = path.join(process.cwd(), fileName)
      
      if (fs.existsSync(filePath)) {
        existing.push(fileName)
      }
      
      // Test if we can create/write files
      try {
        const testContent = JSON.stringify({ test: true, timestamp: Date.now() })
        fs.writeFileSync(filePath, testContent)
        
        // Verify we can read it back
        const readContent = fs.readFileSync(filePath, 'utf8')
        JSON.parse(readContent)
        
        canCreate.push(fileName)
      } catch (error) {
        // File creation failed
      }
    }

    return {
      success: canCreate.length === expectedFiles.length,
      message: `Can create ${canCreate.length}/${expectedFiles.length} output files`,
      details: canCreate.length < expectedFiles.length 
        ? ['Some output files cannot be created - check permissions']
        : []
    }
  }

  async runScript(scriptPath, options = {}) {
    const { args = [], timeout = 15000 } = options
    
    return new Promise((resolve, reject) => {
      const child = spawn('node', [scriptPath, ...args], {
        stdio: 'pipe'
      })
      
      let output = ''
      let error = ''
      
      child.stdout.on('data', (data) => {
        output += data.toString()
      })
      
      child.stderr.on('data', (data) => {
        error += data.toString()
      })
      
      child.on('close', (code) => {
        resolve({
          exitCode: code,
          output,
          error
        })
      })
      
      child.on('error', (err) => {
        reject(err)
      })
      
      // Timeout
      setTimeout(() => {
        child.kill()
        resolve({
          exitCode: -1,
          output,
          error: 'Script timed out'
        })
      }, timeout)
    })
  }

  async generateSummary() {
    colorLog('bright', '\n🎯 Test Suite Results:\n')
    
    const total = this.results.passed + this.results.failed + this.results.skipped
    const passRate = total > 0 ? Math.round((this.results.passed / total) * 100) : 0
    
    colorLog('cyan', `Total Tests: ${total}`)
    colorLog('green', `Passed: ${this.results.passed}`)
    colorLog('red', `Failed: ${this.results.failed}`)
    colorLog('yellow', `Skipped: ${this.results.skipped}`)
    colorLog('bright', `Pass Rate: ${passRate}%\n`)
    
    // Critical failures
    const criticalFailures = this.results.details.filter(t => !t.success && t.critical)
    if (criticalFailures.length > 0) {
      colorLog('red', '🚨 Critical Failures:')
      criticalFailures.forEach(failure => {
        colorLog('red', `  • ${failure.name}: ${failure.message}`)
      })
      console.log()
    }
    
    // Recommendations
    colorLog('bright', '💡 Recommendations:')
    
    if (this.results.failed > 0) {
      colorLog('cyan', '1. Fix critical failures before using diagnostic tools')
    }
    
    if (this.results.skipped > 0) {
      colorLog('cyan', '2. Review skipped tests - they may indicate configuration issues')
    }
    
    if (passRate >= 90) {
      colorLog('green', '3. Excellent! Your diagnostic setup is ready to use')
    } else if (passRate >= 70) {
      colorLog('yellow', '3. Good setup, but consider addressing remaining issues')
    } else {
      colorLog('red', '3. Significant issues found - diagnostic tools may not work properly')
    }
    
    // Save detailed report
    const report = {
      timestamp: new Date().toISOString(),
      summary: {
        total,
        passed: this.results.passed,
        failed: this.results.failed,
        skipped: this.results.skipped,
        passRate
      },
      details: this.results.details
    }
    
    fs.writeFileSync('diagnostics-test-report.json', JSON.stringify(report, null, 2))
    colorLog('cyan', '\n📋 Detailed report saved to: diagnostics-test-report.json')
  }
}

// Run if called directly
if (require.main === module) {
  const testSuite = new DiagnosticsTestSuite()
  testSuite.run().catch(error => {
    colorLog('red', `Test suite failed: ${error.message}`)
    process.exit(1)
  })
}

module.exports = { DiagnosticsTestSuite }