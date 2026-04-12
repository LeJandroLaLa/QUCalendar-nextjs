'use client'

import Link from 'next/link'
import { QUEvent, EVENT_CATEGORIES } from '@/lib/types'

export default function EventCard({ event }: { event: QUEvent }) {
  const emoji = event.category != null ? EVENT_CATEGORIES[event.category] : '📅'

  return (
    <Link href={`/events/${event.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
      <div className="glass-card" style={{
        overflow: 'hidden',
        cursor: 'pointer',
        transition: 'transform 0.2s, border-color 0.2s',
      }}>
        {event.imageUrl && (
          <div style={{
            width: '100%',
            height: '160px',
            backgroundImage: `url(${event.imageUrl})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }} />
        )}
        <div style={{ padding: '1rem' }}>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            marginBottom: '0.5rem',
          }}>
            <h3 style={{
              fontFamily: "'Orbitron', sans-serif",
              fontSize: '0.95rem',
              color: 'var(--text-primary)',
              flex: 1,
            }}>
              {event.title}
            </h3>
            <span style={{ fontSize: '1.2rem', marginLeft: '0.5rem', flexShrink: 0 }}>{emoji}</span>
          </div>
          <p style={{
            fontSize: '0.85rem',
            color: 'var(--text-secondary)',
            marginBottom: '0.25rem',
          }}>
            {new Date(event.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
            {event.time && ` · ${event.time}`}
          </p>
          {event.venue && (
            <p style={{ fontSize: '0.8rem', color: 'var(--pride-violet)' }}>
              {event.venue}
            </p>
          )}
          <span style={{
            display: 'inline-block',
            marginTop: '0.5rem',
            padding: '0.2rem 0.6rem',
            borderRadius: '999px',
            background: 'rgba(255, 255, 255, 0.08)',
            fontSize: '0.7rem',
            color: 'var(--text-secondary)',
          }}>
            {emoji} {event.category}
          </span>
        </div>
      </div>
    </Link>
  )
}
