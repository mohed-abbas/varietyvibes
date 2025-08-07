# Variety Vibes Admin Panel - Phase 1 Setup

## 🎉 Phase 1 Implementation Complete

Phase 1 of the admin panel has been successfully implemented with the following components:

### ✅ Completed Components

1. **Firebase Configuration**
   - Client-side Firebase config (`lib/firebase/config.ts`)
   - Server-side Firebase Admin config (`lib/firebase/admin.ts`)
   - Environment variables template (`.env.example`)

2. **Authentication System**
   - Role-based permissions (`lib/auth/permissions.ts`)
   - Authentication hooks (`hooks/useAuth.ts`)
   - API middleware (`lib/auth/middleware.ts`)
   - Auth utilities (`lib/auth/utils.ts`)

3. **TypeScript Types**
   - Complete admin panel interfaces (`types/admin.ts`)
   - Firestore document schemas
   - API response types

4. **Security Rules**
   - Firestore security rules (`firestore.rules`)
   - Firebase Storage rules (`storage.rules`)
   - Firestore indexes (`firestore.indexes.json`)

5. **Basic Admin Interface**
   - Admin login page (`app/admin/login/page.tsx`)
   - Setup script (`scripts/setup-firebase.js`)

## 🚀 Quick Start Guide

### 1. Environment Setup

Copy the example environment file:
```bash
cp .env.example .env.local
```

Fill in your Firebase credentials in `.env.local`:
```env
# Firebase Configuration
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id

# Server-side Firebase Admin
FIREBASE_PROJECT_ID=your_project_id
FIREBASE_CLIENT_EMAIL=your_service_account_email
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYOUR_PRIVATE_KEY\n-----END PRIVATE KEY-----\n"

# Admin Users
ADMIN_EMAILS=admin@example.com,editor@example.com
```

### 2. Firebase Project Setup

1. Create a Firebase project at [console.firebase.google.com](https://console.firebase.google.com)
2. Enable Authentication, Firestore, and Storage
3. Generate a service account key (Settings > Service accounts)
4. Install Firebase CLI: `npm install -g firebase-tools`
5. Login and select project: `firebase login && firebase use --add`

### 3. Deploy Security Rules

```bash
# Deploy Firestore rules
firebase deploy --only firestore:rules

# Deploy Storage rules  
firebase deploy --only storage
```

### 4. Initialize Database

Run the setup script to create initial admin users and collections:
```bash
node scripts/setup-firebase.js
```

### 5. Start Development

```bash
npm run dev
```

Visit `http://localhost:3000/admin/login` to test the admin login.

## 🏗️ Architecture Overview

### Authentication Flow
1. **Client Authentication**: Firebase Auth with email/password
2. **Role-Based Access**: Admin/Editor/Author roles with granular permissions
3. **API Security**: JWT token verification with role/permission checks
4. **Firestore Rules**: Database-level security enforcement

### Database Schema

#### Collections:
- **users**: Admin user accounts with roles and permissions
- **posts**: Blog posts with status, categories, and metadata
- **categories**: Post categories with SEO and display settings
- **media**: File uploads with usage tracking
- **site_config**: Global site configuration

#### Security Model:
- **Role Hierarchy**: Admin > Editor > Author
- **Permission System**: Granular permissions for each operation
- **Owner-based Access**: Users can modify their own content
- **Public Read**: Published content accessible to all

### API Architecture
- **Middleware Authentication**: JWT token verification
- **Role Authorization**: Permission-based access control
- **Error Handling**: Structured error responses
- **Type Safety**: Full TypeScript integration

## 📊 Role & Permission System

### Roles

**Admin**
- Full system access
- User management
- Site configuration
- All content operations

**Editor**
- Content management
- Category management
- Media management
- Limited user access

**Author**
- Create/edit own posts
- Upload own media
- Draft management

### Permissions Matrix

| Permission | Admin | Editor | Author |
|------------|-------|--------|--------|
| `posts.create` | ✅ | ✅ | ✅ |
| `posts.edit` | ✅ | ✅ | Own only |
| `posts.delete` | ✅ | ✅ | ❌ |
| `posts.publish` | ✅ | ✅ | ❌ |
| `categories.*` | ✅ | ✅ | ❌ |
| `users.*` | ✅ | View only | ❌ |
| `settings.*` | ✅ | ❌ | ❌ |

## 🔧 API Usage Examples

### Authentication
```typescript
// Client-side login
import { useAuth } from '@/hooks/useAuth'

const { signIn, user, hasPermission } = useAuth()
await signIn('admin@example.com', 'password')

// Check permissions
if (hasPermission('posts.create')) {
  // User can create posts
}
```

### API Middleware
```typescript
// Protected API route
import { withAuth } from '@/lib/auth/middleware'

export const GET = withAuth({ 
  allowedRoles: ['admin', 'editor'] 
})(async (request) => {
  const user = request.user // Authenticated user
  // Handle request
})
```

## 🧪 Testing

### Local Development with Emulators

```bash
# Install Firebase tools
npm install -g firebase-tools

# Start emulators
firebase emulators:start

# In .env.local, emulators will auto-connect in development
NODE_ENV=development
```

Access emulator UI at `http://localhost:4000`

### Manual Testing

1. **Authentication**: Test login at `/admin/login`
2. **Authorization**: Verify role-based access
3. **Database**: Check Firestore collections
4. **Storage**: Test file upload permissions

## 🎯 Next Steps (Phase 2)

The foundation is ready for Phase 2 implementation:

1. **Admin Layout**: Create main admin dashboard layout
2. **Dashboard**: Analytics and overview components  
3. **Posts Management**: CRUD interface for posts
4. **Media Library**: File upload and management
5. **User Management**: Admin user interface

## 📚 Additional Resources

- [Firebase Auth Documentation](https://firebase.google.com/docs/auth)
- [Firestore Security Rules](https://firebase.google.com/docs/firestore/security/rules-structure)
- [Next.js API Routes](https://nextjs.org/docs/api-routes/introduction)
- [TypeScript Interfaces](https://www.typescriptlang.org/docs/handbook/interfaces.html)

## 🛟 Troubleshooting

**Authentication Issues:**
- Verify Firebase config and service account key
- Check user exists in both Firebase Auth and Firestore
- Ensure security rules are deployed

**Permission Errors:**
- Verify user role and permissions in Firestore
- Check API middleware configuration
- Review security rules logic

**Environment Issues:**
- Confirm all required env variables are set
- Validate private key format (includes newlines)
- Test Firebase Admin SDK initialization