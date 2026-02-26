'use client'

import { useEffect, useState, useMemo } from 'react'
import { collection, query, where, getDocs } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { Artist } from '@/lib/types'
import ArtistCard from '@/components/ArtistCard'

export default function ArtistsPage() {
  const [artists, setArtists] = useState<Artist[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedType, setSelectedType] = useState('')

  useEffect(() => {
    const fetchArtists = async () => {
      try {
        const q = query(
          collection(db, 'artists'),
          where('status', '==', 'approved')
        )
        const snapshot = await getDocs(q)
        const fetched = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as Artist[]
        setArtists(fetched)
      } catch (err) {
        console.error('Error fetching artists:', err)
      } finally {
        setLoading(false)
      }
    }
    fetchArtists()
  }, [])

  const artistTypes = useMemo(() => {
    const types = new Set<string>()
    artists.forEach((a) => {
      if (a.type) types.add(a.type)
      if (a.genre) types.add(a.genre)
    })
    return Array.from(types).sort()
  }, [artists])

  const filtered = useMemo(() => {
    if (!selectedType) return artists
    return artists.filter((a) => a.type === selectedType || a.genre === selectedType)
  }, [artists, selectedType])

  return (
    <div>
      <h2 style={{
        fontFamily: "'Orbitron', sans-serif",
        fontSize: '1.3rem',
        marginBottom: '1.5rem',
      }} className="pride-gradient-text">
        Artists
      </h2>

      {/* Filter bar */}
      {artistTypes.length > 0 && (
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
          {artistTypes.map((type) => (
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
          Loading artists...
        </div>
      ) : filtered.length > 0 ? (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
          gap: '1rem',
        }}>
          {filtered.map((artist) => (
            <ArtistCard key={artist.id} artist={artist} />
          ))}
        </div>
      ) : (
        <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-secondary)' }}>
          <p style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>🎤</p>
          <p>No artists found. Check back soon!</p>
        </div>
      )}
    </div>
  )
}
