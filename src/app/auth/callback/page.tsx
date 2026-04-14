'use client'

import { useEffect, useState } from 'react'
import { isSignInWithEmailLink, signInWithEmailLink } from 'firebase/auth'
import { auth } from '@/lib/firebase'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function AuthCallbackPage() {
  const router = useRouter()
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)
  const [needsEmail, setNeedsEmail] = useState(false)
  const [confirmEmail, setConfirmEmail] = useState('')
  const [confirmLoading, setConfirmLoading] = useState(false)

  const completeSignIn = async (emailAddress: string) => {
    try {
      await signInWithEmailLink(auth, emailAddress, window.location.href)
      localStorage.removeItem('emailForSignIn')
      router.push('/dashboard')
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to complete sign in. The link may have expired.')
      setLoading(false)
    }
  }

  useEffect(() => {
    if (!isSignInWithEmailLink(auth, window.location.href)) {
      setError('Invalid sign-in link. Please request a new one.')
      setLoading(false)
      return
    }

    const stored = localStorage.getItem('emailForSignIn')
    if (stored) {
      completeSignIn(stored)
    } else {
      setNeedsEmail(true)
      setLoading(false)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const handleConfirm = async () => {
    if (!confirmEmail) return
    setConfirmLoading(true)
    await completeSignIn(confirmEmail)
    setConfirmLoading(false)
  }

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'var(--bg-dark)',
      padding: '2rem',
    }}>
      <div style={{
        background: 'var(--bg-card)',
        border: '1px solid var(--border-glass)',
        borderRadius: 20,
        padding: '3rem 2.5rem',
        maxWidth: 440,
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '1.25rem',
        textAlign: 'center',
      }}>
        {/* Pride stripe */}
        <div style={{
          width: '100%',
          height: 4,
          background: 'var(--gradient-pride)',
          borderRadius: 2,
        }} />

        {error ? (
          <>
            <h2 style={{
              fontFamily: "'Orbitron', sans-serif",
              fontSize: '1.3rem',
              color: 'var(--pride-red)',
              margin: 0,
            }}>
              Sign-In Error
            </h2>
            <p style={{
              fontFamily: "'Exo 2', sans-serif",
              color: 'var(--text-secondary)',
              fontSize: '0.95rem',
              margin: 0,
              lineHeight: 1.6,
            }}>
              {error}
            </p>
            <Link
              href="/partner"
              style={{
                fontFamily: "'Exo 2', sans-serif",
                fontSize: '0.9rem',
                color: 'var(--text-secondary)',
                textDecoration: 'none',
                opacity: 0.8,
              }}
            >
              ← Back to Sign In
            </Link>
          </>
        ) : loading ? (
          <>
            <h2 style={{
              fontFamily: "'Orbitron', sans-serif",
              fontSize: '1.3rem',
              color: 'var(--text-primary)',
              margin: 0,
            }}>
              Signing you in…
            </h2>
            <p style={{
              fontFamily: "'Exo 2', sans-serif",
              color: 'var(--text-secondary)',
              fontSize: '0.95rem',
              margin: 0,
            }}>
              Please wait a moment.
            </p>
          </>
        ) : needsEmail ? (
          <>
            <h2 style={{
              fontFamily: "'Orbitron', sans-serif",
              fontSize: '1.3rem',
              color: 'var(--text-primary)',
              margin: 0,
            }}>
              Confirm Your Email
            </h2>
            <p style={{
              fontFamily: "'Exo 2', sans-serif",
              color: 'var(--text-secondary)',
              fontSize: '0.95rem',
              margin: 0,
              lineHeight: 1.6,
            }}>
              Please enter the email you used to request the sign-in link.
            </p>
            <input
              type="email"
              value={confirmEmail}
              onChange={e => setConfirmEmail(e.target.value)}
              placeholder="your@email.com"
              style={{
                width: '100%',
                padding: '14px 16px',
                borderRadius: 12,
                border: '1px solid var(--border-glass)',
                background: 'rgba(255,255,255,0.05)',
                color: 'var(--text-primary)',
                fontFamily: "'Exo 2', sans-serif",
                fontSize: '1rem',
                outline: 'none',
                boxSizing: 'border-box',
              }}
            />
            <button
              onClick={handleConfirm}
              disabled={confirmLoading || !confirmEmail}
              style={{
                width: '100%',
                padding: '14px 20px',
                borderRadius: 12,
                border: '1px solid var(--border-glass)',
                background: 'rgba(255,255,255,0.05)',
                color: 'var(--text-primary)',
                fontFamily: "'Exo 2', sans-serif",
                fontSize: '1rem',
                fontWeight: 600,
                cursor: confirmLoading || !confirmEmail ? 'not-allowed' : 'pointer',
                opacity: confirmLoading || !confirmEmail ? 0.6 : 1,
                boxSizing: 'border-box',
              }}
            >
              {confirmLoading ? 'Signing in…' : 'Confirm & Sign In'}
            </button>
          </>
        ) : null}
      </div>
    </div>
  )
}
