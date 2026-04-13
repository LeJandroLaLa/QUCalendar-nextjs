'use client'

import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import {
  User,
  onAuthStateChanged,
  signInWithPopup,
  GoogleAuthProvider,
  sendSignInLinkToEmail,
  isSignInWithEmailLink,
  signInWithEmailLink,
  signOut as firebaseSignOut,
} from 'firebase/auth'
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore'
import { auth } from '@/lib/firebase'
import { db } from '@/lib/firebase'
import { QUUser } from '@/lib/types'

interface AuthContextType {
  user: User | null
  quUser: QUUser | null
  loading: boolean
  signInWithGoogle: () => Promise<void>
  signInWithMagicLink: (email: string) => Promise<void>
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [quUser, setQuUser] = useState<QUUser | null>(null)
  const [loading, setLoading] = useState(true)

  async function syncUserDocument(firebaseUser: User): Promise<void> {
    const userRef = doc(db, 'users', firebaseUser.uid)
    const userSnap = await getDoc(userRef)

    if (!userSnap.exists()) {
      const newUser: QUUser = {
        userId: firebaseUser.uid,
        displayName: firebaseUser.displayName ?? 'Anonymous',
        email: firebaseUser.email ?? '',
        roles: ['user'],
        isProfilePublic: false,
        createdAt: serverTimestamp() as QUUser['createdAt'],
        lastLoginAt: serverTimestamp() as QUUser['lastLoginAt'],
      }
      await setDoc(userRef, newUser)
      setQuUser(newUser)
    } else {
      await setDoc(userRef, { lastLoginAt: serverTimestamp() }, { merge: true })
      setQuUser(userSnap.data() as QUUser)
    }
  }

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser)
      if (firebaseUser) {
        await syncUserDocument(firebaseUser)
      } else {
        setQuUser(null)
      }
      setLoading(false)
    })
    return unsubscribe
  }, [])

  // Handle magic link completion on page load
  useEffect(() => {
    if (isSignInWithEmailLink(auth, window.location.href)) {
      let email = localStorage.getItem('emailForSignIn')
      if (!email) {
        email = window.prompt('Please provide your email for confirmation')
      }
      if (email) {
        signInWithEmailLink(auth, email, window.location.href)
          .then(() => {
            localStorage.removeItem('emailForSignIn')
          })
          .catch((error) => {
            console.error('Error completing magic link sign in:', error)
          })
      }
    }
  }, [])

  const signInWithGoogle = async () => {
    const provider = new GoogleAuthProvider()
    provider.addScope('email')
    provider.addScope('profile')
    await signInWithPopup(auth, provider)
  }

  const signInWithMagicLink = async (email: string) => {
    const actionCodeSettings = {
      url: `${window.location.origin}/auth/callback`,
      handleCodeInApp: true,
    }
    await sendSignInLinkToEmail(auth, email, actionCodeSettings)
    localStorage.setItem('emailForSignIn', email)
  }

  const signOut = async () => {
    await firebaseSignOut(auth)
  }

  return (
    <AuthContext.Provider value={{ user, quUser, loading, signInWithGoogle, signInWithMagicLink, signOut }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth must be used within AuthProvider')
  return context
}
