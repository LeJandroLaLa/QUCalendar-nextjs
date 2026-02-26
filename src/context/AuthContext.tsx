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
import { auth } from '@/lib/firebase'

interface AuthContextType {
  user: User | null
  loading: boolean
  signInWithGoogle: () => Promise<void>
  signInWithMagicLink: (email: string) => Promise<void>
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user)
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
    <AuthContext.Provider value={{ user, loading, signInWithGoogle, signInWithMagicLink, signOut }}>
      {children}
    </AuthContext.Provider>
  )
}

export { AuthContext }
