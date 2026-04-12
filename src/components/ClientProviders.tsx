'use client'

import dynamic from 'next/dynamic'
import type { ReactNode } from 'react'

// ssr:false is valid here because this file is a client component.
// This prevents the Firebase import chain from running during SSG/SSR.
const AuthProvider = dynamic(
  () => import('@/context/AuthContext').then((m) => m.AuthProvider),
  { ssr: false }
)

const Header = dynamic(() => import('@/components/Header'), { ssr: false })

export function ClientProviders({ children }: { children: ReactNode }) {
  return (
    <AuthProvider>
      <Header />
      <main style={{ maxWidth: '1200px', margin: '0 auto', padding: '2rem' }}>
        {children}
      </main>
    </AuthProvider>
  )
}
