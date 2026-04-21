'use client'

import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import {
  User,
  onAuthStateChanged,
  signInWithPopup,
  GoogleAuthProvider,
  signOut as firebaseSignOut,
} from 'firebase/auth'
import { doc, getDoc, setDoc, updateDoc, serverTimestamp } from 'firebase/firestore'
import { auth } from '@/lib/firebase'
import { db } from '@/lib/firebase'
import { QUUser } from '@/lib/types'

interface AuthContextType {
  user: User | null
  quUser: QUUser | null
  loading: boolean
  signInWithGoogle: () => Promise<void>
  signOut: () => Promise<void>
  updateUserRegion: (regionId: string) => Promise<void>
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

  const signInWithGoogle = async () => {
    const provider = new GoogleAuthProvider()
    provider.addScope('email')
    provider.addScope('profile')
    await signInWithPopup(auth, provider)
  }

  const signOut = async () => {
    await firebaseSignOut(auth)
  }

  const updateUserRegion = async (regionId: string): Promise<void> => {
    if (!user) throw new Error('No authenticated user')
    const userRef = doc(db, 'users', user.uid)
    await updateDoc(userRef, { regionId })
    setQuUser(prev => prev ? { ...prev, regionId } : prev)
  }

  return (
    <AuthContext.Provider value={{ user, quUser, loading, signInWithGoogle, signOut, updateUserRegion }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth must be used within AuthProvider')
  return context
}