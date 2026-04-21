'use client'

import { Suspense, useState, useEffect } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth'
import { doc, setDoc, Timestamp } from 'firebase/firestore'
import { auth, db } from '@/lib/firebase'
import { validateInvite, markInviteUsed } from '@/lib/invites'
import type { QUUser, QUInvite } from '@/lib/types'

function Field({
  label,
  error,
  children,
}: {
  label: string
  error?: string
  children: React.ReactNode
}) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem', width: '100%' }}>
      <label style={{
        fontFamily: "'Exo 2', sans-serif",
        fontSize: '0.85rem',
        fontWeight: 600,
        color: 'var(--text-secondary)',
      }}>
        {label}
      </label>
      {children}
      {error && (
        <span style={{
          fontFamily: "'Exo 2', sans-serif",
          fontSize: '0.8rem',
          color: 'var(--pride-red)',
        }}>
          {error}
        </span>
      )}
    </div>
  )
}

const inputStyle: React.CSSProperties = {
  width: '100%',
  padding: '12px 14px',
  borderRadius: 10,
  border: '1px solid var(--border-glass)',
  background: 'rgba(255,255,255,0.05)',
  color: 'var(--text-primary)',
  fontFamily: "'Exo 2', sans-serif",
  fontSize: '0.95rem',
  outline: 'none',
  boxSizing: 'border-box',
}

