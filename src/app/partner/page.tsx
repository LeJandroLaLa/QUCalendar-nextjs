'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  signInWithPopup,
  signInWithEmailAndPassword,
  sendPasswordResetEmail,
  GoogleAuthProvider,
} from 'firebase/auth'
import { auth } from '@/lib/firebase'

function getEmailErrorMessage(code: string): string {
  switch (code) {
    case 'auth/user-not-found':
      return 'No account found with this email.'
    case 'auth/wrong-password':
      return 'Incorrect password. Please try again.'
    case 'auth/invalid-credential':
      return 'Incorrect email or password.'
    case 'auth/invalid-email':
      return 'Please enter a valid email address.'
    case 'auth/too-many-requests':
      return 'Too many failed attempts. Please try again later.'
    default:
      return 'Sign-in failed. Please try again.'
  }
}

export default function PartnerLoginPage() {
  const router = useRouter()
  const [error, setError] = useState('')
  const [loadingGoogle, setLoadingGoogle] = useState(false)
  const [googleHovered, setGoogleHovered] = useState(false)

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [emailError, setEmailError] = useState('')
  const [resetMessage, setResetMessage] = useState('')
  const [loadingEmail, setLoadingEmail] = useState(false)
  const [signInHovered, setSignInHovered] = useState(false)

  const handleGoogleSignIn = async () => {
    setError('')
    setLoadingGoogle(true)
    try {
      const provider = new GoogleAuthProvider()
      await signInWithPopup(auth, provider)
      router.push('/dashboard')
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Google sign-in failed. Please try again.')
    } finally {
      setLoadingGoogle(false)
    }
  }

  const handleEmailSignIn = async () => {
    setEmailError('')
    setResetMessage('')
    if (!email || !password) {
      setEmailError('Please enter your email and password.')
      return
    }
    setLoadingEmail(true)
    try {
      await signInWithEmailAndPassword(auth, email, password)
      router.push('/dashboard')
    } catch (err: unknown) {
      const code = (err as { code?: string }).code ?? ''
      setEmailError(getEmailErrorMessage(code))
    } finally {
      setLoadingEmail(false)
    }
  }

  const handleForgotPassword = async () => {
    setEmailError('')
    setResetMessage('')
    if (!email) {
      setEmailError('Enter your email above to reset your password.')
      return
    }
    try {
      await sendPasswordResetEmail(auth, email)
      setResetMessage('Password reset email sent. Check your inbox.')
    } catch (err: unknown) {
      const code = (err as { code?: string }).code ?? ''
      if (code === 'auth/user-not-found') {
        setEmailError('No account found with this email.')
      } else if (code === 'auth/invalid-email') {
        setEmailError('Please enter a valid email address.')
      } else {
        setEmailError('Could not send reset email. Please try again.')
      }
    }
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
      }}>
        {/* Wordmark */}
        <Link href="/" style={{ textDecoration: 'none' }}>
          <h1
            className="pride-gradient-text"
            style={{
              fontFamily: "'Orbitron', sans-serif",
              fontSize: '1.6rem',
              fontWeight: 700,
              letterSpacing: '1px',
              textTransform: 'uppercase',
              margin: 0,
            }}
          >
            QU Calendar
          </h1>
        </Link>

        {/* Pride stripe */}
        <div style={{
          width: '100%',
          height: 4,
          background: 'var(--gradient-pride)',
          borderRadius: 2,
        }} />

        {/* Heading */}
        <h2 style={{
          fontFamily: "'Orbitron', sans-serif",
          fontSize: 'clamp(1.4rem, 4vw, 1.9rem)',
          color: 'var(--text-primary)',
          textAlign: 'center',
          margin: 0,
        }}>
          Partner Login
        </h2>

        {/* Subtext */}
        <p style={{
          fontFamily: "'Exo 2', sans-serif",
          color: 'var(--text-secondary)',
          lineHeight: 1.6,
          textAlign: 'center',
          margin: 0,
          fontSize: '0.95rem',
        }}>
          Artists, space managers, and administrators sign in here.
        </p>

        {/* Error */}
        {error && (
          <p style={{
            color: 'var(--pride-red)',
            fontFamily: "'Exo 2', sans-serif",
            fontSize: '0.85rem',
            textAlign: 'center',
            margin: 0,
          }}>
            {error}
          </p>
        )}

        {/* Google sign in */}
        <button
          onClick={handleGoogleSignIn}
          disabled={loadingGoogle}
          onMouseEnter={() => setGoogleHovered(true)}
          onMouseLeave={() => setGoogleHovered(false)}
          style={{
            width: '100%',
            padding: '14px 20px',
            borderRadius: 12,
            border: '1px solid var(--border-glass)',
            background: googleHovered ? 'rgba(255,255,255,0.1)' : 'rgba(255,255,255,0.05)',
            color: 'var(--text-primary)',
            fontFamily: "'Exo 2', sans-serif",
            fontSize: '1rem',
            fontWeight: 600,
            cursor: loadingGoogle ? 'not-allowed' : 'pointer',
            opacity: loadingGoogle ? 0.7 : 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.6rem',
            transition: 'background 0.2s',
            boxSizing: 'border-box',
          }}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
          </svg>
          {loadingGoogle ? 'Signing in…' : 'Continue with Google'}
        </button>

        {/* Apple sign-in — coming soon */}
        <button
          disabled
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
            cursor: 'not-allowed',
            opacity: 0.5,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.6rem',
            boxSizing: 'border-box',
          }}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
            <path d="M12.152 6.896c-.948 0-2.415-1.078-3.96-1.04-2.04.027-3.91 1.183-4.961 3.014-2.117 3.675-.54 9.103 1.519 12.09 1.013 1.454 2.208 3.09 3.792 3.039 1.52-.065 2.09-.987 3.935-.987 1.831 0 2.35.987 3.96.948 1.637-.026 2.676-1.48 3.676-2.948 1.156-1.688 1.636-3.325 1.662-3.415-.039-.013-3.182-1.221-3.22-4.857-.026-3.04 2.48-4.494 2.597-4.559-1.429-2.09-3.623-2.324-4.39-2.376-2-.156-3.675 1.09-4.61 1.09zM15.53 3.83c.843-1.012 1.4-2.427 1.245-3.83-1.207.052-2.662.805-3.532 1.818-.78.896-1.454 2.338-1.273 3.714 1.338.104 2.715-.688 3.559-1.701z"/>
          </svg>
          Continue with Apple — Coming Soon
        </button>

        {/* Divider */}
        <div style={{
          width: '100%',
          display: 'flex',
          alignItems: 'center',
          gap: '0.75rem',
        }}>
          <div style={{ flex: 1, height: 1, background: 'var(--border-glass)' }} />
          <span style={{
            fontFamily: "'Exo 2', sans-serif",
            fontSize: '0.8rem',
            color: 'var(--text-secondary)',
            opacity: 0.6,
          }}>
            or
          </span>
          <div style={{ flex: 1, height: 1, background: 'var(--border-glass)' }} />
        </div>

        {/* Email input */}
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e: { target: { value: string } }) => setEmail(e.target.value)}
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

        {/* Password input */}
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e: { target: { value: string } }) => setPassword(e.target.value)}
          onKeyDown={(e: { key: string }) => e.key === 'Enter' && handleEmailSignIn()}
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

        {/* Forgot password */}
        <div style={{ width: '100%', textAlign: 'right', marginTop: '-0.5rem' }}>
          <button
            onClick={handleForgotPassword}
            style={{
              background: 'none',
              border: 'none',
              padding: 0,
              color: 'var(--text-secondary)',
              fontFamily: "'Exo 2', sans-serif",
              fontSize: '0.8rem',
              cursor: 'pointer',
              opacity: 0.75,
              textDecoration: 'underline',
            }}
          >
            Forgot password?
          </button>
        </div>

        {/* Email error */}
        {emailError && (
          <p style={{
            color: 'var(--pride-red)',
            fontFamily: "'Exo 2', sans-serif",
            fontSize: '0.85rem',
            textAlign: 'center',
            margin: 0,
            width: '100%',
          }}>
            {emailError}
          </p>
        )}

        {/* Reset confirmation */}
        {resetMessage && (
          <p style={{
            color: 'var(--text-secondary)',
            fontFamily: "'Exo 2', sans-serif",
            fontSize: '0.85rem',
            textAlign: 'center',
            margin: 0,
            width: '100%',
          }}>
            {resetMessage}
          </p>
        )}

        {/* Sign In button */}
        <button
          onClick={handleEmailSignIn}
          disabled={loadingEmail}
          onMouseEnter={() => setSignInHovered(true)}
          onMouseLeave={() => setSignInHovered(false)}
          style={{
            width: '100%',
            padding: '14px 20px',
            borderRadius: 12,
            border: '1px solid var(--border-glass)',
            background: signInHovered && !loadingEmail
              ? 'rgba(255,255,255,0.15)'
              : 'rgba(255,255,255,0.08)',
            color: 'var(--text-primary)',
            fontFamily: "'Exo 2', sans-serif",
            fontSize: '1rem',
            fontWeight: 600,
            cursor: loadingEmail ? 'not-allowed' : 'pointer',
            opacity: loadingEmail ? 0.7 : 1,
            transition: 'background 0.2s',
            boxSizing: 'border-box',
          }}
        >
          {loadingEmail ? 'Signing in…' : 'Sign In'}
        </button>

        {/* Back link */}
        <Link
          href="/"
          style={{
            fontFamily: "'Exo 2', sans-serif",
            fontSize: '0.85rem',
            color: 'var(--text-secondary)',
            textDecoration: 'none',
            opacity: 0.7,
            marginTop: '0.25rem',
          }}
        >
          ← Back to Calendar
        </Link>
      </div>
    </div>
  )
}
