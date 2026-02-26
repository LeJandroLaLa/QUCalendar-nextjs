'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'

const ADMIN_EMAIL = process.env.NEXT_PUBLIC_ADMIN_EMAIL

interface ProtectedRouteProps {
  children: React.ReactNode
  adminOnly?: boolean
}

export default function ProtectedRoute({ children, adminOnly = false }: ProtectedRouteProps) {
  const { user, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (loading) return

    if (!user) {
      router.push('/signin')
      return
    }

    if (adminOnly && user.email !== ADMIN_EMAIL) {
      router.push('/')
    }
  }, [user, loading, adminOnly, router])

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '4rem 1rem' }}>
        <p style={{ color: 'var(--text-secondary)' }}>Loading...</p>
      </div>
    )
  }

  if (!user) return null
  if (adminOnly && user.email !== ADMIN_EMAIL) return null

  return <>{children}</>
}
