import { NextRequest, NextResponse } from 'next/server'
import { adminDb } from '@/lib/firebase-admin'

export async function POST(request: NextRequest) {
  try {
    const startTime = Date.now()
    const checks = []
    let hasIssues = false

    // Test basic Firestore operations
    try {
      // Test read operation
      const readStart = Date.now()
      await adminDb.collection('health-check').limit(1).get()
      const readTime = Date.now() - readStart
      checks.push(`✅ Read operation: ${readTime}ms`)
      
      // Test write operation  
      const writeStart = Date.now()
      const testDoc = adminDb.collection('health-check').doc('diagnostic-test')
      await testDoc.set({
        timestamp: Date.now(),
        test: true
      })
      const writeTime = Date.now() - writeStart
      checks.push(`✅ Write operation: ${writeTime}ms`)
      
      // Clean up test document
      await testDoc.delete()
      
      // Check for required collections
      const requiredCollections = ['users', 'posts', 'categories', 'media']
      const existingCollections = []
      
      for (const collectionName of requiredCollections) {
        try {
          const snapshot = await adminDb.collection(collectionName).limit(1).get()
          existingCollections.push(collectionName)
          
          if (collectionName === 'users' && snapshot.empty) {
            checks.push(`⚠️ Users collection exists but is empty`)
            hasIssues = true
          }
        } catch (error) {
          checks.push(`❌ Collection '${collectionName}' not accessible`)
          hasIssues = true
        }
      }
      
      checks.push(`✅ Found collections: ${existingCollections.join(', ')}`)
      
      // Performance warnings
      if (readTime > 200) {
        checks.push(`⚠️ Slow read performance: ${readTime}ms`)
        hasIssues = true
      }
      
      if (writeTime > 500) {
        checks.push(`⚠️ Slow write performance: ${writeTime}ms`)
        hasIssues = true
      }
      
    } catch (firestoreError) {
      checks.push(`❌ Firestore operation failed: ${firestoreError instanceof Error ? firestoreError.message : 'Unknown error'}`)
      hasIssues = true
    }

    const duration = Date.now() - startTime
    
    return NextResponse.json({
      success: !hasIssues,
      severity: hasIssues ? 'warning' : 'success',
      message: hasIssues 
        ? `Firestore check completed with issues (${duration}ms)`
        : `Firestore is working properly (${duration}ms)`,
      details: checks
    })

  } catch (error) {
    console.error('Firestore diagnostic failed:', error)
    
    return NextResponse.json({
      success: false,
      severity: 'error',
      message: `Firestore diagnostic failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
      details: [
        'Unable to perform Firestore operations',
        'Check Firebase Admin SDK configuration',
        'Verify Firestore database is created in Firebase Console'
      ]
    })
  }
}