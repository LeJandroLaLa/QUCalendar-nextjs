'use client'

import { useState } from 'react'

interface ZipGateProps {
  onZipSubmit: (zip: string) => void
}

export default function ZipGate({ onZipSubmit }: ZipGateProps) {
  const [zip, setZip] = useState('')
  const [error, setError] = useState(false)

  const handleSubmit = () => {
    if (!/^\d{5}$/.test(zip)) {
      setError(true)
      return
    }
    setError(false)
    onZipSubmit(zip)
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') handleSubmit()
  }

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100%',
      height: '100%',
      zIndex: 1000,
      background: 'rgba(10,10,15,0.97)',
      backdropFilter: 'blur(12px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    }}>
      <div style={{
        background: 'var(--bg-card)',
        border: '1px solid var(--border-glass)',
        borderRadius: 20,
        padding: '3rem 2.5rem',
        maxWidth: 440,
        width: '90%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '1.25rem',
      }}>
        {/* Wordmark */}
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
          fontSize: 'clamp(1.8rem, 4vw, 2.5rem)',
          color: 'var(--text-primary)',
          textAlign: 'center',
          margin: 0,
        }}>
          Find Your Pulse.
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
          Enter your zip code to find queer events, spaces, and artists near you. No accounts. No tracking. No data kept. Just your community, right now.
        </p>

        {/* Zip input */}
        <div style={{ width: '100%' }}>
          <input
            type="number"
            inputMode="numeric"
            maxLength={5}
            placeholder="Enter zip code"
            value={zip}
            onChange={e => {
              const val = e.target.value.replace(/\D/g, '').slice(0, 5)
              setZip(val)
              if (error) setError(false)
            }}
            onKeyDown={handleKeyDown}
            style={{
              width: '100%',
              padding: '14px 20px',
              borderRadius: 12,
              border: `1px solid ${error ? 'var(--pride-red)' : 'var(--border-glass)'}`,
              background: 'rgba(255,255,255,0.05)',
              color: 'var(--text-primary)',
              fontFamily: "'Exo 2', sans-serif",
              fontSize: '1.2rem',
              textAlign: 'center',
              letterSpacing: '4px',
              outline: 'none',
              boxSizing: 'border-box',
              appearance: 'textfield',
            }}
          />
          {error && (
            <p style={{
              color: 'var(--pride-red)',
              fontFamily: "'Exo 2', sans-serif",
              fontSize: '0.85rem',
              marginTop: '0.4rem',
              textAlign: 'center',
            }}>
              Please enter a valid 5-digit zip code
            </p>
          )}
        </div>

        {/* Submit button */}
        <button
          onClick={handleSubmit}
          style={{
            width: '100%',
            padding: '14px 24px',
            borderRadius: 30,
            border: 'none',
            background: 'var(--gradient-pride)',
            color: '#fff',
            fontFamily: "'Orbitron', sans-serif",
            fontSize: '1rem',
            fontWeight: 700,
            cursor: 'pointer',
            letterSpacing: '1px',
          }}
        >
          Let's Go
        </button>

        {/* Small print */}
        <p style={{
          fontFamily: "'Exo 2', sans-serif",
          fontSize: '0.75rem',
          color: 'var(--text-secondary)',
          opacity: 0.6,
          textAlign: 'center',
          margin: 0,
        }}>
          QU Calendar is 100% cookieless. Your location is never stored or tracked.
        </p>
      </div>
    </div>
  )
}
