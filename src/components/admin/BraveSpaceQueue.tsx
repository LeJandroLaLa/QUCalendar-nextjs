'use client'

import { useEffect, useState } from 'react'
import { collection, query, where, getDocs, doc, updateDoc, serverTimestamp } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { useAuth } from '@/hooks/useAuth'

interface AccessibilityData {
  wheelchairAccessible?: boolean
  rampDetails?: string | null
  elevatorStatus?: string | null
  strobeWarning?: boolean
  volumeEnvironment?: string | null
  parkingDetails?: string | null
  additionalNotes?: string | null
}

interface BraveSpaceData {
  submittedAt?: { toDate?: () => Date } | null
  accountabilityPolicyUrl?: string | null
  accountabilityPolicyText?: string | null
  accessibility?: AccessibilityData
  genderNeutralRestrooms?: boolean
  genderNeutralRestroomsNotes?: string | null
  deEscalationPolicyText?: string | null
  deEscalationPolicyUrl?: string | null
  prioritizesDeEscalationOverPolice?: boolean
}

interface PendingItem {
  id: string
  name: string
  braveSpace: BraveSpaceData
}

type ReviewAction = 'certified' | 'suspended' | 'revoked'

const cardStyle: React.CSSProperties = {
  background: 'var(--bg-card)',
  border: '1px solid var(--border-glass)',
  backdropFilter: 'blur(10px)',
  borderRadius: '16px',
  padding: '1.5rem',
}

const sectionLabelStyle: React.CSSProperties = {
  fontFamily: "'Orbitron', sans-serif",
  fontSize: '0.7rem',
  color: 'var(--text-secondary)',
  letterSpacing: '0.08em',
  textTransform: 'uppercase',
  marginBottom: '0.3rem',
}

const policyValueStyle: React.CSSProperties = {
  fontFamily: "'Exo 2', sans-serif",
  fontSize: '0.85rem',
  color: 'var(--text-primary)',
  lineHeight: 1.6,
  whiteSpace: 'pre-wrap',
  wordBreak: 'break-word',
}

function PolicyBlock({ label, url, text }: { label: string; url?: string | null; text?: string | null }) {
  if (!url && !text) return null
  return (
    <div>
      <p style={sectionLabelStyle}>{label}</p>
      {url ? (
        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          style={{ ...policyValueStyle, color: 'var(--accent)', wordBreak: 'break-all' }}
        >
          {url}
        </a>
      ) : (
        <p style={policyValueStyle}>{text}</p>
      )}
    </div>
  )
}

function AccessibilityBlock({ data }: { data?: AccessibilityData }) {
  if (!data) return null
  return (
    <div>
      <p style={sectionLabelStyle}>Accessibility</p>
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
        gap: '0.5rem 1.5rem',
        fontFamily: "'Exo 2', sans-serif",
        fontSize: '0.85rem',
        color: 'var(--text-primary)',
      }}>
        <span>♿ Wheelchair accessible: <strong>{data.wheelchairAccessible ? 'Yes' : 'No'}</strong></span>
        <span>🔔 Strobe warning: <strong>{data.strobeWarning ? 'Yes' : 'No'}</strong></span>
        <span>🔊 Volume: <strong>{data.volumeEnvironment ?? '—'}</strong></span>
        <span>🛗 Elevator: <strong>{data.elevatorStatus ?? '—'}</strong></span>
        {data.rampDetails && <span>Ramp: {data.rampDetails}</span>}
        {data.parkingDetails && <span>Parking: {data.parkingDetails}</span>}
        {data.additionalNotes && (
          <span style={{ gridColumn: '1 / -1' }}>Notes: {data.additionalNotes}</span>
        )}
      </div>
    </div>
  )
}