function RegisterInner() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const token = searchParams.get('token') ?? ''

  const [invite, setInvite] = useState<QUInvite | null>(null)
  const [tokenStatus, setTokenStatus] = useState<'loading' | 'valid' | 'invalid'>('loading')

  const [displayName, setDisplayName] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [phone, setPhone] = useState('')

  const [errors, setErrors] = useState<Record<string, string>>({})
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState('')

  useEffect(() => {
    async function checkToken() {
      if (!token) {
        setTokenStatus('invalid')
        return
      }
      const result = await validateInvite(token)
      if (result) {
        setInvite(result)
        setTokenStatus('valid')
      } else {
        setTokenStatus('invalid')
      }
    }
    checkToken()
  }, [token])

  function validate(): Record<string, string> {
    const errs: Record<string, string> = {}
    if (!displayName.trim()) errs.displayName = 'Display name is required.'
    if (password.length < 8) errs.password = 'Password must be at least 8 characters.'
    if (password !== confirmPassword) errs.confirmPassword = 'Passwords do not match.'
    return errs
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSubmitError('')
    const errs = validate()
    if (Object.keys(errs).length > 0) {
      setErrors(errs)
      return
    }
    setErrors({})
    setSubmitting(true)
    try {
      const { user } = await createUserWithEmailAndPassword(auth, invite!.email, password)
      await updateProfile(user, { displayName: displayName.trim() })

      const roleToRoles: Record<QUInvite['role'], QUUser['roles']> = {
        artist: ['artist'],
        space: ['space'],
        moderator: ['admin'],
        superadmin: ['superadmin'],
      }

      const userDoc: QUUser = {
        userId: user.uid,
        displayName: displayName.trim(),
        email: invite!.email,
        roles: roleToRoles[invite!.role],
        regionId: invite!.regionId,
        isProfilePublic: false,
        createdAt: Timestamp.now(),
      }

      const trustFields = invite!.role === 'artist'
        ? { trustScore: 0, vouchesReceived: 0, vouchesGiven: 0, moderatorEligible: false }
        : {}

      const firestoreData = {
        ...userDoc,
        ...trustFields,
        ...(phone.trim() ? { phone: phone.trim() } : {}),
      }

      await setDoc(doc(db, 'users', user.uid), firestoreData)
      await markInviteUsed(token, user.uid)
      router.push('/dashboard')
    } catch (err: unknown) {
      setSubmitError(err instanceof Error ? err.message : 'Registration failed. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  if (tokenStatus === 'loading') {
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
          <div style={{
            width: '100%',
            height: 4,
            background: 'var(--gradient-pride)',
            borderRadius: 2,
          }} />
          <p style={{
            fontFamily: "'Exo 2', sans-serif",
            color: 'var(--text-secondary)',
            fontSize: '0.95rem',
            margin: 0,
          }}>
            Validating invite…
          </p>
        </div>
      </div>
    )
  }

  if (tokenStatus === 'invalid') {
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
          <div style={{
            width: '100%',
            height: 4,
            background: 'var(--gradient-pride)',
            borderRadius: 2,
          }} />
          <h2 style={{
            fontFamily: "'Orbitron', sans-serif",
            fontSize: 'clamp(1.2rem, 4vw, 1.6rem)',
            color: 'var(--text-primary)',
            textAlign: 'center',
            margin: 0,
          }}>
            Invalid Invite
          </h2>
          <p style={{
            fontFamily: "'Exo 2', sans-serif",
            color: 'var(--text-secondary)',
            lineHeight: 1.6,
            textAlign: 'center',
            margin: 0,
            fontSize: '0.95rem',
          }}>
            This invite link is invalid or has already been used.
          </p>
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

        <div style={{
          width: '100%',
          height: 4,
          background: 'var(--gradient-pride)',
          borderRadius: 2,
        }} />

        <h2 style={{
          fontFamily: "'Orbitron', sans-serif",
          fontSize: 'clamp(1.4rem, 4vw, 1.9rem)',
          color: 'var(--text-primary)',
          textAlign: 'center',
          margin: 0,
        }}>
          Create Account
        </h2>

        <p style={{
          fontFamily: "'Exo 2', sans-serif",
          color: 'var(--text-secondary)',
          lineHeight: 1.6,
          textAlign: 'center',
          margin: 0,
          fontSize: '0.95rem',
        }}>
          {"You've been invited to join the QU Calendar community."}
        </p>

        {submitError && (
          <p style={{
            color: 'var(--pride-red)',
            fontFamily: "'Exo 2', sans-serif",
            fontSize: '0.85rem',
            textAlign: 'center',
            margin: 0,
          }}>
            {submitError}
          </p>
        )}

        <form
          onSubmit={handleSubmit}
          style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '1rem' }}
          noValidate
        >
          <Field label="Display Name" error={errors.displayName}>
            <input
              type="text"
              value={displayName}
              onChange={e => setDisplayName(e.target.value)}
              placeholder="Your name or stage name"
              required
              style={inputStyle}
            />
          </Field>

          <Field label="Email">
            <input
              type="email"
              value={invite?.email ?? ''}
              readOnly
              style={{ ...inputStyle, opacity: 0.6, cursor: 'not-allowed' }}
            />
          </Field>

          <Field label="Password" error={errors.password}>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="At least 8 characters"
              required
              style={inputStyle}
            />
          </Field>

          <Field label="Confirm Password" error={errors.confirmPassword}>
            <input
              type="password"
              value={confirmPassword}
              onChange={e => setConfirmPassword(e.target.value)}
              placeholder="Repeat your password"
              required
              style={inputStyle}
            />
          </Field>

          <Field label="For account recovery — optional">
            <input
              type="tel"
              value={phone}
              onChange={e => setPhone(e.target.value)}
              placeholder="+1 (555) 000-0000"
              style={inputStyle}
            />
          </Field>

          <button
            type="submit"
            disabled={submitting}
            style={{
              width: '100%',
              padding: '14px 20px',
              borderRadius: 12,
              border: 'none',
              background: submitting ? 'rgba(255,255,255,0.1)' : 'var(--gradient-pride)',
              color: '#fff',
              fontFamily: "'Exo 2', sans-serif",
              fontSize: '1rem',
              fontWeight: 600,
              cursor: submitting ? 'not-allowed' : 'pointer',
              opacity: submitting ? 0.7 : 1,
              transition: 'opacity 0.2s',
              marginTop: '0.25rem',
            }}
          >
            {submitting ? 'Creating Account…' : 'Create Account'}
          </button>
        </form>

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

export default function RegisterPage() {
  return (
    <Suspense fallback={
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'var(--bg-dark)',
      }} />
    }>
      <RegisterInner />
    </Suspense>
  )
}
