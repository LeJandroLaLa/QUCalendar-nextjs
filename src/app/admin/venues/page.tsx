'use client'

import { useEffect, useState } from 'react'
import { collection, query, where, getDocs, doc, updateDoc } from 'firebase/firestore'
import { db } from '@/lib/firebase'

interface PendingVenue {
  id: string
  name: string
  type?: string
  address?: string
  imageUrl?: string
  description?: string
  website?: string
  phone?: string
  amenities?: string[]
  submittedAt?: { toDate?: () => Date }
}

export default function AdminVenuesPage() {
  const [venues, setVenues] = useState<PendingVenue[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchPending = async () => {
      try {
        const snap = await getDocs(
          query(collection(db, 'venues'), where('status', '==', 'pending')) // TODO: migrate Firestore collection from 'venues' to 'spaces'
        )
        setVenues(snap.docs.map((d) => ({ id: d.id, ...d.data() }) as PendingVenue))
      } catch (err) {
        console.error('Error fetching pending venues:', err)
      } finally {
        setLoading(false)
      }
    }
    fetchPending()
  }, [])

  const handleAction = async (id: string, status: 'approved' | 'rejected') => {
    // Optimistic UI update
    setVenues((prev) => prev.filter((v) => v.id !== id))
    try {
      await updateDoc(doc(db, 'venues', id), { status }) // TODO: migrate Firestore collection from 'venues' to 'spaces'
    } catch (err) {
      console.error(`Error setting venue to ${status}:`, err)
      // Refetch on error
      const snap = await getDocs(
        query(collection(db, 'venues'), where('status', '==', 'pending')) // TODO: migrate Firestore collection from 'venues' to 'spaces'
      )
      setVenues(snap.docs.map((d) => ({ id: d.id, ...d.data() }) as PendingVenue))
    }
  }

  if (loading) {
    return <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-secondary)' }}>Loading pending venues...</div>
  }

  return (
    <div>
      <h2 style={{
        fontFamily: "'Orbitron', sans-serif",
        fontSize: '1.3rem',
        marginBottom: '1.5rem',
      }} className="pride-gradient-text">
        Pending Venues
      </h2>

      {venues.length === 0 ? (
        <div className="glass-card" style={{ padding: '2rem', textAlign: 'center' }}>
          <p style={{ color: 'var(--text-secondary)' }}>No pending venues to review.</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {venues.map((venue) => (
            <div key={venue.id} className="glass-card" style={{ padding: '1.25rem', display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
              {/* Thumbnail */}
              <div style={{
                width: '100px',
                height: '80px',
                borderRadius: '8px',
                overflow: 'hidden',
                flexShrink: 0,
                background: venue.imageUrl
                  ? `url(${venue.imageUrl}) center/cover`
                  : 'linear-gradient(135deg, rgba(117,7,135,0.3), rgba(0,76,255,0.3))',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}>
                {!venue.imageUrl && <span style={{ fontSize: '1.5rem' }}>🏠</span>}
              </div>

              {/* Details */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <h3 style={{ fontFamily: "'Orbitron', sans-serif", fontSize: '1rem', color: 'var(--text-primary)', marginBottom: '0.25rem' }}>
                  {venue.name}
                </h3>
                {venue.type && <p style={{ fontSize: '0.8rem', color: 'var(--pride-violet)', marginBottom: '0.2rem' }}>{venue.type}</p>}
                {venue.address && <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '0.2rem' }}>{venue.address}</p>}
                {venue.description && (
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '0.2rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {venue.description}
                  </p>
                )}
                {venue.submittedAt?.toDate && (
                  <p style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
                    Submitted {venue.submittedAt.toDate().toLocaleDateString()}
                  </p>
                )}
              </div>

              {/* Actions */}
              <div style={{ display: 'flex', gap: '0.5rem', flexShrink: 0 }}>
                <button
                  onClick={() => handleAction(venue.id, 'approved')}
                  style={{
                    padding: '0.5rem 1rem',
                    borderRadius: '8px',
                    border: 'none',
                    background: 'var(--pride-green)',
                    color: '#fff',
                    fontFamily: "'Exo 2', sans-serif",
                    fontWeight: 600,
                    fontSize: '0.8rem',
                    cursor: 'pointer',
                  }}
                >
                  Approve
                </button>
                <button
                  onClick={() => handleAction(venue.id, 'rejected')}
                  style={{
                    padding: '0.5rem 1rem',
                    borderRadius: '8px',
                    border: '1px solid var(--pride-red)',
                    background: 'transparent',
                    color: 'var(--pride-red)',
                    fontFamily: "'Exo 2', sans-serif",
                    fontWeight: 600,
                    fontSize: '0.8rem',
                    cursor: 'pointer',
                  }}
                >
                  Reject
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
