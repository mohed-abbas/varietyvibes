#!/usr/bin/env node

/**
 * Firebase Rules Deployment Script
 * Deploys Firestore and Storage security rules
 */

const { exec } = require('child_process')
const { promisify } = require('util')
const execAsync = promisify(exec)
const path = require('path')

console.log('🔥 Deploying Firebase Security Rules...\n')

async function checkFirebaseCLI() {
  console.log('🔍 Checking Firebase CLI...')
  
  try {
    await execAsync('firebase --version')
    console.log('✅ Firebase CLI is installed')
  } catch (error) {
    console.error('❌ Firebase CLI is not installed')
    console.error('Install it with: npm install -g firebase-tools')
    process.exit(1)
  }
}

async function checkFirebaseLogin() {
  console.log('🔐 Checking Firebase authentication...')
  
  try {
    const { stdout } = await execAsync('firebase projects:list')
    if (stdout.includes('variety-vibes')) {
      console.log('✅ Firebase authenticated and project found')
      return true
    } else {
      console.log('⚠️  Project "variety-vibes" not found in your projects')
      return false
    }
  } catch (error) {
    console.log('❌ Not authenticated with Firebase')
    console.log('Please run: firebase login')
    return false
  }
}

async function setFirebaseProject() {
  console.log('🎯 Setting Firebase project...')
  
  try {
    await execAsync('firebase use variety-vibes')
    console.log('✅ Set project to variety-vibes')
  } catch (error) {
    console.error('❌ Failed to set Firebase project')
    console.error('Make sure "variety-vibes" is a valid Firebase project ID')
    process.exit(1)
  }
}

async function deployFirestoreRules() {
  console.log('📊 Deploying Firestore security rules...')
  
  try {
    const { stdout, stderr } = await execAsync('firebase deploy --only firestore:rules')
    console.log('✅ Firestore rules deployed successfully')
    if (stdout.includes('Error')) {
      console.log('Output:', stdout)
    }
  } catch (error) {
    console.error('❌ Failed to deploy Firestore rules')
    console.error('Error:', error.message)
  }
}

async function deployStorageRules() {
  console.log('📁 Deploying Storage security rules...')
  
  try {
    const { stdout, stderr } = await execAsync('firebase deploy --only storage')
    console.log('✅ Storage rules deployed successfully')
    if (stdout.includes('Error')) {
      console.log('Output:', stdout)
    }
  } catch (error) {
    console.error('❌ Failed to deploy Storage rules')
    console.error('Error:', error.message)
  }
}

async function main() {
  try {
    await checkFirebaseCLI()
    const isLoggedIn = await checkFirebaseLogin()
    
    if (!isLoggedIn) {
      console.log('\n📝 Manual steps required:')
      console.log('1. Run: firebase login')
      console.log('2. Run: firebase use variety-vibes')
      console.log('3. Run this script again')
      return
    }
    
    await setFirebaseProject()
    await deployFirestoreRules()
    await deployStorageRules()
    
    console.log('\n🎉 Firebase rules deployment completed!')
    console.log('\n📋 Next steps:')
    console.log('1. Run: node scripts/setup-firebase.js')
    console.log('2. Start your development server: npm run dev')
    console.log('3. Visit: http://localhost:3000/admin/login')
    
  } catch (error) {
    console.error('❌ Deployment failed:', error.message)
    process.exit(1)
  }
}

main()