export default function BraveSpaceQueue() {
  const { user } = useAuth()
  const [items, setItems] = useState<PendingItem[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchQueue = async () => {
      try {
        const snap = await getDocs(
          query(collection(db, 'spaces'), where('braveSpace.status', '==', 'pending'))
        )
        const results = snap.docs.map(d => ({ id: d.id, ...d.data() }) as PendingItem)
        results.sort((a, b) => {
          const aTime = a.braveSpace?.submittedAt?.toDate?.()?.getTime() ?? 0
          const bTime = b.braveSpace?.submittedAt?.toDate?.()?.getTime() ?? 0
          return aTime - bTime
        })
        setItems(results)
      } catch (err) {
        console.error('Error fetching Brave Space queue:', err)
      } finally {
        setLoading(false)
      }
    }
    fetchQueue()
  }, [])

  const handleAction = async (id: string, action: ReviewAction) => {
    setItems(prev => prev.filter(item => item.id !== id))
    try {
      const update: Record<string, unknown> = {
        'braveSpace.status': action,
        'braveSpace.reviewedBy': user?.uid ?? null,
      }
      if (action === 'certified') {
        update['braveSpace.certifiedAt'] = serverTimestamp()
      }
      await updateDoc(doc(db, 'spaces', id), update)
    } catch (err) {
      console.error(`Error updating Brave Space status to ${action}:`, err)
      const snap = await getDocs(
        query(collection(db, 'spaces'), where('braveSpace.status', '==', 'pending'))
      )
      const results = snap.docs.map(d => ({ id: d.id, ...d.data() }) as PendingItem)
      results.sort((a, b) => {
        const aTime = a.braveSpace?.submittedAt?.toDate?.()?.getTime() ?? 0
        const bTime = b.braveSpace?.submittedAt?.toDate?.()?.getTime() ?? 0
        return aTime - bTime
      })
      setItems(results)
    }
  }

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-secondary)', fontFamily: "'Exo 2', sans-serif" }}>
        Loading Brave Space applications…
      </div>
    )
  }

  return (
    <div>
      <h2 style={{
        fontFamily: "'Orbitron', sans-serif",
        fontSize: '1.3rem',
        marginBottom: '1.5rem',
        letterSpacing: '0.05em',
      }} className="pride-gradient-text">
        Brave Space Applications
      </h2>

      {items.length === 0 ? (
        <div style={{ ...cardStyle, textAlign: 'center', padding: '2rem' }}>
          <p style={{ color: 'var(--text-secondary)', fontFamily: "'Exo 2', sans-serif" }}>
            No pending Brave Space applications.
          </p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {items.map(item => {
            const submittedDate = item.braveSpace?.submittedAt?.toDate?.()
            const bs = item.braveSpace

            return (
              <div key={item.id} style={cardStyle}>
                {/* Header row */}
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'flex-start',
                  flexWrap: 'wrap',
                  gap: '1rem',
                  marginBottom: '1.25rem',
                }}>
                  <div>
                    <h3 style={{
                      fontFamily: "'Orbitron', sans-serif",
                      fontSize: '1rem',
                      color: 'var(--text-primary)',
                      marginBottom: '0.25rem',
                    }}>
                      {item.name}
                    </h3>
                    {submittedDate && (
                      <p style={{ fontFamily: "'Exo 2', sans-serif", fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                        Submitted {submittedDate.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                      </p>
                    )}
                  </div>

                  {/* Action buttons */}
                  <div style={{ display: 'flex', gap: '0.5rem', flexShrink: 0 }}>
                    <button
                      onClick={() => handleAction(item.id, 'certified')}
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
                      onClick={() => handleAction(item.id, 'suspended')}
                      style={{
                        padding: '0.5rem 1rem',
                        borderRadius: '8px',
                        border: '1px solid var(--pride-orange)',
                        background: 'transparent',
                        color: 'var(--pride-orange)',
                        fontFamily: "'Exo 2', sans-serif",
                        fontWeight: 600,
                        fontSize: '0.8rem',
                        cursor: 'pointer',
                      }}
                    >
                      Suspend
                    </button>
                    <button
                      onClick={() => handleAction(item.id, 'revoked')}
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
                      Revoke
                    </button>
                  </div>
                </div>

                {/* Submitted content */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  <PolicyBlock
                    label="Accountability Policy"
                    url={bs?.accountabilityPolicyUrl}
                    text={bs?.accountabilityPolicyText}
                  />
                  <PolicyBlock
                    label="De-escalation Policy"
                    url={bs?.deEscalationPolicyUrl}
                    text={bs?.deEscalationPolicyText}
                  />
                  <AccessibilityBlock data={bs?.accessibility} />

                  <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap', fontFamily: "'Exo 2', sans-serif", fontSize: '0.85rem', color: 'var(--text-primary)' }}>
                    <span>
                      🚻 Gender-neutral restrooms:{' '}
                      <strong>{bs?.genderNeutralRestrooms ? 'Yes' : 'No'}</strong>
                      {bs?.genderNeutralRestroomsNotes && ` — ${bs.genderNeutralRestroomsNotes}`}
                    </span>
                    {bs?.prioritizesDeEscalationOverPolice && (
                      <span style={{ color: 'var(--pride-green)' }}>
                        ✓ Prioritizes de-escalation over police
                      </span>
                    )}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
