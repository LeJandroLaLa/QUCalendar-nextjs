'use client'

import Link from 'next/link'
import { Artist } from '@/lib/types'

export default function ArtistCard({ artist }: { artist: Artist }) {
  return (
    <Link href={`/artists/${artist.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
      <div className="glass-card" style={{
        overflow: 'hidden',
        cursor: 'pointer',
        transition: 'transform 0.2s, border-color 0.2s',
      }}>
        {artist.imageUrl ? (
          <div style={{
            width: '100%',
            height: '160px',
            backgroundImage: `url(${artist.imageUrl})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }} />
        ) : (
          <div style={{
            width: '100%',
            height: '160px',
            background: 'linear-gradient(135deg, rgba(255, 0, 24, 0.3), rgba(255, 165, 0, 0.3))',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '2.5rem',
          }}>
            🎤
          </div>
        )}
        <div style={{ padding: '1rem' }}>
          <h3 style={{
            fontFamily: "'Orbitron', sans-serif",
            fontSize: '0.95rem',
            color: 'var(--text-primary)',
            marginBottom: '0.5rem',
          }}>
            {artist.name}
          </h3>
          {(artist.type || artist.genre) && (
            <p style={{
              fontSize: '0.8rem',
              color: 'var(--pride-violet)',
            }}>
              {artist.type}{artist.type && artist.genre ? ' · ' : ''}{artist.genre}
            </p>
          )}
        </div>
      </div>
    </Link>
  )
}
