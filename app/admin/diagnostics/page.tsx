'use client'

import { useState, useEffect } from 'react'
import { 
  CheckCircleIcon, 
  ExclamationTriangleIcon, 
  XCircleIcon,
  PlayIcon,
  ArrowPathIcon,
  ChartBarIcon,
  CogIcon
} from '@heroicons/react/24/outline'

interface DiagnosticResult {
  name: string
  status: 'success' | 'warning' | 'error' | 'running'
  message: string
  duration?: number
  details?: string[]
}

interface HealthReport {
  timestamp: string
  healthScore: number
  issues: Array<{
    message: string
    severity: 'HIGH' | 'MEDIUM' | 'LOW'
    fix: string
  }>
  warnings: Array<{
    message: string
    fix?: string
  }>
  successes: Array<{
    message: string
  }>
  autoFixes: string[]
}

export default function DiagnosticsPage() {
  const [diagnostics, setDiagnostics] = useState<DiagnosticResult[]>([])
  const [isRunning, setIsRunning] = useState(false)
  const [healthReport, setHealthReport] = useState<HealthReport | null>(null)
  const [monitoringActive, setMonitoringActive] = useState(false)
  const [performanceMetrics, setPerformanceMetrics] = useState({
    averageResponseTime: 0,
    uptime: 100,
    errorRate: 0
  })

  useEffect(() => {
    loadLatestReport()
  }, [])

  const loadLatestReport = async () => {
    try {
      const response = await fetch('/api/admin/diagnostics/report')
      if (response.ok) {
        const report = await response.json()
        setHealthReport(report)
      }
    } catch (error) {
      console.error('Failed to load health report:', error)
    }
  }

  const runDiagnostics = async () => {
    setIsRunning(true)
    setDiagnostics([])

    const checks = [
      { name: 'Firebase Connection', endpoint: '/api/admin/diagnostics/firebase-connection' },
      { name: 'Firestore Access', endpoint: '/api/admin/diagnostics/firestore' },
      { name: 'Authentication', endpoint: '/api/admin/diagnostics/auth' },
      { name: 'Storage Access', endpoint: '/api/admin/diagnostics/storage' },
      { name: 'Security Rules', endpoint: '/api/admin/diagnostics/security' },
      { name: 'Performance', endpoint: '/api/admin/diagnostics/performance' }
    ]

    for (const check of checks) {
      setDiagnostics(prev => [...prev, {
        name: check.name,
        status: 'running',
        message: 'Running check...'
      }])

      try {
        const startTime = Date.now()
        const response = await fetch(check.endpoint, { method: 'POST' })
        const result = await response.json()
        const duration = Date.now() - startTime

        setDiagnostics(prev => prev.map(d => 
          d.name === check.name 
            ? {
                ...d,
                status: result.success ? 'success' : result.severity === 'warning' ? 'warning' : 'error',
                message: result.message,
                duration,
                details: result.details
              }
            : d
        ))

        // Small delay for better UX
        await new Promise(resolve => setTimeout(resolve, 500))

      } catch (error) {
        setDiagnostics(prev => prev.map(d => 
          d.name === check.name 
            ? {
                ...d,
                status: 'error',
                message: `Check failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
                duration: 0
              }
            : d
        ))
      }
    }

    setIsRunning(false)
    await loadLatestReport()
  }

  const toggleMonitoring = async () => {
    try {
      const endpoint = monitoringActive 
        ? '/api/admin/diagnostics/monitor/stop'
        : '/api/admin/diagnostics/monitor/start'
      
      const response = await fetch(endpoint, { method: 'POST' })
      if (response.ok) {
        setMonitoringActive(!monitoringActive)
      }
    } catch (error) {
      console.error('Failed to toggle monitoring:', error)
    }
  }

  const applyAutoFixes = async () => {
    if (!healthReport?.autoFixes?.length) return

    try {
      const response = await fetch('/api/admin/diagnostics/auto-fix', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fixes: healthReport.autoFixes })
      })

      if (response.ok) {
        await runDiagnostics()
      }
    } catch (error) {
      console.error('Failed to apply auto-fixes:', error)
    }
  }

  const getStatusIcon = (status: DiagnosticResult['status']) => {
    switch (status) {
      case 'success':
        return <CheckCircleIcon className="h-5 w-5 text-green-500" />
      case 'warning':
        return <ExclamationTriangleIcon className="h-5 w-5 text-yellow-500" />
      case 'error':
        return <XCircleIcon className="h-5 w-5 text-red-500" />
      case 'running':
        return <ArrowPathIcon className="h-5 w-5 text-blue-500 animate-spin" />
    }
  }

  const getStatusColor = (status: DiagnosticResult['status']) => {
    switch (status) {
      case 'success':
        return 'border-green-200 bg-green-50'
      case 'warning':
        return 'border-yellow-200 bg-yellow-50'
      case 'error':
        return 'border-red-200 bg-red-50'
      case 'running':
        return 'border-blue-200 bg-blue-50'
    }
  }

  const healthScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-600'
    if (score >= 70) return 'text-yellow-600'
    return 'text-red-600'
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Firebase Diagnostics</h1>
        <p className="text-gray-600">Monitor and troubleshoot Firebase connectivity and performance</p>
      </div>

      {/* Quick Actions */}
      <div className="mb-6 flex flex-wrap gap-4">
        <button
          onClick={runDiagnostics}
          disabled={isRunning}
          className="inline-flex items-center px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50"
        >
          {isRunning ? (
            <ArrowPathIcon className="h-5 w-5 mr-2 animate-spin" />
          ) : (
            <PlayIcon className="h-5 w-5 mr-2" />
          )}
          {isRunning ? 'Running...' : 'Run Diagnostics'}
        </button>

        <button
          onClick={toggleMonitoring}
          className={`inline-flex items-center px-4 py-2 font-medium rounded-lg ${
            monitoringActive
              ? 'bg-red-600 text-white hover:bg-red-700'
              : 'bg-green-600 text-white hover:bg-green-700'
          }`}
        >
          <ChartBarIcon className="h-5 w-5 mr-2" />
          {monitoringActive ? 'Stop Monitoring' : 'Start Monitoring'}
        </button>

        {healthReport?.autoFixes?.length > 0 && (
          <button
            onClick={applyAutoFixes}
            className="inline-flex items-center px-4 py-2 bg-purple-600 text-white font-medium rounded-lg hover:bg-purple-700"
          >
            <CogIcon className="h-5 w-5 mr-2" />
            Apply Auto-Fixes ({healthReport.autoFixes.length})
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Health Overview */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg border p-6">
            <h2 className="text-lg font-semibold mb-4">Health Overview</h2>
            
            {healthReport && (
              <div className="space-y-4">
                <div className="text-center">
                  <div className={`text-4xl font-bold ${healthScoreColor(healthReport.healthScore)}`}>
                    {Math.round(healthReport.healthScore)}%
                  </div>
                  <div className="text-sm text-gray-500">Health Score</div>
                </div>

                <div className="grid grid-cols-3 gap-4 text-center">
                  <div>
                    <div className="text-2xl font-bold text-green-600">{healthReport.successes.length}</div>
                    <div className="text-xs text-gray-500">Passed</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-yellow-600">{healthReport.warnings.length}</div>
                    <div className="text-xs text-gray-500">Warnings</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-red-600">{healthReport.issues.length}</div>
                    <div className="text-xs text-gray-500">Issues</div>
                  </div>
                </div>

                <div className="text-xs text-gray-400 text-center">
                  Last updated: {new Date(healthReport.timestamp).toLocaleString()}
                </div>
              </div>
            )}

            {/* Performance Metrics */}
            <div className="mt-6 pt-6 border-t">
              <h3 className="text-sm font-semibold mb-3">Performance Metrics</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Avg Response Time</span>
                  <span className="font-mono">{performanceMetrics.averageResponseTime}ms</span>
                </div>
                <div className="flex justify-between">
                  <span>Uptime</span>
                  <span className="font-mono">{performanceMetrics.uptime.toFixed(1)}%</span>
                </div>
                <div className="flex justify-between">
                  <span>Error Rate</span>
                  <span className="font-mono">{performanceMetrics.errorRate.toFixed(1)}%</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Diagnostic Results */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg border">
            <div className="p-6 border-b">
              <h2 className="text-lg font-semibold">Diagnostic Results</h2>
            </div>
            
            <div className="p-6">
              {diagnostics.length === 0 && !isRunning ? (
                <div className="text-center py-8 text-gray-500">
                  <ChartBarIcon className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                  <p>No diagnostic results yet. Run diagnostics to see results.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {diagnostics.map((diagnostic, index) => (
                    <div
                      key={diagnostic.name}
                      className={`p-4 rounded-lg border ${getStatusColor(diagnostic.status)}`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center">
                          {getStatusIcon(diagnostic.status)}
                          <h3 className="ml-3 font-medium">{diagnostic.name}</h3>
                        </div>
                        {diagnostic.duration && (
                          <span className="text-sm text-gray-500 font-mono">
                            {diagnostic.duration}ms
                          </span>
                        )}
                      </div>
                      
                      <p className="text-sm text-gray-700 ml-8">{diagnostic.message}</p>
                      
                      {diagnostic.details && diagnostic.details.length > 0 && (
                        <div className="mt-3 ml-8">
                          <details className="text-sm">
                            <summary className="cursor-pointer text-gray-600">Show details</summary>
                            <ul className="mt-2 space-y-1 text-gray-600">
                              {diagnostic.details.map((detail, i) => (
                                <li key={i} className="ml-4">• {detail}</li>
                              ))}
                            </ul>
                          </details>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Issues and Fixes */}
      {healthReport && (healthReport.issues.length > 0 || healthReport.warnings.length > 0) && (
        <div className="mt-6 grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Issues */}
          {healthReport.issues.length > 0 && (
            <div className="bg-white rounded-lg border">
              <div className="p-6 border-b">
                <h2 className="text-lg font-semibold text-red-600">Issues ({healthReport.issues.length})</h2>
              </div>
              <div className="p-6">
                <div className="space-y-4">
                  {healthReport.issues.map((issue, index) => (
                    <div key={index} className="border-l-4 border-red-500 pl-4">
                      <div className="flex items-center mb-1">
                        <XCircleIcon className="h-4 w-4 text-red-500 mr-2" />
                        <span className="text-sm font-medium text-red-700">[{issue.severity}]</span>
                      </div>
                      <p className="text-sm text-gray-700 mb-2">{issue.message}</p>
                      <p className="text-xs text-gray-600">Fix: {issue.fix}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Warnings */}
          {healthReport.warnings.length > 0 && (
            <div className="bg-white rounded-lg border">
              <div className="p-6 border-b">
                <h2 className="text-lg font-semibold text-yellow-600">Warnings ({healthReport.warnings.length})</h2>
              </div>
              <div className="p-6">
                <div className="space-y-4">
                  {healthReport.warnings.map((warning, index) => (
                    <div key={index} className="border-l-4 border-yellow-500 pl-4">
                      <div className="flex items-center mb-1">
                        <ExclamationTriangleIcon className="h-4 w-4 text-yellow-500 mr-2" />
                      </div>
                      <p className="text-sm text-gray-700 mb-2">{warning.message}</p>
                      {warning.fix && (
                        <p className="text-xs text-gray-600">Suggestion: {warning.fix}</p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Auto-Fixes */}
      {healthReport?.autoFixes && healthReport.autoFixes.length > 0 && (
        <div className="mt-6">
          <div className="bg-white rounded-lg border">
            <div className="p-6 border-b">
              <h2 className="text-lg font-semibold text-purple-600">Available Auto-Fixes</h2>
            </div>
            <div className="p-6">
              <div className="space-y-2">
                {healthReport.autoFixes.map((fix, index) => (
                  <div key={index} className="flex items-center p-3 bg-purple-50 rounded">
                    <CogIcon className="h-4 w-4 text-purple-500 mr-3" />
                    <code className="text-sm font-mono">{fix}</code>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}