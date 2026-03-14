'use client'

import { useEffect, useState } from 'react'
import { doc, getDoc, collection, query, where, getDocs, limit } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { Venue, QUEvent } from '@/lib/types'
import EventCard from '@/components/EventCard'
import Link from 'next/link'

export default function VenueDetail({ id }: { id: string }) {
  const [venue, setVenue] = useState<Venue | null>(null)
  const [events, setEvents] = useState<QUEvent[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const fetchVenue = async () => {
      try {
        const docRef = doc(db, 'venues', id) // TODO: migrate Firestore collection from 'venues' to 'spaces'
        const snap = await getDoc(docRef)
        if (snap.exists()) {
          setVenue({ id: snap.id, ...snap.data() } as Venue)

          // Fetch upcoming events at this venue
          const evQ = query(
            collection(db, 'events'),
            where('status', '==', 'approved'),
            where('venueId', '==', id),
            limit(8)
          )
          const evSnap = await getDocs(evQ)
          setEvents(evSnap.docs.map((d) => ({ id: d.id, ...d.data() }) as QUEvent))
        } else {
          setError('Venue not found')
        }
      } catch (err) {
        console.error('Error fetching venue:', err)
        setError('Failed to load venue')
      } finally {
        setLoading(false)
      }
    }
    if (id) fetchVenue()
  }, [id])

  if (loading) {
    return <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-secondary)' }}>Loading venue...</div>
  }

  if (error || !venue) {
    return (
      <div style={{ textAlign: 'center', padding: '3rem' }}>
        <p style={{ color: 'var(--pride-red)', marginBottom: '1rem' }}>{error || 'Venue not found'}</p>
        <Link href="/venues" style={{ color: 'var(--pride-violet)', textDecoration: 'none' }}>← Back to Venues</Link>
      </div>
    )
  }

  return (
    <div>
      <Link href="/venues" style={{ color: 'var(--text-secondary)', textDecoration: 'none', fontSize: '0.9rem' }}>
        ← Back to Venues
      </Link>

      {/* Hero image */}
      {venue.imageUrl && (
        <div style={{
          width: '100%',
          height: '300px',
          borderRadius: '12px',
          overflow: 'hidden',
          marginTop: '1rem',
          backgroundImage: `url(${venue.imageUrl})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }} />
      )}

      <div style={{ marginTop: '1.5rem' }}>
        <h1 style={{
          fontFamily: "'Orbitron', sans-serif",
          fontSize: '1.8rem',
          marginBottom: '0.5rem',
        }} className="pride-gradient-text">
          {venue.name}
        </h1>

        {venue.type && (
          <span style={{
            display: 'inline-block',
            padding: '0.3rem 0.8rem',
            borderRadius: '999px',
            background: 'rgba(117, 7, 135, 0.2)',
            fontSize: '0.85rem',
            color: 'var(--pride-violet)',
            marginBottom: '1.5rem',
          }}>
            {venue.type}
          </span>
        )}

        {/* Details */}
        <div className="glass-card" style={{ padding: '1.5rem', marginBottom: '1.5rem' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {venue.address && (
              <div>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>Address</p>
                <p style={{ color: 'var(--text-primary)' }}>{venue.address}</p>
              </div>
            )}
            {venue.phone && (
              <div>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>Phone</p>
                <p style={{ color: 'var(--text-primary)' }}>{venue.phone}</p>
              </div>
            )}
            {venue.website && (
              <div>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>Website</p>
                <a
                  href={venue.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ color: 'var(--pride-violet)', textDecoration: 'none' }}
                >
                  {venue.website}
                </a>
              </div>
            )}
          </div>
        </div>

        {/* Description */}
        {venue.description && (
          <div className="glass-card" style={{ padding: '1.5rem', marginBottom: '1.5rem' }}>
            <h3 style={{ fontFamily: "'Orbitron', sans-serif", fontSize: '0.9rem', marginBottom: '0.75rem', color: 'var(--text-primary)' }}>
              About
            </h3>
            <p style={{ color: 'var(--text-secondary)', lineHeight: 1.7, whiteSpace: 'pre-wrap' }}>
              {venue.description}
            </p>
          </div>
        )}

        {/* Amenities */}
        {venue.amenities && venue.amenities.length > 0 && (
          <div className="glass-card" style={{ padding: '1.5rem', marginBottom: '1.5rem' }}>
            <h3 style={{ fontFamily: "'Orbitron', sans-serif", fontSize: '0.9rem', marginBottom: '0.75rem', color: 'var(--text-primary)' }}>
              Amenities
            </h3>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
              {venue.amenities.map((amenity) => (
                <span key={amenity} style={{
                  padding: '0.3rem 0.8rem',
                  borderRadius: '999px',
                  background: 'rgba(255, 255, 255, 0.08)',
                  fontSize: '0.85rem',
                  color: 'var(--text-secondary)',
                }}>
                  {amenity}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Upcoming events */}
        {events.length > 0 && (
          <div style={{ marginTop: '2rem' }}>
            <h3 style={{
              fontFamily: "'Orbitron', sans-serif",
              fontSize: '1rem',
              marginBottom: '1rem',
              color: 'var(--text-primary)',
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
          </div>
        )}
      </div>
    </div>
  )
}
