'use client'

import { useState, useEffect, useRef } from 'react'

export interface LocationData {
  city: string
  region: string
  country: string
  displayName: string
}

interface NominatimResult {
  display_name: string
  address: {
    city?: string
    town?: string
    village?: string
    municipality?: string
    county?: string
    state?: string
    province?: string
    country?: string
  }
}

interface ZipGateProps {
  onLocationSubmit: (location: LocationData) => void
}

export default function ZipGate({ onLocationSubmit }: ZipGateProps) {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<LocationData[]>([])
  const [loading, setLoading] = useState(false)
  const [nominatimFailed, setNominatimFailed] = useState(false)
  const [showDropdown, setShowDropdown] = useState(false)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    if (query.length < 3) {
      setResults([])
      setShowDropdown(false)
      return
    }

    if (debounceRef.current) clearTimeout(debounceRef.current)

    debounceRef.current = setTimeout(async () => {
      setLoading(true)
      try {
        const res = await fetch(
          `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&addressdetails=1&limit=5&featuretype=city`,
          {
            headers: {
              'Accept-Language': 'en',
              'User-Agent': 'QUCalendar/1.0 (qucalendar.org)',
            },
          }
        )
        if (!res.ok) throw new Error('Nominatim unavailable')
        const data: NominatimResult[] = await res.json()
        const mapped: LocationData[] = data.map(item => {
          const addr = item.address
          const city = addr.city || addr.town || addr.village || addr.municipality || addr.county || ''
          const region = addr.state || addr.province || ''
          const country = addr.country || ''
          const displayName = [city, region, country].filter(Boolean).join(', ')
          return { city, region, country, displayName }
        })
        setResults(mapped)
        setShowDropdown(true)
        setNominatimFailed(false)
      } catch {
        setNominatimFailed(true)
        setResults([])
        setShowDropdown(false)
      } finally {
        setLoading(false)
      }
    }, 300)

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current)
    }
  }, [query])

  const handleSelect = (loc: LocationData) => {
    setQuery(loc.displayName)
    setShowDropdown(false)
    onLocationSubmit(loc)
  }

  const handleManualSubmit = () => {
    if (!query.trim()) return
    onLocationSubmit({
      city: query.trim(),
      region: '',
      country: '',
      displayName: query.trim(),
    })
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && query.trim()) handleManualSubmit()
  }

  const showButton = query.trim().length >= 3
  const buttonLabel = nominatimFailed ? 'Continue' : "Let's Go"

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
          Enter your city to find queer events, spaces, and artists near you. No accounts. No tracking. No data kept. Just your community, right now.
        </p>

        {/* Search input + dropdown */}
        <div style={{ width: '100%', position: 'relative' }}>
          <div style={{ position: 'relative' }}>
            <input
              type="text"
              inputMode="text"
              placeholder="Your city or postal code"
              value={query}
              onChange={e => setQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              style={{
                width: '100%',
                padding: '14px 20px',
                paddingRight: loading ? '44px' : '20px',
                borderRadius: 12,
                border: '1px solid var(--border-glass)',
                background: 'rgba(255,255,255,0.05)',
                color: 'var(--text-primary)',
                fontFamily: "'Exo 2', sans-serif",
                fontSize: '1.1rem',
                outline: 'none',
                boxSizing: 'border-box',
              }}
            />
            {loading && (
              <span style={{
                position: 'absolute',
                right: '14px',
                top: '50%',
                transform: 'translateY(-50%)',
                color: 'var(--text-secondary)',
                fontSize: '0.75rem',
                opacity: 0.7,
              }}>
                ...
              </span>
            )}
          </div>

          {/* Dropdown results */}
          {showDropdown && (
            <div style={{
              position: 'absolute',
              top: 'calc(100% + 6px)',
              left: 0,
              right: 0,
              background: '#1e1e2e',
              border: '1px solid var(--border-glass)',
              borderRadius: 12,
              overflow: 'hidden',
              zIndex: 10,
              boxShadow: '0 8px 32px rgba(0,0,0,0.6)',
            }}>
              {results.length === 0 ? (
                <div style={{
                  padding: '12px 16px',
                  color: 'var(--text-secondary)',
                  fontFamily: "'Exo 2', sans-serif",
                  fontSize: '0.875rem',
                }}>
                  No results found — try a different search
                </div>
              ) : (
                results.map((loc, i) => (
                  <button
                    key={i}
                    onClick={() => handleSelect(loc)}
                    style={{
                      display: 'block',
                      width: '100%',
                      textAlign: 'left',
                      padding: '12px 16px',
                      background: 'transparent',
                      border: 'none',
                      borderBottom: i < results.length - 1 ? '1px solid var(--border-glass)' : 'none',
                      color: 'var(--text-primary)',
                      fontFamily: "'Exo 2', sans-serif",
                      fontSize: '0.9rem',
                      cursor: 'pointer',
                    }}
                    onMouseEnter={e => (e.currentTarget.style.background = 'rgba(117,7,135,0.2)')}
                    onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                  >
                    <span style={{ fontWeight: 600 }}>{loc.city}</span>
                    {loc.region && (
                      <span style={{ color: 'var(--text-secondary)', marginLeft: '0.4rem' }}>{loc.region}</span>
                    )}
                    {loc.country && (
                      <span style={{ color: 'var(--text-secondary)', marginLeft: '0.4rem', opacity: 0.7 }}>{loc.country}</span>
                    )}
                  </button>
                ))
              )}
            </div>
          )}
        </div>

        {/* Manual submit button — shown when user types without selecting from dropdown */}
        {showButton && (
          <button
            onClick={handleManualSubmit}
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
            {buttonLabel}
          </button>
        )}

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
