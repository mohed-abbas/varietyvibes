import { NextRequest, NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'

export async function GET(request: NextRequest) {
  try {
    // Try to read the latest health report
    const reportPath = path.join(process.cwd(), 'firebase-health-report.json')
    
    if (!fs.existsSync(reportPath)) {
      // Return a basic report if none exists
      return NextResponse.json({
        timestamp: new Date().toISOString(),
        healthScore: 0,
        issues: [{
          message: 'No health report found',
          severity: 'HIGH' as const,
          fix: 'Run diagnostics to generate health report'
        }],
        warnings: [],
        successes: [],
        autoFixes: ['npm run firebase:diagnose'],
        summary: {
          totalChecks: 0,
          issuesCount: 1,
          warningsCount: 0,
          successCount: 0
        }
      })
    }

    const reportData = fs.readFileSync(reportPath, 'utf8')
    const report = JSON.parse(reportData)
    
    return NextResponse.json(report)

  } catch (error) {
    console.error('Failed to load health report:', error)
    
    return NextResponse.json({
      timestamp: new Date().toISOString(),
      healthScore: 0,
      issues: [{
        message: 'Failed to load health report',
        severity: 'HIGH' as const,
        fix: 'Check file system permissions and run diagnostics'
      }],
      warnings: [],
      successes: [],
      autoFixes: [],
      summary: {
        totalChecks: 0,
        issuesCount: 1,
        warningsCount: 0,
        successCount: 0
      }
    }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    // Trigger a new health report generation
    const { spawn } = require('child_process')
    
    return new Promise((resolve) => {
      const healthChecker = spawn('node', ['scripts/firebase-health-checker.js'], {
        stdio: 'pipe'
      })
      
      let output = ''
      let error = ''
      
      healthChecker.stdout.on('data', (data: Buffer) => {
        output += data.toString()
      })
      
      healthChecker.stderr.on('data', (data: Buffer) => {
        error += data.toString()
      })
      
      healthChecker.on('close', (code: number) => {
        if (code === 0) {
          // Try to read the generated report
          try {
            const reportPath = path.join(process.cwd(), 'firebase-health-report.json')
            if (fs.existsSync(reportPath)) {
              const reportData = fs.readFileSync(reportPath, 'utf8')
              const report = JSON.parse(reportData)
              resolve(NextResponse.json(report))
            } else {
              resolve(NextResponse.json({
                success: false,
                message: 'Health report generation completed but no report file found'
              }))
            }
          } catch (parseError) {
            resolve(NextResponse.json({
              success: false,
              message: 'Health report generation completed but failed to parse report'
            }))
          }
        } else {
          resolve(NextResponse.json({
            success: false,
            message: `Health check failed with code ${code}`,
            output,
            error
          }))
        }
      })
      
      healthChecker.on('error', (err: Error) => {
        resolve(NextResponse.json({
          success: false,
          message: `Failed to run health checker: ${err.message}`
        }))
      })
    })

  } catch (error) {
    console.error('Failed to generate health report:', error)
    
    return NextResponse.json({
      success: false,
      message: `Failed to generate health report: ${error instanceof Error ? error.message : 'Unknown error'}`
    }, { status: 500 })
  }
}