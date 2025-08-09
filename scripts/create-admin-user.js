#!/usr/bin/env node

/**
 * Create Admin User Document
 * This script creates a user document in Firestore with admin privileges
 */

const admin = require('firebase-admin');

// Initialize Firebase Admin
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.applicationDefault(),
    projectId: process.env.FIREBASE_PROJECT_ID
  });
}

const db = admin.firestore();

async function createAdminUser() {
  try {
    console.log('🔍 Creating admin user document...');
    
    // Get authenticated user UID (you'll need to replace this with actual UID)
    const adminEmail = process.argv[2] || 'admin@example.com';
    const adminUid = process.argv[3];
    
    if (!adminUid) {
      console.error('❌ Please provide admin UID as argument:');
      console.error('   node create-admin-user.js admin@example.com USER_UID_HERE');
      process.exit(1);
    }
    
    // Create admin user document
    const adminUserData = {
      uid: adminUid,
      email: adminEmail,
      displayName: 'Admin User',
      role: 'admin',
      permissions: [
        'manage_posts',
        'manage_users', 
        'manage_categories',
        'manage_media',
        'manage_site_config'
      ],
      active: true,
      avatar: null,
      bio: 'System Administrator',
      expertise: ['Administration'],
      social: {},
      createdAt: admin.firestore.Timestamp.now(),
      lastLogin: admin.firestore.Timestamp.now()
    };
    
    // Write user document
    await db.collection('users').doc(adminUid).set(adminUserData);
    
    console.log('✅ Admin user document created successfully!');
    console.log('📋 User details:');
    console.log(`   Email: ${adminEmail}`);
    console.log(`   UID: ${adminUid}`);
    console.log(`   Role: admin`);
    console.log(`   Active: true`);
    
  } catch (error) {
    console.error('❌ Error creating admin user:', error);
    process.exit(1);
  }
}

// Run the script
createAdminUser().then(() => {
  console.log('🎉 Admin user setup complete!');
  process.exit(0);
});