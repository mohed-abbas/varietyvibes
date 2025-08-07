#!/usr/bin/env node

/**
 * Real-time Firebase Monitor
 * Continuous monitoring of Firebase health and performance
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
  cyan: '\x1b[36m'
}

function colorLog(color, message) {
  console.log(`${colors[color]}${message}${colors.reset}`)
}

class FirebaseMonitor {
  constructor(options = {}) {
    this.interval = options.interval || 30000 // 30 seconds
    this.alertThresholds = {
      responseTime: options.responseTimeThreshold || 1000, // 1 second
      errorRate: options.errorRateThreshold || 0.05, // 5%
      healthScore: options.healthScoreThreshold || 70 // 70%
    }
    
    this.metrics = {
      checks: 0,
      errors: 0,
      responseTimeHistory: [],
      healthScoreHistory: [],
      alerts: []
    }
    
    this.isRunning = false
    this.admin = null
    this.db = null
  }

  async start() {
    if (this.isRunning) {
      colorLog('yellow', '⚠️ Monitor is already running')
      return
    }

    colorLog('bright', '🔥 Firebase Real-time Monitor Starting...\n')
    colorLog('cyan', `Monitoring interval: ${this.interval / 1000} seconds`)
    colorLog('cyan', `Alert thresholds: Response time: ${this.alertThresholds.responseTime}ms, Error rate: ${this.alertThresholds.errorRate * 100}%, Health score: ${this.alertThresholds.healthScore}%\n`)
    
    this.isRunning = true
    
    // Initial setup
    await this.initializeFirebase()
    
    // Start monitoring loop
    this.monitoringLoop()
    
    // Setup graceful shutdown
    process.on('SIGINT', () => this.stop())
    process.on('SIGTERM', () => this.stop())
    
    colorLog('green', '✅ Monitor started successfully')
    colorLog('cyan', 'Press Ctrl+C to stop monitoring\n')
  }

  async stop() {
    if (!this.isRunning) return
    
    this.isRunning = false
    colorLog('\nyellow', '🛑 Stopping Firebase Monitor...')
    
    // Save final metrics
    await this.saveFinalReport()
    
    colorLog('green', '✅ Monitor stopped successfully')
    process.exit(0)
  }

  async initializeFirebase() {
    try {
      const admin = require('firebase-admin')
      
      // Clean up existing apps
      admin.apps.forEach(app => app.delete())
      
      this.admin = admin.initializeApp({
        credential: admin.credential.cert({
          type: "service_account",
          project_id: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
          private_key: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
          client_email: process.env.FIREBASE_CLIENT_EMAIL,
        })
      })
      
      this.db = admin.firestore()
      
      colorLog('green', '✅ Firebase initialized for monitoring')
    } catch (error) {
      colorLog('red', `❌ Firebase initialization failed: ${error.message}`)
      throw error
    }
  }

  async monitoringLoop() {
    while (this.isRunning) {
      try {
        await this.runHealthCheck()
        await this.sleep(this.interval)
      } catch (error) {
        colorLog('red', `❌ Monitoring error: ${error.message}`)
        this.metrics.errors++
      }
    }
  }

  async runHealthCheck() {
    const startTime = Date.now()
    const timestamp = new Date().toISOString()
    
    this.metrics.checks++
    
    try {
      // Test database connectivity
      const connectivityResult = await this.testConnectivity()
      
      // Test read performance
      const readResult = await this.testReadPerformance()
      
      // Test write performance
      const writeResult = await this.testWritePerformance()
      
      // Calculate metrics
      const totalTime = Date.now() - startTime
      const healthScore = this.calculateHealthScore(connectivityResult, readResult, writeResult)
      
      // Update metrics history
      this.updateMetrics(totalTime, healthScore)
      
      // Display real-time status
      this.displayStatus(timestamp, {
        connectivity: connectivityResult,
        read: readResult,
        write: writeResult,
        totalTime,
        healthScore
      })
      
      // Check for alerts
      await this.checkAlerts(totalTime, healthScore)
      
    } catch (error) {
      this.metrics.errors++
      colorLog('red', `❌ [${timestamp}] Health check failed: ${error.message}`)
    }
  }

  async testConnectivity() {
    try {
      const startTime = Date.now()
      await this.db.collection('health-check').doc('connectivity').get()
      const duration = Date.now() - startTime
      
      return { success: true, duration, error: null }
    } catch (error) {
      return { success: false, duration: 0, error: error.message }
    }
  }

  async testReadPerformance() {
    try {
      const startTime = Date.now()
      await this.db.collection('users').limit(1).get()
      const duration = Date.now() - startTime
      
      return { success: true, duration, error: null }
    } catch (error) {
      return { success: false, duration: 0, error: error.message }
    }
  }

  async testWritePerformance() {
    try {
      const startTime = Date.now()
      const testDoc = {
        timestamp: Date.now(),
        monitor: true,
        test: Math.random()
      }
      
      const docRef = await this.db.collection('health-check').add(testDoc)
      
      // Clean up test document
      await docRef.delete()
      
      const duration = Date.now() - startTime
      return { success: true, duration, error: null }
    } catch (error) {
      return { success: false, duration: 0, error: error.message }
    }
  }

  calculateHealthScore(connectivity, read, write) {
    let score = 0
    
    // Connectivity (40% weight)
    if (connectivity.success) {
      score += 40
      if (connectivity.duration < 200) score += 10
    }
    
    // Read performance (30% weight)
    if (read.success) {
      score += 30
      if (read.duration < 100) score += 10
    }
    
    // Write performance (30% weight)  
    if (write.success) {
      score += 30
      if (write.duration < 500) score += 10
    }
    
    return Math.min(100, score)
  }

  updateMetrics(responseTime, healthScore) {
    // Keep only last 100 entries for history
    if (this.metrics.responseTimeHistory.length >= 100) {
      this.metrics.responseTimeHistory.shift()
    }
    if (this.metrics.healthScoreHistory.length >= 100) {
      this.metrics.healthScoreHistory.shift()
    }
    
    this.metrics.responseTimeHistory.push(responseTime)
    this.metrics.healthScoreHistory.push(healthScore)
  }

  displayStatus(timestamp, results) {
    // Clear previous lines for real-time update
    process.stdout.write('\x1B[2K\x1B[1A'.repeat(5))
    
    const time = new Date(timestamp).toLocaleTimeString()
    
    colorLog('bright', `📊 [${time}] Firebase Health Status`)
    
    // Connectivity
    const connIcon = results.connectivity.success ? '🟢' : '🔴'
    colorLog('white', `   ${connIcon} Connectivity: ${results.connectivity.duration}ms`)
    
    // Read performance
    const readIcon = results.read.success ? '🟢' : '🔴'
    colorLog('white', `   ${readIcon} Read: ${results.read.duration}ms`)
    
    // Write performance
    const writeIcon = results.write.success ? '🟢' : '🔴'
    colorLog('white', `   ${writeIcon} Write: ${results.write.duration}ms`)
    
    // Health score
    const healthColor = results.healthScore >= 90 ? 'green' : results.healthScore >= 70 ? 'yellow' : 'red'
    colorLog(healthColor, `   🏥 Health Score: ${Math.round(results.healthScore)}%`)
    
    // Stats
    const errorRate = this.metrics.checks > 0 ? (this.metrics.errors / this.metrics.checks) * 100 : 0
    colorLog('cyan', `   📈 Checks: ${this.metrics.checks} | Errors: ${this.metrics.errors} (${errorRate.toFixed(1)}%)\n`)
  }

  async checkAlerts(responseTime, healthScore) {
    const alerts = []
    
    // Response time alert
    if (responseTime > this.alertThresholds.responseTime) {
      alerts.push({
        type: 'PERFORMANCE',
        message: `High response time: ${responseTime}ms (threshold: ${this.alertThresholds.responseTime}ms)`,
        severity: 'WARNING',
        timestamp: new Date().toISOString()
      })
    }
    
    // Health score alert
    if (healthScore < this.alertThresholds.healthScore) {
      alerts.push({
        type: 'HEALTH',
        message: `Low health score: ${Math.round(healthScore)}% (threshold: ${this.alertThresholds.healthScore}%)`,
        severity: 'CRITICAL',
        timestamp: new Date().toISOString()
      })
    }
    
    // Error rate alert
    const errorRate = this.metrics.checks > 0 ? this.metrics.errors / this.metrics.checks : 0
    if (errorRate > this.alertThresholds.errorRate) {
      alerts.push({
        type: 'ERROR_RATE',
        message: `High error rate: ${(errorRate * 100).toFixed(1)}% (threshold: ${this.alertThresholds.errorRate * 100}%)`,
        severity: 'CRITICAL',
        timestamp: new Date().toISOString()
      })
    }
    
    // Display alerts
    for (const alert of alerts) {
      const color = alert.severity === 'CRITICAL' ? 'red' : 'yellow'
      const icon = alert.severity === 'CRITICAL' ? '🚨' : '⚠️'
      
      colorLog(color, `${icon} ALERT [${alert.type}]: ${alert.message}`)
      
      // Store alert
      this.metrics.alerts.push(alert)
      
      // Save alert to file
      await this.saveAlert(alert)
    }
  }

  async saveAlert(alert) {
    try {
      const alertsFile = path.join(process.cwd(), 'firebase-alerts.log')
      const alertLine = `[${alert.timestamp}] ${alert.severity} - ${alert.type}: ${alert.message}\n`
      
      fs.appendFileSync(alertsFile, alertLine)
    } catch (error) {
      // Ignore file save errors in monitoring
    }
  }

  async saveFinalReport() {
    try {
      const avgResponseTime = this.metrics.responseTimeHistory.length > 0 
        ? this.metrics.responseTimeHistory.reduce((a, b) => a + b) / this.metrics.responseTimeHistory.length 
        : 0
      
      const avgHealthScore = this.metrics.healthScoreHistory.length > 0
        ? this.metrics.healthScoreHistory.reduce((a, b) => a + b) / this.metrics.healthScoreHistory.length
        : 0
      
      const report = {
        session: {
          startTime: Date.now() - (this.metrics.checks * this.interval),
          endTime: Date.now(),
          duration: this.metrics.checks * this.interval
        },
        summary: {
          totalChecks: this.metrics.checks,
          totalErrors: this.metrics.errors,
          errorRate: this.metrics.checks > 0 ? (this.metrics.errors / this.metrics.checks) * 100 : 0,
          averageResponseTime: Math.round(avgResponseTime),
          averageHealthScore: Math.round(avgHealthScore)
        },
        performance: {
          responseTimeHistory: this.metrics.responseTimeHistory.slice(-50), // Last 50
          healthScoreHistory: this.metrics.healthScoreHistory.slice(-50)
        },
        alerts: this.metrics.alerts,
        thresholds: this.alertThresholds
      }
      
      const reportFile = path.join(process.cwd(), 'firebase-monitoring-report.json')
      fs.writeFileSync(reportFile, JSON.stringify(report, null, 2))
      
      colorLog('cyan', `📋 Monitoring report saved to: firebase-monitoring-report.json`)
      
      // Summary
      colorLog('bright', '\n📊 Session Summary:')
      colorLog('white', `   Duration: ${Math.round(report.session.duration / 1000 / 60)} minutes`)
      colorLog('white', `   Checks: ${report.summary.totalChecks}`)
      colorLog('white', `   Errors: ${report.summary.totalErrors} (${report.summary.errorRate.toFixed(1)}%)`)
      colorLog('white', `   Avg Response: ${report.summary.averageResponseTime}ms`)
      colorLog('white', `   Avg Health: ${report.summary.averageHealthScore}%`)
      colorLog('white', `   Alerts: ${report.alerts.length}`)
      
    } catch (error) {
      colorLog('red', `❌ Failed to save monitoring report: ${error.message}`)
    }
  }

  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms))
  }
}

// CLI handling
async function main() {
  const args = process.argv.slice(2)
  const options = {}
  
  // Parse command line arguments
  for (let i = 0; i < args.length; i += 2) {
    const flag = args[i]
    const value = args[i + 1]
    
    switch (flag) {
      case '--interval':
        options.interval = parseInt(value) * 1000
        break
      case '--response-threshold':
        options.responseTimeThreshold = parseInt(value)
        break
      case '--health-threshold':
        options.healthScoreThreshold = parseInt(value)
        break
      case '--error-threshold':
        options.errorRateThreshold = parseFloat(value)
        break
    }
  }
  
  const monitor = new FirebaseMonitor(options)
  await monitor.start()
}

// Run if called directly
if (require.main === module) {
  main().catch(error => {
    colorLog('red', `Monitor failed: ${error.message}`)
    process.exit(1)
  })
}

module.exports = { FirebaseMonitor }