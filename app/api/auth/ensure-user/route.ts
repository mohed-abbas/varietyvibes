// API endpoint to ensure user document exists
import { NextRequest, NextResponse } from 'next/server'
import { adminAuth } from '@/lib/firebase/admin'
import { ensureUserDocument } from '@/lib/auth/utils'

export async function POST(request: NextRequest) {
  try {
    const { idToken } = await request.json()
    
    if (!idToken) {
      return NextResponse.json(
        { error: 'ID token is required' },
        { status: 400 }
      )
    }

    // Verify the ID token
    const decodedToken = await adminAuth.verifyIdToken(idToken)
    const { uid, email, name } = decodedToken

    if (!email) {
      return NextResponse.json(
        { error: 'Email not found in token' },
        { status: 400 }
      )
    }

    // Ensure user document exists
    const userDocument = await ensureUserDocument(uid, email, name)

    return NextResponse.json({
      success: true,
      user: userDocument
    })

  } catch (error) {
    console.error('Error ensuring user document:', error)
    return NextResponse.json(
      { error: 'Failed to ensure user document' },
      { status: 500 }
    )
  }
}