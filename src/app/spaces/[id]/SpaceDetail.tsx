'use client'

import { useEffect, useState } from 'react'
import { doc, getDoc, collection, query, where, getDocs, limit } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { Space, QUEvent } from '@/lib/types'
import EventCard from '@/components/EventCard'
import Link from 'next/link'

export default function SpaceDetail({ id }: { id: string }) {
  const [space, setSpace] = useState<Space | null>(null)
  const [events, setEvents] = useState<QUEvent[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [braveSpaceBadgeHovered, setBraveSpaceBadgeHovered] = useState(false)

  useEffect(() => {
    const fetchSpace = async () => {
      try {
        const docRef = doc(db, 'spaces', id)
        const snap = await getDoc(docRef)
        if (snap.exists()) {
          setSpace({ id: snap.id, ...snap.data() } as Space)

          // Fetch upcoming events at this space
          const evQ = query(
            collection(db, 'events'),
            where('status', '==', 'approved'),
            where('venueId', '==', id),
            limit(8)
          )
          const evSnap = await getDocs(evQ)
          setEvents(evSnap.docs.map((d) => ({ id: d.id, ...d.data() }) as QUEvent))
        } else {
          setError('Space not found')
        }
      } catch (err) {
        console.error('Error fetching space:', err)
        setError('Failed to load space')
      } finally {
        setLoading(false)
      }
    }
    if (id) fetchSpace()
  }, [id])

  if (loading) {
    return <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-secondary)' }}>Loading space...</div>
  }

  if (error || !space) {
    return (
      <div style={{ textAlign: 'center', padding: '3rem' }}>
        <p style={{ color: 'var(--pride-red)', marginBottom: '1rem' }}>{error || 'Space not found'}</p>
        <Link href="/spaces" style={{ color: 'var(--pride-violet)', textDecoration: 'none' }}>← Back to Spaces</Link>
      </div>
    )
  }

  return (
    <div style={{ fontFamily: "'Exo 2', sans-serif" }}>

      {/* Banner */}
      <div style={{
        width: '100%',
        height: '280px',
        position: 'relative',
        background: 'linear-gradient(135deg, rgba(36,64,142,0.5), rgba(115,41,130,0.4), rgba(0,128,38,0.3))',
        overflow: 'hidden',
      }}>
        {space.imageUrl && (
          <div style={{
            position: 'absolute',
            inset: 0,
            backgroundImage: `url(${space.imageUrl})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }} />
        )}

        {/* Pride stripe */}
        <div style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          height: '4px',
          background: 'var(--gradient-pride)',
        }} />

        {/* Space type badge */}
        <div style={{
          position: 'absolute',
          top: '1rem',
          right: '1rem',
          fontFamily: "'Orbitron', sans-serif",
          fontSize: '0.7rem',
          textTransform: 'uppercase',
          background: 'rgba(0,0,0,0.6)',
          backdropFilter: 'blur(5px)',
          border: '1px solid rgba(255,255,255,0.3)',
          borderRadius: '20px',
          padding: '6px 16px',
          color: '#fff',
          letterSpacing: '0.1em',
        }}>
          Space
        </div>

        {/* Brave Space SVG badge */}
        {space.braveSpace?.status === 'certified' && (
          <div style={{ position: 'absolute', top: '1rem', left: '1rem' }}>
            <svg width="64" height="64" viewBox="0 0 180 180" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <linearGradient id="braveGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#5C3317" />
                  <stop offset="20%" stopColor="#E40303" />
                  <stop offset="40%" stopColor="#008026" />
                  <stop offset="60%" stopColor="#24408E" />
                  <stop offset="80%" stopColor="#732982" />
                  <stop offset="100%" stopColor="#111111" />
                </linearGradient>
              </defs>
              <path
                d="M90,8 L103,62 L155,48 L117,88 L155,128 L103,118 L90,172 L77,118 L25,128 L63,88 L25,48 L77,62 Z"
                fill="url(#braveGrad)"
                stroke="white"
                strokeWidth="3"
              />
              <text x="90" y="82" textAnchor="middle" fontFamily="'Orbitron', sans-serif" fontSize="24" fill="white" fontWeight="bold">BRAVE</text>
              <text x="90" y="112" textAnchor="middle" fontFamily="'Orbitron', sans-serif" fontSize="24" fill="white" fontWeight="bold">SPACE</text>
            </svg>
          </div>
        )}
      </div>

      {/* Header card */}
      <div style={{
        background: 'var(--bg-card)',
        border: '1px solid var(--border-glass)',
        backdropFilter: 'blur(10px)',
        borderRadius: '0 0 20px 20px',
        borderTop: 'none',
        padding: '0 2rem 2rem',
        marginBottom: '2rem',
      }}>
        {/* Avatar */}
        <div style={{
          width: '120px',
          height: '120px',
          borderRadius: '16px',
          marginTop: '-60px',
          border: '3px solid rgba(255,255,255,0.4)',
          boxShadow: '0 6px 16px rgba(0,0,0,0.4)',
          background: 'linear-gradient(135deg, rgba(36,64,142,0.8), rgba(115,41,130,0.8))',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '3rem',
          marginBottom: '1rem',
        }}>
          {space.type ? (({
            'Restaurant': '🍽️',
            'Theatre': '🎭',
            'Events Space': '🎪',
            'Bar': '🍺',
            'Night Club': '🌟',
            'Park / Public Space': '🌳',
            'Community Center': '🤝',
            'Gallery / Museum': '🎨',
            'Private Venue': '🏛️',
          } as Record<string, string>)[space.type] || '🏛️') : '🏛️'}
        </div>

        <h2 style={{
          fontFamily: "'Orbitron', sans-serif",
          fontSize: '1.8rem',
          marginBottom: '0.5rem',
        }} className="pride-gradient-text">
          {space.name}
        </h2>

        {space.description && (
          <p style={{
            color: 'var(--text-secondary)',
            marginBottom: '1rem',
            lineHeight: 1.6,
            fontFamily: "'Exo 2', sans-serif",
          }}>
            {space.description.slice(0, 120)}{space.description.length > 120 ? '…' : ''}
          </p>
        )}

        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', alignItems: 'center' }}>
          {space.type && (
            <span style={{
              padding: '0.3rem 0.8rem',
              borderRadius: '999px',
              background: 'rgba(117,7,135,0.2)',
              fontSize: '0.75rem',
              color: 'var(--accent)',
              fontFamily: "'Orbitron', sans-serif",
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
            }}>
              {space.type}
            </span>
          )}
          {space.braveSpace?.status === 'certified' && (
            <div style={{ position: 'relative', display: 'inline-flex' }}>
              <span
                onMouseEnter={() => setBraveSpaceBadgeHovered(true)}
                onMouseLeave={() => setBraveSpaceBadgeHovered(false)}
                style={{
                  padding: '0.3rem 0.8rem',
                  borderRadius: '999px',
                  background: 'var(--gradient-pride)',
                  fontSize: '0.75rem',
                  color: '#fff',
                  fontFamily: "'Orbitron', sans-serif",
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                  cursor: 'default',
                  userSelect: 'none',
                }}
              >
                Brave Space
              </span>
              {braveSpaceBadgeHovered && (
                <div style={{
                  position: 'absolute',
                  bottom: 'calc(100% + 8px)',
                  left: '50%',
                  transform: 'translateX(-50%)',
                  background: 'rgba(18, 18, 18, 0.96)',
                  border: '1px solid var(--border-glass)',
                  borderRadius: '10px',
                  padding: '0.75rem 1rem',
                  width: '280px',
                  fontSize: '0.8rem',
                  color: 'var(--text-secondary)',
                  fontFamily: "'Exo 2', sans-serif",
                  lineHeight: 1.6,
                  zIndex: 50,
                  backdropFilter: 'blur(10px)',
                  boxShadow: '0 4px 20px rgba(0,0,0,0.5)',
                  pointerEvents: 'none',
                }}>
                  This Space has committed to QUCalendar&apos;s standards for community safety, accessibility transparency, and zero-tolerance policies against bigotry.
                </div>
              )}
            </div>
          )}
          {space.website && (
            <a
              href={space.website}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                padding: '0.3rem 0.8rem',
                borderRadius: '999px',
                background: 'rgba(255,255,255,0.08)',
                border: '1px solid rgba(255,255,255,0.15)',
                color: 'var(--text-secondary)',
                textDecoration: 'none',
                fontSize: '0.8rem',
                fontFamily: "'Exo 2', sans-serif",
              }}
            >
              🌐 Website
            </a>
          )}
          {space.phone && (
            <a
              href={`tel:${space.phone}`}
              style={{
                padding: '0.3rem 0.8rem',
                borderRadius: '999px',
                background: 'rgba(255,255,255,0.08)',
                border: '1px solid rgba(255,255,255,0.15)',
                color: 'var(--text-secondary)',
                textDecoration: 'none',
                fontSize: '0.8rem',
                fontFamily: "'Exo 2', sans-serif",
              }}
            >
              📞 {space.phone}
            </a>
          )}
        </div>
      </div>

      {/* Details grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
        gap: '1.5rem',
        marginBottom: '2rem',
      }}>
        {/* About card — full width */}
        {space.description && (
          <div style={{
            background: 'var(--bg-card)',
            border: '1px solid var(--border-glass)',
            backdropFilter: 'blur(10px)',
            borderRadius: '20px',
            padding: '1.5rem',
            gridColumn: '1 / -1',
          }}>
            <h3 style={{ fontFamily: "'Orbitron', sans-serif", fontSize: '0.9rem', marginBottom: '0.75rem', color: 'var(--text-primary)', letterSpacing: '0.05em' }}>
              About
            </h3>
            <p style={{ color: 'var(--text-secondary)', lineHeight: 1.7, whiteSpace: 'pre-wrap', fontFamily: "'Exo 2', sans-serif" }}>
              {space.description}
            </p>
          </div>
        )}

        {/* Location card */}
        {space.address && (
          <div style={{
            background: 'var(--bg-card)',
            border: '1px solid var(--border-glass)',
            backdropFilter: 'blur(10px)',
            borderRadius: '20px',
            padding: '1.5rem',
          }}>
            <h3 style={{ fontFamily: "'Orbitron', sans-serif", fontSize: '0.9rem', marginBottom: '0.75rem', color: 'var(--text-primary)', letterSpacing: '0.05em' }}>
              Location
            </h3>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '1rem', fontFamily: "'Exo 2', sans-serif" }}>{space.address}</p>
            <div style={{
              height: '120px',
              borderRadius: '12px',
              background: 'rgba(255,255,255,0.05)',
              border: '1px solid rgba(255,255,255,0.1)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--text-secondary)',
              fontSize: '0.85rem',
              fontFamily: "'Exo 2', sans-serif",
            }}>
              🗺️ Map coming soon
            </div>
          </div>
        )}

        {/* Contact card */}
        {(space.phone || space.website) && (
          <div style={{
            background: 'var(--bg-card)',
            border: '1px solid var(--border-glass)',
            backdropFilter: 'blur(10px)',
            borderRadius: '20px',
            padding: '1.5rem',
          }}>
            <h3 style={{ fontFamily: "'Orbitron', sans-serif", fontSize: '0.9rem', marginBottom: '0.75rem', color: 'var(--text-primary)', letterSpacing: '0.05em' }}>
              Contact
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {space.phone && (
                <div>
                  <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '0.2rem', fontFamily: "'Orbitron', sans-serif", letterSpacing: '0.05em' }}>Phone</p>
                  <p style={{ color: 'var(--text-primary)', fontFamily: "'Exo 2', sans-serif" }}>{space.phone}</p>
                </div>
              )}
              {space.website && (
                <div>
                  <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '0.2rem', fontFamily: "'Orbitron', sans-serif", letterSpacing: '0.05em' }}>Website</p>
                  <a
                    href={space.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ color: 'var(--accent)', textDecoration: 'none', fontFamily: "'Exo 2', sans-serif", wordBreak: 'break-all' }}
                  >
                    {space.website}
                  </a>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Amenities card */}
        {space.amenities && space.amenities.length > 0 && (
          <div style={{
            background: 'var(--bg-card)',
            border: '1px solid var(--border-glass)',
            backdropFilter: 'blur(10px)',
            borderRadius: '20px',
            padding: '1.5rem',
          }}>
            <h3 style={{ fontFamily: "'Orbitron', sans-serif", fontSize: '0.9rem', marginBottom: '0.75rem', color: 'var(--text-primary)', letterSpacing: '0.05em' }}>
              Amenities
            </h3>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
              {space.amenities.map((amenity) => (
                <span key={amenity} style={{
                  padding: '0.3rem 0.8rem',
                  borderRadius: '999px',
                  background: 'rgba(255,255,255,0.08)',
                  border: '1px solid rgba(255,255,255,0.12)',
                  fontSize: '0.85rem',
                  color: 'var(--text-secondary)',
                  fontFamily: "'Exo 2', sans-serif",
                }}>
                  {amenity}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Upcoming Events section */}
      {events.length > 0 && (
        <section style={{ marginBottom: '2rem' }}>
          <h3 style={{
            fontFamily: "'Orbitron', sans-serif",
            fontSize: '1rem',
            marginBottom: '1rem',
            color: 'var(--text-primary)',
            letterSpacing: '0.05em',
          }}>
            Upcoming Events
          </h3>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
            gap: '1rem',
          }}>
            {events.map((e) => (
              <EventCard key={e.id} event={e} />
            ))}
          </div>
        </section>
      )}

      {/* Heritage Vault placeholder */}
      <div style={{
        background: 'var(--bg-card)',
        border: '1px solid var(--border-glass)',
        backdropFilter: 'blur(10px)',
        borderRadius: '20px',
        padding: '2rem',
        marginTop: '2rem',
        textAlign: 'center',
      }}>
        <h3 style={{
          fontFamily: "'Orbitron', sans-serif",
          fontSize: '1.1rem',
          marginBottom: '0.75rem',
          color: 'var(--text-primary)',
          letterSpacing: '0.05em',
        }}>
          Heritage Vault
        </h3>
        <p style={{ color: 'var(--text-secondary)', fontFamily: "'Exo 2', sans-serif" }}>
          The history of this space lives here — coming soon
        </p>
      </div>

      {/* Back link */}
      <div style={{ marginTop: '2rem' }}>
        <Link href="/spaces" style={{ color: 'var(--text-secondary)', textDecoration: 'none', fontSize: '0.9rem', fontFamily: "'Exo 2', sans-serif" }}>
          ← Back to Spaces
        </Link>
      </div>
    </div>
  )
}
