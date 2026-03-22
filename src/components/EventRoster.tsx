'use client'

import { useEffect, useState } from 'react'
import { collection, query, orderBy, getDocs } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { RosterEntry, RosterParticipantType, ROSTER_SECTION_LABELS } from '@/lib/types'

interface EventRosterProps {
  eventId: string
}

export default function EventRoster({ eventId }: EventRosterProps) {
  const [entries, setEntries] = useState<RosterEntry[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchRoster = async () => {
      try {
        const rosterRef = collection(db, 'events', eventId, 'roster')
        const q = query(rosterRef, orderBy('order'))
        const snap = await getDocs(q)
        const data = snap.docs.map((d) => ({ id: d.id, ...d.data() }) as RosterEntry)
        setEntries(data)
      } catch (err) {
        console.error('Error fetching roster:', err)
      } finally {
        setLoading(false)
      }
    }
    if (eventId) fetchRoster()
  }, [eventId])

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-secondary)', fontFamily: "'Exo 2', sans-serif" }}>
        Loading roster...
      </div>
    )
  }

  if (entries.length === 0) return null

  const sections = (Object.keys(ROSTER_SECTION_LABELS) as RosterParticipantType[]).map((type) => ({
    type,
    label: ROSTER_SECTION_LABELS[type],
    entries: entries.filter((e) => e.participantType === type),
  })).filter((s) => s.entries.length > 0)

  return (
    <div style={{ marginBottom: '2rem' }}>
      <h2 style={{
        fontFamily: "'Orbitron', sans-serif",
        fontSize: '1.1rem',
        marginBottom: '1.5rem',
        color: 'var(--text-primary)',
        letterSpacing: '0.05em',
      }}>
        Who&apos;s There
      </h2>
      {sections.map((section) => (
        <div key={section.type} style={{ marginBottom: '2rem' }}>
          <h3 style={{
            fontFamily: "'Orbitron', sans-serif",
            fontSize: '1rem',
            marginBottom: '1rem',
            color: 'var(--text-primary)',
            letterSpacing: '0.05em',
          }}>
            {section.label}
          </h3>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))',
            gap: '1rem',
          }}>
            {section.entries.map((entry) => (
              <div
                key={entry.id}
                style={{
                  background: 'var(--bg-card)',
                  border: '1px solid var(--border-glass)',
                  borderRadius: '16px',
                  padding: '1rem',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '0.5rem',
                  textAlign: 'center',
                }}
              >
                {entry.imageUrl ? (
                  <img
                    src={entry.imageUrl}
                    alt={entry.displayName}
                    style={{
                      width: '72px',
                      height: '72px',
                      borderRadius: '50%',
                      objectFit: 'cover',
                      border: '2px solid var(--border-glass)',
                    }}
                  />
                ) : (
                  <div style={{
                    width: '72px',
                    height: '72px',
                    borderRadius: '50%',
                    background: 'rgba(115,41,130,0.3)',
                    border: '2px solid var(--border-glass)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '1.5rem',
                  }}>
                    🎭
                  </div>
                )}
                <span style={{
                  fontFamily: "'Exo 2', sans-serif",
                  fontWeight: 600,
                  fontSize: '0.85rem',
                  color: 'var(--text-primary)',
                  lineHeight: 1.3,
                }}>
                  {entry.displayName}
                </span>
                <span style={{
                  fontFamily: "'Exo 2', sans-serif",
                  fontSize: '0.7rem',
                  color: 'var(--text-secondary)',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                }}>
                  {ROSTER_SECTION_LABELS[entry.participantType]}
                </span>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}
