'use client'

import { useEffect, useState } from 'react'
import { doc, getDoc, collection, query, where, getDocs, limit } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { QUEvent, EVENT_CATEGORIES } from '@/lib/types'
import EventCard from '@/components/EventCard'
import Link from 'next/link'

export default function EventDetail({ id }: { id: string }) {
  const [event, setEvent] = useState<QUEvent | null>(null)
  const [related, setRelated] = useState<QUEvent[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const fetchEvent = async () => {
      try {
        const docRef = doc(db, 'events', id)
        const snap = await getDoc(docRef)
        if (snap.exists()) {
          const data = { id: snap.id, ...snap.data() } as QUEvent
          setEvent(data)

          // Fetch related events (same category, approved)
          const relQ = query(
            collection(db, 'events'),
            where('status', '==', 'approved'),
            where('category', '==', data.category),
            limit(5)
          )
          const relSnap = await getDocs(relQ)
          const relEvents = relSnap.docs
            .map((d) => ({ id: d.id, ...d.data() }) as QUEvent)
            .filter((e) => e.id !== id)
            .slice(0, 4)
          setRelated(relEvents)
        } else {
          setError('Event not found')
        }
      } catch (err) {
        console.error('Error fetching event:', err)
        setError('Failed to load event')
      } finally {
        setLoading(false)
      }
    }
    if (id) fetchEvent()
  }, [id])

  if (loading) {
    return <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-secondary)' }}>Loading event...</div>
  }

  if (error || !event) {
    return (
      <div style={{ textAlign: 'center', padding: '3rem' }}>
        <p style={{ color: 'var(--pride-red)', marginBottom: '1rem' }}>{error || 'Event not found'}</p>
        <Link href="/" style={{ color: 'var(--pride-violet)', textDecoration: 'none' }}>← Back to Calendar</Link>
      </div>
    )
  }

  const emoji = EVENT_CATEGORIES[event.category] || '📅'

  return (
    <div style={{ fontFamily: "'Exo 2', sans-serif" }}>

      {/* Banner */}
      <div style={{
        width: '100%',
        height: '280px',
        position: 'relative',
        background: 'rgba(115,41,130,0.5)',
        overflow: 'hidden',
      }}>
        {event.imageUrl && (
          <div style={{
            position: 'absolute',
            inset: 0,
            backgroundImage: `url(${event.imageUrl})`,
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

        {/* Event type badge */}
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
          Event
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
          background: 'linear-gradient(135deg, rgba(115,41,130,0.8), rgba(36,64,142,0.8))',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '3rem',
          marginBottom: '1rem',
        }}>
          {emoji}
        </div>

        <h2 style={{
          fontFamily: "'Orbitron', sans-serif",
          fontSize: '1.8rem',
          marginBottom: '0.5rem',
        }} className="pride-gradient-text">
          {event.title}
        </h2>

        <p style={{
          color: 'var(--accent)',
          fontFamily: "'Exo 2', sans-serif",
          fontSize: '1rem',
          marginBottom: '1rem',
        }}>
          {new Date(event.date).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
          {event.time && ` · ${event.time}${event.endTime ? ` – ${event.endTime}` : ''}`}
        </p>

        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', alignItems: 'center' }}>
          {event.venue && (
            event.venueId ? (
              <Link href={`/spaces/${event.venueId}`} style={{
                padding: '0.3rem 0.8rem',
                borderRadius: '999px',
                background: 'rgba(255,255,255,0.08)',
                border: '1px solid rgba(255,255,255,0.15)',
                color: 'var(--text-secondary)',
                textDecoration: 'none',
                fontSize: '0.8rem',
                fontFamily: "'Exo 2', sans-serif",
              }}>
                📍 {event.venue}
              </Link>
            ) : (
              <span style={{
                padding: '0.3rem 0.8rem',
                borderRadius: '999px',
                background: 'rgba(255,255,255,0.08)',
                border: '1px solid rgba(255,255,255,0.15)',
                color: 'var(--text-secondary)',
                fontSize: '0.8rem',
                fontFamily: "'Exo 2', sans-serif",
              }}>
                📍 {event.venue}
              </span>
            )
          )}
          {event.artist && (
            event.artistId ? (
              <Link href={`/artists/${event.artistId}`} style={{
                padding: '0.3rem 0.8rem',
                borderRadius: '999px',
                background: 'rgba(255,255,255,0.08)',
                border: '1px solid rgba(255,255,255,0.15)',
                color: 'var(--text-secondary)',
                textDecoration: 'none',
                fontSize: '0.8rem',
                fontFamily: "'Exo 2', sans-serif",
              }}>
                🎤 {event.artist}
              </Link>
            ) : (
              <span style={{
                padding: '0.3rem 0.8rem',
                borderRadius: '999px',
                background: 'rgba(255,255,255,0.08)',
                border: '1px solid rgba(255,255,255,0.15)',
                color: 'var(--text-secondary)',
                fontSize: '0.8rem',
                fontFamily: "'Exo 2', sans-serif",
              }}>
                🎤 {event.artist}
              </span>
            )
          )}
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
            {emoji} {event.category}
          </span>
        </div>
      </div>

      {/* Details grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
        gap: '1.5rem',
        marginBottom: '2rem',
      }}>
        {/* Date & Time card */}
        <div style={{
          background: 'var(--bg-card)',
          border: '1px solid var(--border-glass)',
          backdropFilter: 'blur(10px)',
          borderRadius: '20px',
          padding: '1.5rem',
        }}>
          <h3 style={{ fontFamily: "'Orbitron', sans-serif", fontSize: '0.9rem', marginBottom: '0.75rem', color: 'var(--text-primary)', letterSpacing: '0.05em' }}>
            Date &amp; Time
          </h3>
          <p style={{ color: 'var(--text-primary)', fontFamily: "'Exo 2', sans-serif", marginBottom: '0.5rem' }}>
            {new Date(event.date).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
          </p>
          {event.time && (
            <p style={{ color: 'var(--text-secondary)', fontFamily: "'Exo 2', sans-serif" }}>
              {event.time}{event.endTime ? ` – ${event.endTime}` : ''}
            </p>
          )}
        </div>

        {/* Location card */}
        {event.venue && (
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
            {event.venueId ? (
              <Link href={`/spaces/${event.venueId}`} style={{ color: 'var(--accent)', textDecoration: 'none', fontFamily: "'Exo 2', sans-serif", display: 'block', marginBottom: '0.5rem' }}>
                {event.venue}
              </Link>
            ) : (
              <p style={{ color: 'var(--text-primary)', fontFamily: "'Exo 2', sans-serif", marginBottom: '0.5rem' }}>{event.venue}</p>
            )}
            <div style={{
              height: '100px',
              borderRadius: '12px',
              background: 'rgba(255,255,255,0.05)',
              border: '1px solid rgba(255,255,255,0.1)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--text-secondary)',
              fontSize: '0.85rem',
              fontFamily: "'Exo 2', sans-serif",
              marginTop: '0.75rem',
            }}>
              🗺️ Map coming soon
            </div>
          </div>
        )}

        {/* Description card — full width */}
        {event.description && (
          <div style={{
            background: 'var(--bg-card)',
            border: '1px solid var(--border-glass)',
            backdropFilter: 'blur(10px)',
            borderRadius: '20px',
            padding: '1.5rem',
            gridColumn: '1 / -1',
          }}>
            <h3 style={{ fontFamily: "'Orbitron', sans-serif", fontSize: '0.9rem', marginBottom: '0.75rem', color: 'var(--text-primary)', letterSpacing: '0.05em' }}>
              About This Event
            </h3>
            <p style={{ color: 'var(--text-secondary)', lineHeight: 1.7, whiteSpace: 'pre-wrap', fontFamily: "'Exo 2', sans-serif" }}>
              {event.description}
            </p>
          </div>
        )}

        {/* Ticket card */}
        <div style={{
          background: 'var(--bg-card)',
          border: '1px solid var(--border-glass)',
          backdropFilter: 'blur(10px)',
          borderRadius: '20px',
          padding: '1.5rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}>
          {event.ticketLink ? (
            <a
              href={event.ticketLink}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: 'inline-block',
                padding: '0.75rem 2rem',
                borderRadius: '8px',
                background: 'var(--pride-violet)',
                color: '#fff',
                textDecoration: 'none',
                fontFamily: "'Exo 2', sans-serif",
                fontWeight: 600,
                fontSize: '1rem',
              }}
            >
              Get Tickets →
            </a>
          ) : (
            <span style={{
              padding: '0.5rem 1.5rem',
              borderRadius: '999px',
              background: 'rgba(0,128,38,0.2)',
              border: '1px solid rgba(0,128,38,0.4)',
              color: 'var(--text-primary)',
              fontFamily: "'Exo 2', sans-serif",
              fontSize: '0.9rem',
            }}>
              ✅ Free Event
            </span>
          )}
        </div>
      </div>

      {/* Related Events section */}
      {related.length > 0 && (
        <section style={{ marginBottom: '2rem' }}>
          <h3 style={{
            fontFamily: "'Orbitron', sans-serif",
            fontSize: '1rem',
            marginBottom: '1rem',
            color: 'var(--text-primary)',
            letterSpacing: '0.05em',
          }}>
            Related Events
          </h3>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
            gap: '1rem',
          }}>
            {related.map((e) => (
              <EventCard key={e.id} event={e} />
            ))}
          </div>
        </section>
      )}

      {/* Back link */}
      <div style={{ marginTop: '2rem' }}>
        <Link href="/" style={{ color: 'var(--text-secondary)', textDecoration: 'none', fontSize: '0.9rem', fontFamily: "'Exo 2', sans-serif" }}>
          ← Back to Calendar
        </Link>
      </div>
    </div>
  )
}
