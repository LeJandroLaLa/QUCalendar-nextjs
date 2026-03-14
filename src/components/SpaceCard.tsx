'use client'

import Link from 'next/link'
import { Space } from '@/lib/types'

export default function SpaceCard({ space }: { space: Space }) {
  return (
    <Link href={`/spaces/${space.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
      <div className="glass-card" style={{
        overflow: 'hidden',
        cursor: 'pointer',
        transition: 'transform 0.2s, border-color 0.2s',
      }}>
        {space.imageUrl ? (
          <div style={{
            width: '100%',
            height: '160px',
            backgroundImage: `url(${space.imageUrl})`,
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
            {space.name}
          </h3>
          {space.type && (
            <p style={{
              fontSize: '0.8rem',
              color: 'var(--pride-violet)',
              marginBottom: '0.25rem',
            }}>
              {space.type}
            </p>
          )}
          {space.address && (
            <p style={{
              fontSize: '0.8rem',
              color: 'var(--text-secondary)',
            }}>
              {space.address}
            </p>
          )}
        </div>
      </div>
    </Link>
  )
}
