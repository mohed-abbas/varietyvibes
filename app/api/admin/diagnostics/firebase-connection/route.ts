import { NextRequest, NextResponse } from 'next/server'
import { adminAuth, adminDb } from '@/lib/firebase-admin'

export async function POST(request: NextRequest) {
  try {
    const startTime = Date.now()
    
    // Test Firebase Admin SDK initialization
    if (!adminAuth || !adminDb) {
      return NextResponse.json({
        success: false,
        severity: 'error',
        message: 'Firebase Admin SDK not initialized',
        details: ['Check FIREBASE_CLIENT_EMAIL and FIREBASE_PRIVATE_KEY environment variables']
      })
    }

    // Test Firestore connection with a simple read
    await adminDb.collection('health-check').doc('connection-test').get()
    
    const duration = Date.now() - startTime
    
    return NextResponse.json({
      success: true,
      message: `Firebase connection successful (${duration}ms)`,
      details: [
        'Firebase Admin SDK initialized correctly',
        'Firestore connection verified',
        `Response time: ${duration}ms`
      ]
    })

  } catch (error) {
    console.error('Firebase connection test failed:', error)
    
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    let details = []
    let severity = 'error'

    // Provide specific guidance based on error type
    if (errorMessage.includes('Could not load the default credentials')) {
      details = [
        'Firebase credentials are not properly configured',
        'Check FIREBASE_CLIENT_EMAIL and FIREBASE_PRIVATE_KEY in .env',
        'Ensure private key format includes \\n characters'
      ]
    } else if (errorMessage.includes('PERMISSION_DENIED')) {
      details = [
        'Firebase permissions issue',
        'Check Firestore security rules',
        'Verify service account has proper permissions'
      ]
      severity = 'warning'
    } else if (errorMessage.includes('DEADLINE_EXCEEDED')) {
      details = [
        'Firebase connection timeout',
        'Check network connectivity',
        'Firebase services might be experiencing issues'
      ]
    } else {
      details = [
        'Unexpected Firebase connection error',
        `Error: ${errorMessage}`,
        'Check Firebase project settings and credentials'
      ]
    }

    return NextResponse.json({
      success: false,
      severity,
      message: `Firebase connection failed: ${errorMessage}`,
      details
    })
  }
}