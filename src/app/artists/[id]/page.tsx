'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { doc, getDoc, collection, query, where, getDocs, limit } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { Artist, QUEvent } from '@/lib/types'
import EventCard from '@/components/EventCard'
import Link from 'next/link'

export default function ArtistDetailPage() {
  const params = useParams()
  const id = params.id as string
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

  return (
    <div>
      <Link href="/artists" style={{ color: 'var(--text-secondary)', textDecoration: 'none', fontSize: '0.9rem' }}>
        ← Back to Artists
      </Link>

      {/* Hero image */}
      {artist.imageUrl && (
        <div style={{
          width: '100%',
          height: '300px',
          borderRadius: '12px',
          overflow: 'hidden',
          marginTop: '1rem',
          backgroundImage: `url(${artist.imageUrl})`,
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
          {artist.name}
        </h1>

        {(artist.type || artist.genre) && (
          <span style={{
            display: 'inline-block',
            padding: '0.3rem 0.8rem',
            borderRadius: '999px',
            background: 'rgba(117, 7, 135, 0.2)',
            fontSize: '0.85rem',
            color: 'var(--pride-violet)',
            marginBottom: '1.5rem',
          }}>
            {artist.type}{artist.type && artist.genre ? ' · ' : ''}{artist.genre}
          </span>
        )}

        {/* Bio */}
        {artist.bio && (
          <div className="glass-card" style={{ padding: '1.5rem', marginBottom: '1.5rem' }}>
            <h3 style={{ fontFamily: "'Orbitron', sans-serif", fontSize: '0.9rem', marginBottom: '0.75rem', color: 'var(--text-primary)' }}>
              Bio
            </h3>
            <p style={{ color: 'var(--text-secondary)', lineHeight: 1.7, whiteSpace: 'pre-wrap' }}>
              {artist.bio}
            </p>
          </div>
        )}

        {/* Links */}
        {(artist.website || (artist.socialLinks && Object.keys(artist.socialLinks).length > 0)) && (
          <div className="glass-card" style={{ padding: '1.5rem', marginBottom: '1.5rem' }}>
            <h3 style={{ fontFamily: "'Orbitron', sans-serif", fontSize: '0.9rem', marginBottom: '0.75rem', color: 'var(--text-primary)' }}>
              Links
            </h3>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem' }}>
              {artist.website && (
                <a
                  href={artist.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    padding: '0.4rem 1rem',
                    borderRadius: '999px',
                    background: 'rgba(117, 7, 135, 0.2)',
                    color: 'var(--pride-violet)',
                    textDecoration: 'none',
                    fontSize: '0.85rem',
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
                    background: 'rgba(255, 255, 255, 0.08)',
                    color: 'var(--text-secondary)',
                    textDecoration: 'none',
                    fontSize: '0.85rem',
                    textTransform: 'capitalize',
                  }}
                >
                  {platform}
                </a>
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
