# 🔥 Firebase Setup Guide for Variety Vibes Admin Panel

## 🚨 Current Issues to Fix

Your `.env` file has incorrect Firebase Admin SDK credentials. Follow this guide to get the proper credentials.

## Step 1: Create a Firebase Service Account

1. **Go to Firebase Console**: https://console.firebase.google.com
2. **Select your project**: `variety-vibes`
3. **Go to Project Settings** (gear icon)
4. **Navigate to "Service accounts" tab**
5. **Click "Generate new private key"**
6. **Download the JSON file** - it will contain your service account credentials

## Step 2: Extract the Required Values

From the downloaded JSON file, copy these values to your `.env` file:

```env
# Replace these in your .env file:
FIREBASE_PROJECT_ID=variety-vibes
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@variety-vibes.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n[VERY LONG PRIVATE KEY]\n-----END PRIVATE KEY-----\n"
```

⚠️ **Important**: 
- The `FIREBASE_CLIENT_EMAIL` should end with `@variety-vibes.iam.gserviceaccount.com`
- The `FIREBASE_PRIVATE_KEY` should be very long (2000+ characters) and start with `-----BEGIN PRIVATE KEY-----`

## Step 3: Set Up Admin Users

1. **Update Admin Emails** in `.env`:
```env
ADMIN_EMAILS=your-email@gmail.com,another-admin@example.com
```

2. **Run the setup script** to create admin users:
```bash
node scripts/setup-firebase.js
```

## Step 4: Enable Firebase Services

In your Firebase Console:
1. **Authentication** → Enable "Email/Password" provider
2. **Firestore Database** → Create database (start in production mode)
3. **Storage** → Set up Firebase Storage

## Step 5: Deploy Security Rules

```bash
firebase login
firebase use variety-vibes
firebase deploy --only firestore:rules
firebase deploy --only storage
```

## Step 6: Test the Setup

```bash
npm run dev
```

Visit: http://localhost:3000/admin/login

## 🔧 Environment File Template

Your `.env` should look like this:

```env
# Firebase Client Configuration (PUBLIC)
NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSyAsVCKM35XrAEsVXg4rCz6xBhdrN1EfHt0
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=variety-vibes.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=variety-vibes
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=variety-vibes.firebasestorage.app
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=405476816614
NEXT_PUBLIC_FIREBASE_APP_ID=1:405476816614:web:81cb3242a897f41b402d27

# Firebase Admin SDK Configuration (SERVER-SIDE ONLY)
FIREBASE_PROJECT_ID=variety-vibes
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@variety-vibes.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n[YOUR ACTUAL PRIVATE KEY HERE]\n-----END PRIVATE KEY-----\n"
FIREBASE_STORAGE_BUCKET=variety-vibes.firebasestorage.app

# Admin Panel Configuration
ADMIN_EMAILS=your-email@gmail.com
NEXTAUTH_SECRET="oyiXqVAlH5sdHsSvtf9QvBYnm+295DVfljtInOOHKDg="
NEXTAUTH_URL=http://localhost:3000

# Disable Firebase Emulator (optional)
# USE_FIREBASE_EMULATOR=false
```

## 🚀 Ready to Test!

Once you've updated your credentials, restart your development server and try accessing `/admin/login`.