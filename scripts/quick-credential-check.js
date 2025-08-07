#!/usr/bin/env node

/**
 * Quick Credential Validation Script
 * Specifically checks for the issues causing "client offline" error
 */

require('dotenv').config({ path: '.env' })

console.log('🔍 Quick Firebase Credential Check\n')

const issues = []
const fixes = []

// Check service account format
const clientEmail = process.env.FIREBASE_CLIENT_EMAIL
if (!clientEmail) {
  issues.push('❌ FIREBASE_CLIENT_EMAIL is missing')
  fixes.push('Add FIREBASE_CLIENT_EMAIL from downloaded JSON')
} else if (!clientEmail.includes('.iam.gserviceaccount.com')) {
  issues.push(`❌ Invalid service account format: ${clientEmail}`)
  fixes.push('Must end with .iam.gserviceaccount.com (from Firebase Console → Service accounts)')
} else {
  console.log('✅ Service account format is valid')
}

// Check private key format
const privateKey = process.env.FIREBASE_PRIVATE_KEY
if (!privateKey) {
  issues.push('❌ FIREBASE_PRIVATE_KEY is missing')
  fixes.push('Add FIREBASE_PRIVATE_KEY from downloaded JSON')
} else if (!privateKey.includes('BEGIN PRIVATE KEY')) {
  issues.push('❌ Private key format is invalid')
  fixes.push('Should start with "-----BEGIN PRIVATE KEY-----" and be ~2000+ characters')
} else if (privateKey.length < 1000) {
  issues.push(`❌ Private key too short: ${privateKey.length} characters`)
  fixes.push('Real private key should be 2000+ characters long')
} else {
  console.log('✅ Private key format looks valid')
}

// Check admin emails
const adminEmails = process.env.ADMIN_EMAILS
if (!adminEmails) {
  issues.push('❌ ADMIN_EMAILS is missing')
  fixes.push('Add your real email address')
} else if (adminEmails.includes('example.com')) {
  issues.push(`❌ Still using example emails: ${adminEmails}`)
  fixes.push('Replace example.com with your real email address')
} else {
  console.log('✅ Admin emails look valid')
}

// Check project ID
const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID
if (projectId !== 'variety-vibes') {
  issues.push(`⚠️  Project ID: ${projectId} (should be 'variety-vibes')`)
}

console.log('\n📋 Summary:')

if (issues.length === 0) {
  console.log('🎉 All credential checks passed!')
  console.log('\n🧪 Next step: Test connection with:')
  console.log('npm run firebase:test')
} else {
  console.log('🚨 Issues found:')
  issues.forEach(issue => console.log(`  ${issue}`))
  
  console.log('\n🔧 Required fixes:')
  fixes.forEach((fix, index) => console.log(`  ${index + 1}. ${fix}`))
  
  console.log('\n📖 Follow the guide:')
  console.log('cat URGENT_FIX_CREDENTIALS.md')
}

console.log('\n💡 Reminder: The "client offline" error is caused by invalid credentials, not network issues!')