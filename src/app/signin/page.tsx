'use client'

import { useState } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { useRouter } from 'next/navigation'

export default function SignInPage() {
  const { user, signInWithGoogle, signInWithMagicLink } = useAuth()
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [magicLinkSent, setMagicLinkSent] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  // Redirect if already signed in
  if (user) {
    router.push('/')
    return null
  }

  const handleGoogle = async () => {
    setError('')
    setLoading(true)
    try {
      await signInWithGoogle()
      router.push('/')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to sign in with Google')
    } finally {
      setLoading(false)
    }
  }

  const handleMagicLink = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email) return
    setError('')
    setLoading(true)
    try {
      await signInWithMagicLink(email)
      setMagicLinkSent(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to send magic link')
    } finally {
      setLoading(false)
    }
  }

  const cardStyle: React.CSSProperties = {
    background: 'var(--bg-card)',
    border: '1px solid var(--border-glass)',
    backdropFilter: 'blur(10px)',
    borderRadius: '12px',
    padding: '2rem',
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem',
  }

  const buttonStyle: React.CSSProperties = {
    padding: '0.75rem 1.5rem',
    borderRadius: '8px',
    border: 'none',
    fontFamily: "'Exo 2', sans-serif",
    fontSize: '1rem',
    fontWeight: 600,
    cursor: 'pointer',
    transition: 'opacity 0.2s',
  }

  const disclaimerStyle: React.CSSProperties = {
    fontSize: '0.75rem',
    color: 'var(--text-secondary)',
    marginTop: '0.5rem',
    lineHeight: 1.4,
  }

  return (
    <div style={{ maxWidth: '480px', margin: '2rem auto', padding: '0 1rem' }}>
      <h2 style={{
        fontFamily: "'Orbitron', sans-serif",
        fontSize: '1.5rem',
        textAlign: 'center',
        marginBottom: '2rem',
      }} className="pride-gradient-text">
        Sign In
      </h2>

      {error && (
        <div style={{
          background: 'rgba(255, 0, 24, 0.1)',
          border: '1px solid var(--pride-red)',
          borderRadius: '8px',
          padding: '0.75rem 1rem',
          marginBottom: '1.5rem',
          color: 'var(--pride-red)',
          fontSize: '0.9rem',
        }}>
          {error}
        </div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        {/* Google OAuth */}
        <div style={cardStyle}>
          <h3 style={{ fontFamily: "'Orbitron', sans-serif", fontSize: '1rem', color: 'var(--text-primary)' }}>
            Google
          </h3>
          <button
            onClick={handleGoogle}
            disabled={loading}
            style={{
              ...buttonStyle,
              background: '#4285F4',
              color: '#fff',
              opacity: loading ? 0.6 : 1,
            }}
          >
            {loading ? 'Signing in...' : 'Sign in with Google'}
          </button>
          <p style={disclaimerStyle}>
            By signing in with Google, you agree to share your email and profile information with QU Calendar.
          </p>
        </div>

        {/* Email Magic Link */}
        <div style={cardStyle}>
          <h3 style={{ fontFamily: "'Orbitron', sans-serif", fontSize: '1rem', color: 'var(--text-primary)' }}>
            Email Magic Link
          </h3>
          {magicLinkSent ? (
            <div style={{
              textAlign: 'center',
              padding: '1rem',
              color: 'var(--pride-green)',
              fontSize: '0.95rem',
            }}>
              Check your email for a sign in link
            </div>
          ) : (
            <form onSubmit={handleMagicLink} style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <input
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                style={{
                  padding: '0.75rem 1rem',
                  borderRadius: '8px',
                  border: '1px solid var(--border-glass)',
                  background: 'rgba(255, 255, 255, 0.05)',
                  color: 'var(--text-primary)',
                  fontFamily: "'Exo 2', sans-serif",
                  fontSize: '1rem',
                  outline: 'none',
                }}
              />
              <button
                type="submit"
                disabled={loading || !email}
                style={{
                  ...buttonStyle,
                  background: 'var(--pride-violet)',
                  color: '#fff',
                  opacity: loading || !email ? 0.6 : 1,
                }}
              >
                {loading ? 'Sending...' : 'Send Magic Link'}
              </button>
            </form>
          )}
          <p style={disclaimerStyle}>
            We&apos;ll send a one-time sign in link to your email. No password needed.
          </p>
        </div>

        {/* Apple (disabled placeholder) */}
        <div style={{ ...cardStyle, opacity: 0.5 }}>
          <h3 style={{ fontFamily: "'Orbitron', sans-serif", fontSize: '1rem', color: 'var(--text-primary)' }}>
            Apple
          </h3>
          <button
            disabled
            style={{
              ...buttonStyle,
              background: '#000',
              color: '#fff',
              cursor: 'not-allowed',
              opacity: 0.5,
            }}
          >
            Sign in with Apple (Coming Soon)
          </button>
          <p style={disclaimerStyle}>
            Apple Sign In will be available in a future update.
          </p>
        </div>
      </div>
    </div>
  )
}
