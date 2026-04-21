'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { collection, query, where, getDocs } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { useAuth } from '@/context/AuthContext'
import { QUEvent, Space, Artist } from '@/lib/types'
import RegionSelector from '@/components/RegionSelector'

const cardStyle: React.CSSProperties = {
  background: 'var(--bg-card)',
  border: '1px solid var(--border-glass)',
  borderRadius: 16,
  padding: '1.5rem',
}

const sectionHeadingStyle: React.CSSProperties = {
  fontFamily: "'Orbitron', sans-serif",
  fontSize: '1.1rem',
  marginBottom: '1.25rem',
  color: 'var(--text-primary)',
}

const btnPrimaryStyle: React.CSSProperties = {
  display: 'inline-block',
  padding: '0.55rem 1.25rem',
  borderRadius: 10,
  background: 'rgba(77,121,255,0.18)',
  border: '1px solid var(--pride-blue)',
  color: 'var(--pride-blue)',
  fontFamily: "'Exo 2', sans-serif",
  fontSize: '0.9rem',
  fontWeight: 600,
  cursor: 'pointer',
  textDecoration: 'none',
}

const btnEditStyle: React.CSSProperties = {
  display: 'inline-block',
  padding: '0.35rem 0.9rem',
  borderRadius: 8,
  background: 'rgba(255,255,255,0.07)',
  border: '1px solid var(--border-glass)',
  color: 'var(--text-secondary)',
  fontFamily: "'Exo 2', sans-serif",
  fontSize: '0.8rem',
  cursor: 'pointer',
  textDecoration: 'none',
}

const itemRowStyle: React.CSSProperties = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  padding: '0.85rem 1rem',
  background: 'rgba(255,255,255,0.04)',
  borderRadius: 10,
  border: '1px solid var(--border-glass)',
  flexWrap: 'wrap',
  gap: '0.5rem',
}

function StatusBadge({ status }: { status: string }) {
  const color =
    status === 'approved'
      ? 'var(--pride-green)'
      : status === 'rejected'
      ? 'var(--pride-red)'
      : 'var(--pride-blue)'

  return (
    <span style={{
      display: 'inline-block',
      padding: '0.2rem 0.65rem',
      borderRadius: '999px',
      background: status === 'approved'
        ? 'rgba(0,168,50,0.18)'
        : status === 'rejected'
        ? 'rgba(255,59,59,0.18)'
        : 'rgba(77,121,255,0.18)',
      color,
      fontSize: '0.75rem',
      fontFamily: "'Exo 2', sans-serif",
      fontWeight: 600,
      textTransform: 'capitalize',
    }}>
      {status}
    </span>
  )
}

