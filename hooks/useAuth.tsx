'use client'

import { useState, useEffect, useContext, createContext, ReactNode } from 'react'
import { User, onAuthStateChanged, signInWithEmailAndPassword, signOut as firebaseSignOut } from 'firebase/auth'
import { doc, getDoc } from 'firebase/firestore'
import { auth, db } from '@/lib/firebase/config'
import { AuthUser, UserRole } from '@/types/admin'
import { hasPermission, hasRole, canAccessResource } from '@/lib/auth/permissions'

interface AuthContextType {
  user: AuthUser | null
  loading: boolean
  error: string | null
  signIn: (email: string, password: string) => Promise<void>
  signOut: () => Promise<void>
  hasPermission: (permission: string) => boolean
  hasRole: (roles: UserRole[]) => boolean
  canAccess: (permission: string, ownerId?: string) => boolean
  refreshUser: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | null>(null)

interface AuthProviderProps {
  children: ReactNode
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const getUserData = async (firebaseUser: User): Promise<AuthUser | null> => {
    
    console.log(getUserData, firebaseUser);
    try {
      const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid))
      
      if (!userDoc.exists()) {
        throw new Error('User document not found')
      }

      const userData = userDoc.data()
      
      return {
        uid: firebaseUser.uid,
        email: firebaseUser.email || '',
        displayName: firebaseUser.displayName || userData.displayName || '',
        role: userData.role || 'author',
        permissions: userData.permissions || [],
        avatar: firebaseUser.photoURL || userData.avatar,
        active: userData.active !== false,
        createdAt: userData.createdAt?.toDate?.()?.toISOString() || new Date().toISOString(),
        lastLogin: new Date().toISOString()
      }
    } catch (error) {
      console.error('Error fetching user data:', error)
      return null
    }
  }

  const updateLastLogin = async (uid: string) => {
    try {
      const { updateDoc, doc, serverTimestamp } = await import('firebase/firestore')
      await updateDoc(doc(db, 'users', uid), {
        lastLogin: serverTimestamp()
      })
    } catch (error) {
      console.error('Error updating last login:', error)
    }
  }

  const signIn = async (email: string, password: string) => {
    try {
      setError(null)
      setLoading(true)
      
      const userCredential = await signInWithEmailAndPassword(auth, email, password)
      const userData = await getUserData(userCredential.user)
      
      if (!userData) {
        throw new Error('Failed to load user data')
      }
      
      if (!userData.active) {
        throw new Error('Your account has been deactivated')
      }
      
      await updateLastLogin(userData.uid)
      setUser(userData)
    } catch (error: any) {
      setError(error.message || 'Sign in failed')
      throw error
    } finally {
      setLoading(false)
    }
  }

  const signOut = async () => {
    try {
      setError(null)
      await firebaseSignOut(auth)
      setUser(null)
    } catch (error: any) {
      setError(error.message || 'Sign out failed')
      throw error
    }
  }

  const refreshUser = async () => {
    if (auth.currentUser) {
      const userData = await getUserData(auth.currentUser)
      setUser(userData)
    }
  }

  const checkPermission = (permission: string): boolean => {
    if (!user) return false
    return hasPermission(user.permissions, permission)
  }

  const checkRole = (roles: UserRole[]): boolean => {
    if (!user) return false
    return hasRole(user.role, roles)
  }

  const checkAccess = (permission: string, ownerId?: string): boolean => {
    if (!user) return false
    return canAccessResource(user.role, user.permissions, permission, ownerId, user.uid)
  }

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      try {
        setLoading(true)
        setError(null)
        
        if (firebaseUser) {
          const userData = await getUserData(firebaseUser)
          setUser(userData)
        } else {
          setUser(null)
        }
      } catch (error: any) {
        setError(error.message || 'Authentication error')
        setUser(null)
      } finally {
        setLoading(false)
      }
    })

    return () => unsubscribe()
  }, [])

  const value = {
    user,
    loading,
    error,
    signIn,
    signOut,
    hasPermission: checkPermission,
    hasRole: checkRole,
    canAccess: checkAccess,
    refreshUser
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export default useAuth