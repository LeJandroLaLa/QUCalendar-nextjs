'use client'

import { useEffect, useState } from 'react'
import { collection, query, where, getDocs, doc, updateDoc } from 'firebase/firestore'
import { db } from '@/lib/firebase'

interface PendingArtist {
  id: string
  name: string
  type?: string
  genre?: string
  bio?: string
  imageUrl?: string
  website?: string
  socialLinks?: Record<string, string>
  submittedAt?: { toDate?: () => Date }
}

export default function AdminArtistsPage() {
  const [artists, setArtists] = useState<PendingArtist[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchPending = async () => {
      try {
        const snap = await getDocs(
          query(collection(db, 'artists'), where('status', '==', 'pending'))
        )
        setArtists(snap.docs.map((d) => ({ id: d.id, ...d.data() }) as PendingArtist))
      } catch (err) {
        console.error('Error fetching pending artists:', err)
      } finally {
        setLoading(false)
      }
    }
    fetchPending()
  }, [])

  const handleAction = async (id: string, status: 'approved' | 'rejected') => {
    setArtists((prev) => prev.filter((a) => a.id !== id))
    try {
      await updateDoc(doc(db, 'artists', id), { status })
    } catch (err) {
      console.error(`Error setting artist to ${status}:`, err)
      const snap = await getDocs(
        query(collection(db, 'artists'), where('status', '==', 'pending'))
      )
      setArtists(snap.docs.map((d) => ({ id: d.id, ...d.data() }) as PendingArtist))
    }
  }

  if (loading) {
    return <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-secondary)' }}>Loading pending artists...</div>
  }

  return (
    <div>
      <h2 style={{
        fontFamily: "'Orbitron', sans-serif",
        fontSize: '1.3rem',
        marginBottom: '1.5rem',
      }} className="pride-gradient-text">
        Pending Artists
      </h2>

      {artists.length === 0 ? (
        <div className="glass-card" style={{ padding: '2rem', textAlign: 'center' }}>
          <p style={{ color: 'var(--text-secondary)' }}>No pending artists to review.</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {artists.map((artist) => (
            <div key={artist.id} className="glass-card" style={{ padding: '1.25rem', display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
              {/* Thumbnail */}
              <div style={{
                width: '100px',
                height: '80px',
                borderRadius: '8px',
                overflow: 'hidden',
                flexShrink: 0,
                background: artist.imageUrl
                  ? `url(${artist.imageUrl}) center/cover`
                  : 'linear-gradient(135deg, rgba(255,0,24,0.3), rgba(255,165,0,0.3))',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}>
                {!artist.imageUrl && <span style={{ fontSize: '1.5rem' }}>🎤</span>}
              </div>

              {/* Details */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <h3 style={{ fontFamily: "'Orbitron', sans-serif", fontSize: '1rem', color: 'var(--text-primary)', marginBottom: '0.25rem' }}>
                  {artist.name}
                </h3>
                {artist.type && <p style={{ fontSize: '0.8rem', color: 'var(--pride-violet)', marginBottom: '0.2rem' }}>{artist.type}</p>}
                {artist.bio && (
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '0.2rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {artist.bio}
                  </p>
                )}
                {artist.socialLinks && Object.keys(artist.socialLinks).length > 0 && (
                  <p style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>
                    Links: {Object.keys(artist.socialLinks).join(', ')}
                  </p>
                )}
                {artist.submittedAt?.toDate && (
                  <p style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
                    Submitted {artist.submittedAt.toDate().toLocaleDateString()}
                  </p>
                )}
              </div>

              {/* Actions */}
              <div style={{ display: 'flex', gap: '0.5rem', flexShrink: 0 }}>
                <button
                  onClick={() => handleAction(artist.id, 'approved')}
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
                  onClick={() => handleAction(artist.id, 'rejected')}
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
