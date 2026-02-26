'use client'

import { useEffect, useState, useMemo } from 'react'
import { collection, query, where, getDocs } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { Venue } from '@/lib/types'
import VenueCard from '@/components/VenueCard'

export default function VenuesPage() {
  const [venues, setVenues] = useState<Venue[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedType, setSelectedType] = useState('')

  useEffect(() => {
    const fetchVenues = async () => {
      try {
        const q = query(
          collection(db, 'venues'),
          where('status', '==', 'approved')
        )
        const snapshot = await getDocs(q)
        const fetched = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as Venue[]
        setVenues(fetched)
      } catch (err) {
        console.error('Error fetching venues:', err)
      } finally {
        setLoading(false)
      }
    }
    fetchVenues()
  }, [])

  const venueTypes = useMemo(() => {
    const types = new Set<string>()
    venues.forEach((v) => { if (v.type) types.add(v.type) })
    return Array.from(types).sort()
  }, [venues])

  const filtered = useMemo(() => {
    if (!selectedType) return venues
    return venues.filter((v) => v.type === selectedType)
  }, [venues, selectedType])

  return (
    <div>
      <h2 style={{
        fontFamily: "'Orbitron', sans-serif",
        fontSize: '1.3rem',
        marginBottom: '1.5rem',
      }} className="pride-gradient-text">
        Venues
      </h2>

      {/* Filter bar */}
      {venueTypes.length > 0 && (
        <div className="glass-card" style={{
          padding: '1rem',
          marginBottom: '1.5rem',
          display: 'flex',
          gap: '0.5rem',
          flexWrap: 'wrap',
        }}>
          <button
            onClick={() => setSelectedType('')}
            style={{
              padding: '0.4rem 1rem',
              borderRadius: '999px',
              border: '1px solid var(--border-glass)',
              background: !selectedType ? 'rgba(117, 7, 135, 0.3)' : 'transparent',
              color: 'var(--text-primary)',
              cursor: 'pointer',
              fontFamily: "'Exo 2', sans-serif",
              fontSize: '0.85rem',
            }}
          >
            All
          </button>
          {venueTypes.map((type) => (
            <button
              key={type}
              onClick={() => setSelectedType(type)}
              style={{
                padding: '0.4rem 1rem',
                borderRadius: '999px',
                border: '1px solid var(--border-glass)',
                background: selectedType === type ? 'rgba(117, 7, 135, 0.3)' : 'transparent',
                color: 'var(--text-primary)',
                cursor: 'pointer',
                fontFamily: "'Exo 2', sans-serif",
                fontSize: '0.85rem',
              }}
            >
              {type}
            </button>
          ))}
        </div>
      )}

      {loading ? (
        <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-secondary)' }}>
          Loading venues...
        </div>
      ) : filtered.length > 0 ? (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
          gap: '1rem',
        }}>
          {filtered.map((venue) => (
            <VenueCard key={venue.id} venue={venue} />
          ))}
        </div>
      ) : (
        <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-secondary)' }}>
          <p style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>🏠</p>
          <p>No venues found. Check back soon!</p>
        </div>
      )}
    </div>
  )
}
