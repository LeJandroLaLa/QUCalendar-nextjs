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
    <div>
      <Link href="/" style={{ color: 'var(--text-secondary)', textDecoration: 'none', fontSize: '0.9rem' }}>
        ← Back to Calendar
      </Link>

      {/* Hero image */}
      {event.imageUrl && (
        <div style={{
          width: '100%',
          height: '300px',
          borderRadius: '12px',
          overflow: 'hidden',
          marginTop: '1rem',
          backgroundImage: `url(${event.imageUrl})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }} />
      )}

      <div style={{ marginTop: '1.5rem' }}>
        {/* Category tag */}
        <span style={{
          display: 'inline-block',
          padding: '0.3rem 0.8rem',
          borderRadius: '999px',
          background: 'rgba(117, 7, 135, 0.2)',
          fontSize: '0.85rem',
          color: 'var(--pride-violet)',
          marginBottom: '1rem',
        }}>
          {emoji} {event.category}
        </span>

        <h1 style={{
          fontFamily: "'Orbitron', sans-serif",
          fontSize: '1.8rem',
          marginBottom: '1rem',
        }} className="pride-gradient-text">
          {event.title}
        </h1>

        {/* Details */}
        <div className="glass-card" style={{ padding: '1.5rem', marginBottom: '1.5rem' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>Date</p>
              <p style={{ color: 'var(--text-primary)' }}>
                {new Date(event.date).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
              </p>
            </div>
            {event.time && (
              <div>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>Time</p>
                <p style={{ color: 'var(--text-primary)' }}>
                  {event.time}{event.endTime ? ` – ${event.endTime}` : ''}
                </p>
              </div>
            )}
            {event.venue && (
              <div>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>Venue</p>
                {event.venueId ? (
                  <Link href={`/venues/${event.venueId}`} style={{ color: 'var(--pride-violet)', textDecoration: 'none' }}>
                    {event.venue}
                  </Link>
                ) : (
                  <p style={{ color: 'var(--text-primary)' }}>{event.venue}</p>
                )}
              </div>
            )}
            {event.artist && (
              <div>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>Artist</p>
                {event.artistId ? (
                  <Link href={`/artists/${event.artistId}`} style={{ color: 'var(--pride-violet)', textDecoration: 'none' }}>
                    {event.artist}
                  </Link>
                ) : (
                  <p style={{ color: 'var(--text-primary)' }}>{event.artist}</p>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Description */}
        {event.description && (
          <div className="glass-card" style={{ padding: '1.5rem', marginBottom: '1.5rem' }}>
            <h3 style={{ fontFamily: "'Orbitron', sans-serif", fontSize: '0.9rem', marginBottom: '0.75rem', color: 'var(--text-primary)' }}>
              About This Event
            </h3>
            <p style={{ color: 'var(--text-secondary)', lineHeight: 1.7, whiteSpace: 'pre-wrap' }}>
              {event.description}
            </p>
          </div>
        )}

        {/* Ticket link */}
        {event.ticketLink && (
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
              marginBottom: '2rem',
            }}
          >
            Get Tickets →
          </a>
        )}

        {/* Related events */}
        {related.length > 0 && (
          <div style={{ marginTop: '2rem' }}>
            <h3 style={{
              fontFamily: "'Orbitron', sans-serif",
              fontSize: '1rem',
              marginBottom: '1rem',
              color: 'var(--text-primary)',
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
          </div>
        )}
      </div>
    </div>
  )
}
