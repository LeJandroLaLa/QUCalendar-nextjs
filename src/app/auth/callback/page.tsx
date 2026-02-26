'use client'

import { useEffect, useState } from 'react'
import { isSignInWithEmailLink, signInWithEmailLink } from 'firebase/auth'
import { auth } from '@/lib/firebase'
import { useRouter } from 'next/navigation'

export default function AuthCallbackPage() {
  const router = useRouter()
  const [error, setError] = useState('')
  const [status, setStatus] = useState('Completing sign in...')

  useEffect(() => {
    const completeSignIn = async () => {
      if (!isSignInWithEmailLink(auth, window.location.href)) {
        setError('Invalid sign in link. Please request a new one.')
        return
      }

      let email = localStorage.getItem('emailForSignIn')
      if (!email) {
        email = window.prompt('Please provide your email for confirmation')
      }

      if (!email) {
        setError('Email is required to complete sign in.')
        return
      }

      try {
        await signInWithEmailLink(auth, email, window.location.href)
        localStorage.removeItem('emailForSignIn')
        setStatus('Sign in successful! Redirecting...')
        router.push('/')
      } catch (err) {
        console.error('Error completing sign in:', err)
        setError(err instanceof Error ? err.message : 'Failed to complete sign in. The link may have expired.')
      }
    }

    completeSignIn()
  }, [router])

  return (
    <div style={{ maxWidth: '480px', margin: '4rem auto', textAlign: 'center', padding: '0 1rem' }}>
      {error ? (
        <div style={{
          background: 'rgba(255, 0, 24, 0.1)',
          border: '1px solid var(--pride-red)',
          borderRadius: '12px',
          padding: '2rem',
        }}>
          <h2 style={{
            fontFamily: "'Orbitron', sans-serif",
            fontSize: '1.2rem',
            color: 'var(--pride-red)',
            marginBottom: '1rem',
          }}>
            Sign In Error
          </h2>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>{error}</p>
          <a
            href="/signin"
            style={{
              display: 'inline-block',
              padding: '0.75rem 1.5rem',
              borderRadius: '8px',
              background: 'var(--pride-violet)',
              color: '#fff',
              textDecoration: 'none',
              fontFamily: "'Exo 2', sans-serif",
              fontWeight: 600,
            }}
          >
            Back to Sign In
          </a>
        </div>
      ) : (
        <div className="glass-card" style={{ padding: '2rem' }}>
          <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem' }}>{status}</p>
        </div>
      )}
    </div>
  )
}
