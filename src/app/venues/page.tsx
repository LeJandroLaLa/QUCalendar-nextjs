'use client'

import { useEffect, useState, useMemo } from 'react'
import { collection, query, where, getDocs } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { Venue, VENUE_TYPES, VenueType } from '@/lib/types'
import VenueCard from '@/components/VenueCard'

const venueTypeNames = Object.keys(VENUE_TYPES) as VenueType[]

export default function VenuesPage() {
  const [venues, setVenues] = useState<Venue[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedTypes, setSelectedTypes] = useState<VenueType[]>([])
  const [showTypeGrid, setShowTypeGrid] = useState(true)

  useEffect(() => {
    const fetchVenues = async () => {
      try {
        const q = query(
          collection(db, 'venues'), // TODO: migrate Firestore collection from 'venues' to 'spaces'
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

  const toggleType = (vt: VenueType) => {
    setSelectedTypes(prev =>
      prev.includes(vt) ? prev.filter(t => t !== vt) : [...prev, vt]
    )
  }

  const filtered = useMemo(() => {
    if (selectedTypes.length === 0) return venues
    return venues.filter((v) => v.type && selectedTypes.includes(v.type))
  }, [venues, selectedTypes])

  return (
    <div>
      <h2 style={{
        fontFamily: "'Orbitron', sans-serif",
        fontSize: '1.3rem',
        marginBottom: '1.5rem',
      }} className="pride-gradient-text">
        Venues
      </h2>

      {/* Venue type filter grid */}
      <div className="glass-card" style={{ padding: '1rem', marginBottom: '1.5rem' }}>
        <button onClick={() => setShowTypeGrid(v => !v)} style={{
          background: 'none', border: 'none', color: 'var(--text-secondary)',
          cursor: 'pointer', fontFamily: "'Exo 2', sans-serif", fontSize: '0.85rem',
          padding: '0.25rem 0', display: 'flex', alignItems: 'center', gap: '0.5rem',
        }}>
          {showTypeGrid ? '▼' : '▶'} Filter by Venue Type
          {selectedTypes.length > 0 && (
            <span style={{ color: 'var(--pride-yellow)', fontSize: '0.75rem' }}>
              ({selectedTypes.length} active)
            </span>
          )}
        </button>

        {showTypeGrid && (
          <div style={{
            display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(90px, 1fr))',
            gap: '0.5rem', marginTop: '0.75rem',
          }}>
            {venueTypeNames.map(vt => (
              <div key={vt} onClick={() => toggleType(vt)} style={{
                display: 'flex', flexDirection: 'column', alignItems: 'center',
                padding: '0.5rem 0.25rem', borderRadius: '8px', cursor: 'pointer',
                background: selectedTypes.includes(vt)
                  ? 'rgba(117,7,135,0.4)' : 'rgba(255,255,255,0.04)',
                border: `1px solid ${selectedTypes.includes(vt) ? 'rgba(117,7,135,0.8)' : 'var(--border-glass)'}`,
                transition: 'all 0.15s',
                userSelect: 'none',
              }}>
                <span style={{ fontSize: '1.3rem' }}>{VENUE_TYPES[vt]}</span>
                <span style={{ fontSize: '0.65rem', color: 'var(--text-secondary)', textAlign: 'center', marginTop: '0.2rem', lineHeight: 1.2 }}>{vt}</span>
              </div>
            ))}
          </div>
        )}
      </div>

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
