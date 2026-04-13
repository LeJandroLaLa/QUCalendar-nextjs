'use client'

import { useEffect, useState } from 'react'
import { collection, query, where, getDocs, doc, updateDoc } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { EVENT_CATEGORIES, EventCategory } from '@/lib/types'

interface PendingEvent {
  id: string
  title: string
  date?: string
  time?: string
  venue?: string
  category?: EventCategory
  description?: string
  imageUrl?: string
  ticketLink?: string
  submittedAt?: { toDate?: () => Date }
}

export default function AdminEventsPage() {
  const [events, setEvents] = useState<PendingEvent[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchPending = async () => {
      try {
        const snap = await getDocs(
          query(collection(db, 'events'), where('status', '==', 'pending'))
        )
        setEvents(snap.docs.map((d) => ({ id: d.id, ...d.data() }) as PendingEvent))
      } catch (err) {
        console.error('Error fetching pending events:', err)
      } finally {
        setLoading(false)
      }
    }
    fetchPending()
  }, [])

  const handleAction = async (id: string, status: 'approved' | 'rejected') => {
    setEvents((prev) => prev.filter((e) => e.id !== id))
    try {
      await updateDoc(doc(db, 'events', id), { status })
    } catch (err) {
      console.error(`Error setting event to ${status}:`, err)
      const snap = await getDocs(
        query(collection(db, 'events'), where('status', '==', 'pending'))
      )
      setEvents(snap.docs.map((d) => ({ id: d.id, ...d.data() }) as PendingEvent))
    }
  }

  if (loading) {
    return <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-secondary)' }}>Loading pending events...</div>
  }

  return (
    <div>
      <h2 style={{
        fontFamily: "'Orbitron', sans-serif",
        fontSize: '1.3rem',
        marginBottom: '1.5rem',
      }} className="pride-gradient-text">
        Pending Events
      </h2>

      {events.length === 0 ? (
        <div className="glass-card" style={{ padding: '2rem', textAlign: 'center' }}>
          <p style={{ color: 'var(--text-secondary)' }}>No pending events to review.</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {events.map((event) => {
            const emoji = event.category != null ? EVENT_CATEGORIES[event.category] : '📅'

            return (
              <div key={event.id} className="glass-card" style={{ padding: '1.25rem', display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
                {/* Thumbnail */}
                <div style={{
                  width: '100px',
                  height: '80px',
                  borderRadius: '8px',
                  overflow: 'hidden',
                  flexShrink: 0,
                  background: event.imageUrl
                    ? `url(${event.imageUrl}) center/cover`
                    : 'linear-gradient(135deg, rgba(117,7,135,0.3), rgba(0,76,255,0.3))',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}>
                  {!event.imageUrl && <span style={{ fontSize: '1.5rem' }}>{emoji}</span>}
                </div>

                {/* Details */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <h3 style={{ fontFamily: "'Orbitron', sans-serif", fontSize: '1rem', color: 'var(--text-primary)', marginBottom: '0.25rem' }}>
                    {event.title}
                  </h3>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '0.25rem' }}>
                    {event.category && (
                      <span style={{
                        fontSize: '0.7rem',
                        padding: '0.1rem 0.5rem',
                        borderRadius: '999px',
                        background: 'rgba(117, 7, 135, 0.2)',
                        color: 'var(--pride-violet)',
                      }}>
                        {emoji} {event.category}
                      </span>
                    )}
                    {event.date && (
                      <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                        {new Date(event.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                        {event.time && ` · ${event.time}`}
                      </span>
                    )}
                  </div>
                  {event.venue && <p style={{ fontSize: '0.8rem', color: 'var(--pride-violet)', marginBottom: '0.2rem' }}>{event.venue}</p>}
                  {event.description && (
                    <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {event.description}
                    </p>
                  )}
                  {event.submittedAt?.toDate && (
                    <p style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
                      Submitted {event.submittedAt.toDate().toLocaleDateString()}
                    </p>
                  )}
                </div>

                {/* Actions */}
                <div style={{ display: 'flex', gap: '0.5rem', flexShrink: 0 }}>
                  <button
                    onClick={() => handleAction(event.id, 'approved')}
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
                    onClick={() => handleAction(event.id, 'rejected')}
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
            )
          })}
        </div>
      )}
    </div>
  )
}
