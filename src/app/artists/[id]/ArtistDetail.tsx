'use client'

import { useEffect, useState } from 'react'
import { doc, getDoc, collection, query, where, getDocs, limit } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { Artist, QUEvent } from '@/lib/types'
import EventCard from '@/components/EventCard'
import Link from 'next/link'

export default function ArtistDetail({ id }: { id: string }) {
  const [artist, setArtist] = useState<Artist | null>(null)
  const [events, setEvents] = useState<QUEvent[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const fetchArtist = async () => {
      try {
        const docRef = doc(db, 'artists', id)
        const snap = await getDoc(docRef)
        if (snap.exists()) {
          setArtist({ id: snap.id, ...snap.data() } as Artist)

          // Fetch upcoming events featuring this artist
          const evQ = query(
            collection(db, 'events'),
            where('status', '==', 'approved'),
            where('artistId', '==', id),
            limit(8)
          )
          const evSnap = await getDocs(evQ)
          setEvents(evSnap.docs.map((d) => ({ id: d.id, ...d.data() }) as QUEvent))
        } else {
          setError('Artist not found')
        }
      } catch (err) {
        console.error('Error fetching artist:', err)
        setError('Failed to load artist')
      } finally {
        setLoading(false)
      }
    }
    if (id) fetchArtist()
  }, [id])

  if (loading) {
    return <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-secondary)' }}>Loading artist...</div>
  }

  if (error || !artist) {
    return (
      <div style={{ textAlign: 'center', padding: '3rem' }}>
        <p style={{ color: 'var(--pride-red)', marginBottom: '1rem' }}>{error || 'Artist not found'}</p>
        <Link href="/artists" style={{ color: 'var(--pride-violet)', textDecoration: 'none' }}>← Back to Artists</Link>
      </div>
    )
  }

  const today = new Date().toISOString().split('T')[0]
  const upcomingShows = events.filter((e) => e.date >= today)
  const pastShows = events.filter((e) => e.date < today)

  return (
    <div style={{ fontFamily: "'Exo 2', sans-serif" }}>

      {/* Banner */}
      <div style={{
        width: '100%',
        height: '280px',
        position: 'relative',
        background: 'linear-gradient(135deg, rgba(228,3,3,0.4), rgba(115,41,130,0.5), rgba(0,128,38,0.3))',
        overflow: 'hidden',
      }}>
        {artist.imageUrl && (
          <div style={{
            position: 'absolute',
            inset: 0,
            backgroundImage: `url(${artist.imageUrl})`,
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

        {/* Artist type badge */}
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
          Artist
        </div>
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
          background: 'linear-gradient(135deg, rgba(228,3,3,0.8), rgba(115,41,130,0.8))',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '3rem',
          marginBottom: '1rem',
        }}>
          👑
        </div>

        <h2 style={{
          fontFamily: "'Orbitron', sans-serif",
          fontSize: '1.8rem',
          marginBottom: '0.5rem',
        }} className="pride-gradient-text">
          {artist.name}
        </h2>

        {artist.bio && (
          <p style={{
            color: 'var(--text-secondary)',
            marginBottom: '1rem',
            lineHeight: 1.6,
            fontFamily: "'Exo 2', sans-serif",
          }}>
            {artist.bio.slice(0, 120)}{artist.bio.length > 120 ? '…' : ''}
          </p>
        )}

        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', alignItems: 'center' }}>
          {artist.type && (
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
              {artist.type}
            </span>
          )}
          {artist.genre && (
            <span style={{
              padding: '0.3rem 0.8rem',
              borderRadius: '999px',
              background: 'rgba(0,128,38,0.15)',
              fontSize: '0.75rem',
              color: 'var(--accent)',
              fontFamily: "'Orbitron', sans-serif",
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
            }}>
              {artist.genre}
            </span>
          )}
          {artist.website && (
            <a
              href={artist.website}
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
          {artist.socialLinks && Object.entries(artist.socialLinks).map(([platform, url]) => (
            <a
              key={platform}
              href={url}
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
                textTransform: 'capitalize',
              }}
            >
              {platform}
            </a>
          ))}
        </div>
      </div>

      {/* Details grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
        gap: '1.5rem',
        marginBottom: '2rem',
      }}>
        {/* Performance Types card */}
        {artist.type && (
          <div style={{
            background: 'var(--bg-card)',
            border: '1px solid var(--border-glass)',
            backdropFilter: 'blur(10px)',
            borderRadius: '20px',
            padding: '1.5rem',
          }}>
            <h3 style={{ fontFamily: "'Orbitron', sans-serif", fontSize: '0.9rem', marginBottom: '0.75rem', color: 'var(--text-primary)', letterSpacing: '0.05em' }}>
              Performance Types
            </h3>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
              {artist.type.split(',').map((t) => t.trim()).filter(Boolean).map((t) => (
                <span key={t} style={{
                  padding: '0.3rem 0.8rem',
                  borderRadius: '999px',
                  background: 'rgba(117,7,135,0.15)',
                  border: '1px solid rgba(117,7,135,0.3)',
                  fontSize: '0.85rem',
                  color: 'var(--text-secondary)',
                  fontFamily: "'Exo 2', sans-serif",
                }}>
                  {t}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Booking card */}
        {(artist.website || (artist.socialLinks && Object.keys(artist.socialLinks).length > 0)) && (
          <div style={{
            background: 'var(--bg-card)',
            border: '1px solid var(--border-glass)',
            backdropFilter: 'blur(10px)',
            borderRadius: '20px',
            padding: '1.5rem',
          }}>
            <h3 style={{ fontFamily: "'Orbitron', sans-serif", fontSize: '0.9rem', marginBottom: '0.75rem', color: 'var(--text-primary)', letterSpacing: '0.05em' }}>
              Booking &amp; Links
            </h3>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
              {artist.website && (
                <a
                  href={artist.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    padding: '0.4rem 1rem',
                    borderRadius: '999px',
                    background: 'rgba(117,7,135,0.2)',
                    color: 'var(--accent)',
                    textDecoration: 'none',
                    fontSize: '0.85rem',
                    fontFamily: "'Exo 2', sans-serif",
                  }}
                >
                  Website
                </a>
              )}
              {artist.socialLinks && Object.entries(artist.socialLinks).map(([platform, url]) => (
                <a
                  key={platform}
                  href={url}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    padding: '0.4rem 1rem',
                    borderRadius: '999px',
                    background: 'rgba(255,255,255,0.08)',
                    color: 'var(--text-secondary)',
                    textDecoration: 'none',
                    fontSize: '0.85rem',
                    fontFamily: "'Exo 2', sans-serif",
                    textTransform: 'capitalize',
                  }}
                >
                  {platform}
                </a>
              ))}
            </div>
          </div>
        )}

        {/* About card — full width */}
        {artist.bio && (
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
              {artist.bio}
            </p>
          </div>
        )}
      </div>

      {/* Upcoming Shows section */}
      {upcomingShows.length > 0 && (
        <section style={{ marginBottom: '2rem' }}>
          <h3 style={{
            fontFamily: "'Orbitron', sans-serif",
            fontSize: '1rem',
            marginBottom: '1rem',
            color: 'var(--text-primary)',
            letterSpacing: '0.05em',
          }}>
            Upcoming Shows
          </h3>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
            gap: '1rem',
          }}>
            {upcomingShows.map((e) => (
              <EventCard key={e.id} event={e} />
            ))}
          </div>
        </section>
      )}

      {/* Past Shows section */}
      {pastShows.length > 0 && (
        <section style={{ marginBottom: '2rem' }}>
          <h3 style={{
            fontFamily: "'Orbitron', sans-serif",
            fontSize: '1rem',
            marginBottom: '1rem',
            color: 'var(--text-primary)',
            letterSpacing: '0.05em',
          }}>
            Past Shows
          </h3>
          <div style={{ opacity: 0.6 }}>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
              gap: '1rem',
            }}>
              {pastShows.map((e) => (
                <EventCard key={e.id} event={e} />
              ))}
            </div>
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
          The archive of this artist&apos;s journey lives here — coming soon
        </p>
      </div>

      {/* Back link */}
      <div style={{ marginTop: '2rem' }}>
        <Link href="/artists" style={{ color: 'var(--text-secondary)', textDecoration: 'none', fontSize: '0.9rem', fontFamily: "'Exo 2', sans-serif" }}>
          ← Back to Artists
        </Link>
      </div>
    </div>
  )
}