export default function DashboardPage() {
  const { user, quUser, loading, signOut } = useAuth()
  const router = useRouter()

  const [events, setEvents] = useState<QUEvent[]>([])
  const [spaces, setSpaces] = useState<Space[]>([])
  const [artistProfile, setArtistProfile] = useState<Artist | null>(null)
  const [dataLoading, setDataLoading] = useState(true)

  const [inviteEmail, setInviteEmail] = useState('')
  const [inviteSent, setInviteSent] = useState(false)

  useEffect(() => {
    if (!loading && !user) {
      router.replace('/partner')
    }
  }, [loading, user, router])

  useEffect(() => {
    if (!user || !quUser) return

    const fetchAll = async () => {
      setDataLoading(true)
      try {
        const [evByOrg, evByCreator] = await Promise.all([
          getDocs(query(collection(db, 'events'), where('organizerId', '==', user.uid))),
          getDocs(query(collection(db, 'events'), where('createdBy', '==', user.uid))),
        ])
        const eventMap = new Map<string, QUEvent>()
        ;[...evByOrg.docs, ...evByCreator.docs].forEach(d => {
          eventMap.set(d.id, { id: d.id, ...d.data() } as QUEvent)
        })
        setEvents(Array.from(eventMap.values()))

        if (quUser.roles.includes('space-manager')) {
          const [spByOwner, spByManager] = await Promise.all([
            getDocs(query(collection(db, 'spaces'), where('ownerUid', '==', user.uid))),
            getDocs(query(collection(db, 'spaces'), where('spaceManagerIds', 'array-contains', user.uid))),
          ])
          const spaceMap = new Map<string, Space>()
          ;[...spByOwner.docs, ...spByManager.docs].forEach(d => {
            spaceMap.set(d.id, { id: d.id, ...d.data() } as Space)
          })
          setSpaces(Array.from(spaceMap.values()))
        }

        if (quUser.roles.includes('artist')) {
          const artistSnap = await getDocs(
            query(collection(db, 'artists'), where('managedByUserId', '==', user.uid))
          )
          if (!artistSnap.empty) {
            const d = artistSnap.docs[0]
            setArtistProfile({ id: d.id, ...d.data() } as Artist)
          }
        }
      } catch (err) {
        console.error('Error fetching dashboard data:', err)
      } finally {
        setDataLoading(false)
      }
    }

    fetchAll()
  }, [user, quUser])

  const handleSignOut = async () => {
    await signOut()
    router.push('/')
  }

  const handleSendInvite = (e: React.FormEvent) => {
    e.preventDefault()
    if (inviteEmail.trim()) {
      setInviteSent(true)
    }
  }

  if (loading || !user || !quUser) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'var(--bg-dark)',
      }}>
        <p style={{ fontFamily: "'Exo 2', sans-serif", color: 'var(--text-secondary)' }}>Loading…</p>
      </div>
    )
  }

  const isSpaceManager = quUser.roles.includes('space-manager')
  const isArtist = quUser.roles.includes('artist')
  const isAdmin = quUser.roles.includes('admin')
  const isModerator = !!(quUser.moderatorRegions && quUser.moderatorRegions.length > 0)
  const canInvite = isArtist || isAdmin
  const showRegionSelector = isArtist || isModerator

  return (
    <div style={{
      minHeight: '100vh',
      background: 'var(--bg-dark)',
      padding: '2rem',
    }}>
      <div style={{ maxWidth: 1200, margin: '0 auto' }}>

        {/* Header */}
        <div style={{ marginBottom: '2.5rem' }}>
          <h1
            className="pride-gradient-text"
            style={{
              fontFamily: "'Orbitron', sans-serif",
              fontSize: 'clamp(1.8rem, 5vw, 2.8rem)',
              fontWeight: 900,
              letterSpacing: '2px',
              margin: 0,
            }}
          >
            Dashboard
          </h1>
          <p style={{
            fontFamily: "'Exo 2', sans-serif",
            color: 'var(--text-secondary)',
            fontSize: '1.05rem',
            marginTop: '0.5rem',
          }}>
            {quUser.displayName}
          </p>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>

          {/* Profile Section */}
          {showRegionSelector && (
            <div style={cardStyle}>
              <h2 style={sectionHeadingStyle}>Profile</h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                <div>
                  <p style={{
                    fontFamily: "'Exo 2', sans-serif",
                    fontSize: '0.8rem',
                    color: 'var(--text-secondary)',
                    margin: '0 0 0.4rem',
                    fontWeight: 600,
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                  }}>
                    Display Name
                  </p>
                  <p style={{
                    fontFamily: "'Exo 2', sans-serif",
                    color: 'var(--text-primary)',
                    fontSize: '0.95rem',
                    margin: 0,
                  }}>
                    {quUser.displayName}
                  </p>
                </div>
                <div>
                  <p style={{
                    fontFamily: "'Exo 2', sans-serif",
                    fontSize: '0.8rem',
                    color: 'var(--text-secondary)',
                    margin: '0 0 0.4rem',
                    fontWeight: 600,
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                  }}>
                    Region
                  </p>
                  <RegionSelector />
                  <p style={{
                    fontFamily: "'Exo 2', sans-serif",
                    fontSize: '0.75rem',
                    color: 'var(--text-secondary)',
                    margin: '0.5rem 0 0',
                    opacity: 0.7,
                  }}>
                    Your region determines your local community and moderation scope
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Section 1 — My Events (all authenticated users) */}
          <div style={cardStyle}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: '0.75rem',
              marginBottom: '1.25rem',
            }}>
              <h2 style={{ ...sectionHeadingStyle, marginBottom: 0 }}>My Events</h2>
              <Link href="/submit/event" style={btnPrimaryStyle}>+ Submit New Event</Link>
            </div>

            {dataLoading ? (
              <p style={{ color: 'var(--text-secondary)', fontFamily: "'Exo 2', sans-serif", fontSize: '0.9rem' }}>
                Loading…
              </p>
            ) : events.length === 0 ? (
              <p style={{ color: 'var(--text-secondary)', fontFamily: "'Exo 2', sans-serif", fontSize: '0.9rem' }}>
                No events yet — submit your first event
              </p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {events.map(ev => (
                  <div key={ev.id} style={itemRowStyle}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                      <span style={{
                        fontFamily: "'Exo 2', sans-serif",
                        fontWeight: 600,
                        color: 'var(--text-primary)',
                        fontSize: '0.95rem',
                      }}>
                        {ev.title}
                      </span>
                      {ev.date && (
                        <span style={{
                          fontFamily: "'Exo 2', sans-serif",
                          color: 'var(--text-secondary)',
                          fontSize: '0.8rem',
                        }}>
                          {ev.date}
                        </span>
                      )}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
                      <StatusBadge status={ev.status} />
                      <Link href={`/events/${ev.id}`} style={btnEditStyle}>Edit</Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Section 2 — My Spaces (space-manager role) */}
          {isSpaceManager && (
            <div style={cardStyle}>
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: '0.75rem',
                marginBottom: '1.25rem',
              }}>
                <h2 style={{ ...sectionHeadingStyle, marginBottom: 0 }}>My Spaces</h2>
                <Link href="/submit/space" style={btnPrimaryStyle}>+ Submit New Space</Link>
              </div>

              {dataLoading ? (
                <p style={{ color: 'var(--text-secondary)', fontFamily: "'Exo 2', sans-serif", fontSize: '0.9rem' }}>
                  Loading…
                </p>
              ) : spaces.length === 0 ? (
                <p style={{ color: 'var(--text-secondary)', fontFamily: "'Exo 2', sans-serif", fontSize: '0.9rem' }}>
                  No spaces yet
                </p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  {spaces.map(sp => (
                    <div key={sp.id} style={itemRowStyle}>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                        <span style={{
                          fontFamily: "'Exo 2', sans-serif",
                          fontWeight: 600,
                          color: 'var(--text-primary)',
                          fontSize: '0.95rem',
                        }}>
                          {sp.name}
                          {sp.braveSpace && (
                            <span style={{
                              marginLeft: '0.5rem',
                              padding: '0.15rem 0.5rem',
                              borderRadius: '999px',
                              background: 'rgba(0,180,180,0.18)',
                              color: 'var(--accent)',
                              fontSize: '0.7rem',
                              fontFamily: "'Exo 2', sans-serif",
                              fontWeight: 600,
                            }}>
                              Brave Space
                            </span>
                          )}
                        </span>
                        {sp.type && (
                          <span style={{
                            fontFamily: "'Exo 2', sans-serif",
                            color: 'var(--text-secondary)',
                            fontSize: '0.8rem',
                          }}>
                            {sp.type}
                          </span>
                        )}
                      </div>
                      <Link href={`/spaces/${sp.id}`} style={btnEditStyle}>Edit</Link>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Section 3 — My Artist Profile (artist role) */}
          {isArtist && (
            <div style={cardStyle}>
              <h2 style={sectionHeadingStyle}>My Artist Profile</h2>

              {dataLoading ? (
                <p style={{ color: 'var(--text-secondary)', fontFamily: "'Exo 2', sans-serif", fontSize: '0.9rem' }}>
                  Loading…
                </p>
              ) : artistProfile ? (
                <div style={itemRowStyle}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                    <span style={{
                      fontFamily: "'Exo 2', sans-serif",
                      fontWeight: 600,
                      color: 'var(--text-primary)',
                      fontSize: '0.95rem',
                    }}>
                      {artistProfile.name}
                    </span>
                    {artistProfile.status && <StatusBadge status={artistProfile.status} />}
                  </div>
                  <Link href={`/artists/${artistProfile.id}`} style={btnEditStyle}>Edit Profile</Link>
                </div>
              ) : (
                <div>
                  <p style={{
                    color: 'var(--text-secondary)',
                    fontFamily: "'Exo 2', sans-serif",
                    fontSize: '0.9rem',
                    marginBottom: '1rem',
                  }}>
                    No artist profile yet.
                  </p>
                  <Link href="/submit/artist" style={btnPrimaryStyle}>Set up your artist profile</Link>
                </div>
              )}
            </div>
          )}

          {/* Section 4 — Invite Artists (artist or admin role) */}
          {canInvite && (
            <div style={cardStyle}>
              <h2 style={sectionHeadingStyle}>Invite Artists</h2>
              <p style={{
                fontFamily: "'Exo 2', sans-serif",
                color: 'var(--text-secondary)',
                fontSize: '0.9rem',
                marginBottom: '1rem',
              }}>
                Remaining invites this week:{' '}
                <strong style={{ color: 'var(--pride-violet)' }}>3</strong>
              </p>

              {inviteSent ? (
                <p style={{
                  color: 'var(--pride-green)',
                  fontFamily: "'Exo 2', sans-serif",
                  fontSize: '0.9rem',
                }}>
                  Invite sent to {inviteEmail}!
                </p>
              ) : (
                <form onSubmit={handleSendInvite} style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                  <input
                    type="email"
                    value={inviteEmail}
                    onChange={e => setInviteEmail(e.target.value)}
                    placeholder="artist@email.com"
                    required
                    style={{
                      flex: '1 1 200px',
                      padding: '0.65rem 1rem',
                      borderRadius: 10,
                      border: '1px solid var(--border-glass)',
                      background: 'rgba(255,255,255,0.05)',
                      color: 'var(--text-primary)',
                      fontFamily: "'Exo 2', sans-serif",
                      fontSize: '0.9rem',
                      outline: 'none',
                    }}
                  />
                  <button
                    type="submit"
                    style={{
                      display: 'inline-block',
                      padding: '0.55rem 1.25rem',
                      borderRadius: 10,
                      background: 'rgba(155,61,184,0.18)',
                      border: '1px solid var(--pride-violet)',
                      color: 'var(--pride-violet)',
                      fontFamily: "'Exo 2', sans-serif",
                      fontSize: '0.9rem',
                      fontWeight: 600,
                      cursor: 'pointer',
                    }}
                  >
                    Send Invite
                  </button>
                </form>
              )}

              <p style={{
                fontFamily: "'Exo 2', sans-serif",
                color: 'var(--text-secondary)',
                fontSize: '0.75rem',
                marginTop: '0.75rem',
                opacity: 0.7,
              }}>
                Invites reset every Monday
              </p>
            </div>
          )}

          {/* Section 5 — Admin Panel (admin role) */}
          {isAdmin && (
            <div style={cardStyle}>
              <Link
                href="/admin"
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  textDecoration: 'none',
                }}
              >
                <h2 style={{ ...sectionHeadingStyle, marginBottom: 0 }}>Admin Panel</h2>
                <span style={{ fontSize: '1.4rem', color: 'var(--text-secondary)' }}>→</span>
              </Link>
            </div>
          )}

          {/* Sign Out */}
          <div style={{ paddingBottom: '2rem' }}>
            <button
              onClick={handleSignOut}
              style={{
                padding: '0.65rem 1.5rem',
                borderRadius: 10,
                background: 'rgba(255,59,59,0.12)',
                border: '1px solid var(--pride-red)',
                color: 'var(--pride-red)',
                fontFamily: "'Exo 2', sans-serif",
                fontSize: '0.95rem',
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              Sign Out
            </button>
          </div>

        </div>
      </div>
    </div>
  )
}
