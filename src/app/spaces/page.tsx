'use client'

import { useEffect, useState, useMemo } from 'react'
import { collection, query, where, getDocs } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { Space, SPACE_TYPES, SpaceType } from '@/lib/types'
import SpaceCard from '@/components/SpaceCard'

const spaceTypeNames = Object.keys(SPACE_TYPES) as SpaceType[]

export default function SpacesPage() {
  const [spaces, setSpaces] = useState<Space[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedTypes, setSelectedTypes] = useState<SpaceType[]>([])
  const [showTypeGrid, setShowTypeGrid] = useState(true)

  useEffect(() => {
    const fetchSpaces = async () => {
      try {
        const q = query(
          collection(db, 'spaces'),
          where('status', '==', 'approved')
        )
        const snapshot = await getDocs(q)
        const fetched = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as Space[]
        setSpaces(fetched)
      } catch (err) {
        console.error('Error fetching spaces:', err)
      } finally {
        setLoading(false)
      }
    }
    fetchSpaces()
  }, [])

  const toggleType = (vt: SpaceType) => {
    setSelectedTypes(prev =>
      prev.includes(vt) ? prev.filter(t => t !== vt) : [...prev, vt]
    )
  }

  const filtered = useMemo(() => {
    if (selectedTypes.length === 0) return spaces
    return spaces.filter((s) => s.type && selectedTypes.includes(s.type))
  }, [spaces, selectedTypes])

  return (
    <div>
      <h2 style={{
        fontFamily: "'Orbitron', sans-serif",
        fontSize: '1.3rem',
        marginBottom: '1.5rem',
      }} className="pride-gradient-text">
        Spaces
      </h2>

      {/* Space type filter grid */}
      <div className="glass-card" style={{ padding: '1rem', marginBottom: '1.5rem' }}>
        <button onClick={() => setShowTypeGrid(v => !v)} style={{
          background: 'none', border: 'none', color: 'var(--text-secondary)',
          cursor: 'pointer', fontFamily: "'Exo 2', sans-serif", fontSize: '0.85rem',
          padding: '0.25rem 0', display: 'flex', alignItems: 'center', gap: '0.5rem',
        }}>
          {showTypeGrid ? '▼' : '▶'} Filter by Space Type
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
            {spaceTypeNames.map(vt => (
              <div key={vt} onClick={() => toggleType(vt)} style={{
                display: 'flex', flexDirection: 'column', alignItems: 'center',
                padding: '0.5rem 0.25rem', borderRadius: '8px', cursor: 'pointer',
                background: selectedTypes.includes(vt)
                  ? 'rgba(117,7,135,0.4)' : 'rgba(255,255,255,0.04)',
                border: `1px solid ${selectedTypes.includes(vt) ? 'rgba(117,7,135,0.8)' : 'var(--border-glass)'}`,
                transition: 'all 0.15s',
                userSelect: 'none',
              }}>
                <span style={{ fontSize: '1.3rem' }}>{SPACE_TYPES[vt]}</span>
                <span style={{ fontSize: '0.65rem', color: 'var(--text-secondary)', textAlign: 'center', marginTop: '0.2rem', lineHeight: 1.2 }}>{vt}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-secondary)' }}>
          Loading spaces...
        </div>
      ) : filtered.length > 0 ? (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
          gap: '1rem',
        }}>
          {filtered.map((space) => (
            <SpaceCard key={space.id} space={space} />
          ))}
        </div>
      ) : (
        <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-secondary)' }}>
          <p style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>🏠</p>
          <p>No spaces found. Check back soon!</p>
        </div>
      )}
    </div>
  )
}
