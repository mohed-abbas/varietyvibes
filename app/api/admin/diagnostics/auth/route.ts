import { NextRequest, NextResponse } from 'next/server'
import { adminAuth, adminDb } from '@/lib/firebase-admin'

export async function POST(request: NextRequest) {
  try {
    const startTime = Date.now()
    const checks = []
    let hasIssues = false

    // Test Firebase Auth operations
    try {
      // Test Auth SDK availability
      if (!adminAuth) {
        checks.push('❌ Firebase Auth SDK not initialized')
        hasIssues = true
      } else {
        checks.push('✅ Firebase Auth SDK initialized')
        
        // Test user listing (limited)
        try {
          const listStart = Date.now()
          const listResult = await adminAuth.listUsers(1)
          const listTime = Date.now() - listStart
          checks.push(`✅ Auth user listing: ${listTime}ms`)
          
          if (listResult.users.length === 0) {
            checks.push('⚠️ No Auth users found - may need to create test users')
          }
        } catch (listError) {
          checks.push(`❌ Auth listing failed: ${listError instanceof Error ? listError.message : 'Unknown error'}`)
          hasIssues = true
        }
      }

      // Check admin user documents in Firestore
      const adminEmails = process.env.ADMIN_EMAILS?.split(',').map(e => e.trim()) || []
      
      if (adminEmails.length === 0) {
        checks.push('⚠️ No admin emails configured in ADMIN_EMAILS')
        hasIssues = true
      } else {
        checks.push(`✅ Admin emails configured: ${adminEmails.length}`)
        
        // Check if admin users exist in Firestore
        let foundAdmins = 0
        for (const email of adminEmails) {
          try {
            const userQuery = await adminDb.collection('users')
              .where('email', '==', email)
              .limit(1)
              .get()
            
            if (!userQuery.empty) {
              const userData = userQuery.docs[0].data()
              foundAdmins++
              checks.push(`✅ Admin user found: ${email} (role: ${userData.role})`)
              
              // Check permissions
              if (!userData.permissions || !Array.isArray(userData.permissions)) {
                checks.push(`⚠️ Admin user ${email} has no permissions configured`)
                hasIssues = true
              } else {
                checks.push(`✅ Admin user ${email} has ${userData.permissions.length} permissions`)
              }
            } else {
              checks.push(`❌ Admin user not found in Firestore: ${email}`)
              hasIssues = true
            }
          } catch (userError) {
            checks.push(`❌ Error checking admin user ${email}: ${userError instanceof Error ? userError.message : 'Unknown error'}`)
            hasIssues = true
          }
        }
        
        if (foundAdmins === 0) {
          checks.push('❌ No admin users found in Firestore')
          hasIssues = true
        }
      }

    } catch (authError) {
      checks.push(`❌ Auth diagnostic failed: ${authError instanceof Error ? authError.message : 'Unknown error'}`)
      hasIssues = true
    }

    const duration = Date.now() - startTime
    
    return NextResponse.json({
      success: !hasIssues,
      severity: hasIssues ? 'warning' : 'success',
      message: hasIssues 
        ? `Authentication check completed with issues (${duration}ms)`
        : `Authentication is working properly (${duration}ms)`,
      details: checks
    })

  } catch (error) {
    console.error('Auth diagnostic failed:', error)
    
    return NextResponse.json({
      success: false,
      severity: 'error',
      message: `Auth diagnostic failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
      details: [
        'Unable to perform authentication checks',
        'Check Firebase Admin SDK configuration',
        'Verify Firebase Auth is enabled in Firebase Console'
      ]
    })
  }
}