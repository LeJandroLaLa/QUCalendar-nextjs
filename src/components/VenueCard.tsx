'use client'

import Link from 'next/link'
import { Venue } from '@/lib/types'

export default function VenueCard({ venue }: { venue: Venue }) {
  return (
    <Link href={`/venues/${venue.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
      <div className="glass-card" style={{
        overflow: 'hidden',
        cursor: 'pointer',
        transition: 'transform 0.2s, border-color 0.2s',
      }}>
        {venue.imageUrl ? (
          <div style={{
            width: '100%',
            height: '160px',
            backgroundImage: `url(${venue.imageUrl})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }} />
        ) : (
          <div style={{
            width: '100%',
            height: '160px',
            background: 'linear-gradient(135deg, rgba(117, 7, 135, 0.3), rgba(0, 76, 255, 0.3))',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '2.5rem',
          }}>
            🏠
          </div>
        )}
        <div style={{ padding: '1rem' }}>
          <h3 style={{
            fontFamily: "'Orbitron', sans-serif",
            fontSize: '0.95rem',
            color: 'var(--text-primary)',
            marginBottom: '0.5rem',
          }}>
            {venue.name}
          </h3>
          {venue.type && (
            <p style={{
              fontSize: '0.8rem',
              color: 'var(--pride-violet)',
              marginBottom: '0.25rem',
            }}>
              {venue.type}
            </p>
          )}
          {venue.address && (
            <p style={{
              fontSize: '0.8rem',
              color: 'var(--text-secondary)',
            }}>
              {venue.address}
            </p>
          )}
        </div>
      </div>
    </Link>
  )
}
