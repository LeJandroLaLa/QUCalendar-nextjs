'use client'

import { useEffect, useState } from 'react'
import { collection, query, where, getDocs, orderBy, limit, onSnapshot } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import Link from 'next/link'
import { useAuth } from '@/hooks/useAuth'
import { generateInvite } from '@/lib/invites'
import { getAllRegions } from '@/lib/regions'
import type { QUInvite, QURegion } from '@/lib/types'

interface RecentItem {
  id: string
  type: 'space' | 'artist' | 'event'
  name: string
  status: string
  submittedAt: string
}

export default function AdminDashboard() {
  const { user, quUser } = useAuth()
  const [counts, setCounts] = useState({ pendingSpaces: 0, pendingArtists: 0, pendingEvents: 0 })
  const [recent, setRecent] = useState<RecentItem[]>([])
  const [loading, setLoading] = useState(true)

  const [inviteEmail, setInviteEmail] = useState('')
  const [inviteRole, setInviteRole] = useState<'artist' | 'venue' | 'moderator'>('artist')
  const [inviteRegionId, setInviteRegionId] = useState('')
  const [inviteUrl, setInviteUrl] = useState('')
  const [inviteLoading, setInviteLoading] = useState(false)
  const [inviteError, setInviteError] = useState('')
  const [copied, setCopied] = useState(false)
  const [invites, setInvites] = useState<QUInvite[]>([])
  const [regions, setRegions] = useState<QURegion[]>([])

  const isAdmin = quUser?.roles.includes('admin') ?? false
  const isSuperAdmin = quUser?.roles.includes('superadmin') ?? false

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [pv, pa, pe] = await Promise.all([
          getDocs(query(collection(db, 'spaces'), where('status', '==', 'pending'))),
          getDocs(query(collection(db, 'artists'), where('status', '==', 'pending'))),
          getDocs(query(collection(db, 'events'), where('status', '==', 'pending'))),
        ])
        setCounts({
          pendingSpaces: pv.size,
          pendingArtists: pa.size,
          pendingEvents: pe.size,
        })

        const recentItems: RecentItem[] = []
        const collections = [
          { name: 'spaces', type: 'space' as const, field: 'name' },
          { name: 'artists', type: 'artist' as const, field: 'name' },
          { name: 'events', type: 'event' as const, field: 'title' },
        ]

        for (const col of collections) {
          try {
            const snap = await getDocs(
              query(collection(db, col.name), orderBy('submittedAt', 'desc'), limit(5))
            )
            snap.docs.forEach((doc) => {
              const data = doc.data()
              recentItems.push({
                id: doc.id,
                type: col.type,
                name: data[col.field] || 'Untitled',
                status: data.status || 'unknown',
                submittedAt: data.submittedAt?.toDate?.()?.toLocaleDateString() || '',
              })
            })
          } catch {
            // Index may not exist yet, skip
          }
        }

        recentItems.sort((a, b) => b.submittedAt.localeCompare(a.submittedAt))
        setRecent(recentItems.slice(0, 10))
      } catch (err) {
        console.error('Error fetching admin data:', err)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  useEffect(() => {
    if (!isAdmin) return
    const q = query(collection(db, 'invites'), orderBy('createdAt', 'desc'), limit(20))
    const unsub = onSnapshot(q, (snap) => {
      setInvites(snap.docs.map(d => d.data() as QUInvite))
    })
    return unsub
  }, [isAdmin])

  useEffect(() => {
    if (!isAdmin) return
    getAllRegions().then((r) => {
      setRegions(r)
      if (r.length > 0) setInviteRegionId(r[0].id)
    })
  }, [isAdmin])

  const handleSendInvite = async () => {
    setInviteError('')
    setInviteUrl('')
    if (!inviteEmail.trim()) {
      setInviteError('Please enter an email address.')
      return
    }
    if (!inviteRegionId) {
      setInviteError('Please select a region.')
      return
    }
    if (!user) return
    setInviteLoading(true)
    try {
      const url = await generateInvite(inviteEmail.trim(), user.uid, inviteRole, inviteRegionId)
      setInviteUrl(url)
      setInviteEmail('')
    } catch {
      setInviteError('Failed to generate invite. Please try again.')
    } finally {
      setInviteLoading(false)
    }
  }

  const handleCopy = () => {
    navigator.clipboard.writeText(inviteUrl)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const summaryCards = [
    { label: 'Pending Spaces', count: counts.pendingSpaces, href: '/admin/spaces', color: 'var(--pride-red)' },
    { label: 'Pending Artists', count: counts.pendingArtists, href: '/admin/artists', color: 'var(--pride-orange)' },
    { label: 'Pending Events', count: counts.pendingEvents, href: '/admin/events', color: 'var(--pride-violet)' },
  ]

  const statusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'var(--pride-orange)'
      case 'approved': return 'var(--pride-green)'
      case 'rejected': return 'var(--pride-red)'
      default: return 'var(--text-secondary)'
    }
  }

  const formatTs = (ts: QUInvite['createdAt'] | QUInvite['usedAt']): string => {
    if (!ts) return ''
    try {
      return ts.toDate().toLocaleDateString()
    } catch {
      return ''
    }
  }

  if (loading) {
    return <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-secondary)' }}>Loading dashboard...</div>
  }

  return (
    <div>
      <h2 style={{
        fontFamily: "'Orbitron', sans-serif",
        fontSize: '1.3rem',
        marginBottom: '1.5rem',
      }} className="pride-gradient-text">
        Admin Dashboard
      </h2>

      {/* Summary cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
        {summaryCards.map((card) => (
          <Link key={card.href} href={card.href} style={{ textDecoration: 'none' }}>
            <div className="glass-card" style={{ padding: '1.5rem', textAlign: 'center', cursor: 'pointer' }}>
              <p style={{ fontSize: '2.5rem', fontFamily: "'Orbitron', sans-serif", color: card.color, marginBottom: '0.5rem' }}>
                {card.count}
              </p>
              <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>{card.label}</p>
            </div>
          </Link>
        ))}
      </div>

      {/* Quick actions */}
      <div className="glass-card" style={{ padding: '1.25rem', marginBottom: '2rem' }}>
        <h3 style={{ fontFamily: "'Orbitron', sans-serif", fontSize: '0.9rem', marginBottom: '1rem', color: 'var(--text-primary)' }}>
          Quick Actions
        </h3>
        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
          {summaryCards.map((card) => (
            <Link key={card.href} href={card.href} style={{
              padding: '0.5rem 1.25rem',
              borderRadius: '8px',
              background: 'rgba(117, 7, 135, 0.2)',
              color: 'var(--text-primary)',
              textDecoration: 'none',
              fontFamily: "'Exo 2', sans-serif",
              fontSize: '0.85rem',
              fontWeight: 600,
            }}>
              Review {card.label.replace('Pending ', '')} →
            </Link>
          ))}
        </div>
      </div>

      {/* Recent activity */}
      <div className="glass-card" style={{ padding: '1.25rem', marginBottom: '2rem' }}>
        <h3 style={{ fontFamily: "'Orbitron', sans-serif", fontSize: '0.9rem', marginBottom: '1rem', color: 'var(--text-primary)' }}>
          Recent Activity
        </h3>
        {recent.length > 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {recent.map((item) => (
              <div key={`${item.type}-${item.id}`} style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '0.6rem 0',
                borderBottom: '1px solid var(--border-glass)',
              }}>
                <div>
                  <span style={{
                    fontSize: '0.7rem',
                    textTransform: 'uppercase',
                    color: 'var(--text-secondary)',
                    marginRight: '0.5rem',
                    letterSpacing: '0.05em',
                  }}>
                    {item.type}
                  </span>
                  <span style={{ fontSize: '0.9rem', color: 'var(--text-primary)' }}>{item.name}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <span style={{
                    fontSize: '0.75rem',
                    padding: '0.15rem 0.6rem',
                    borderRadius: '999px',
                    background: `${statusColor(item.status)}22`,
                    color: statusColor(item.status),
                  }}>
                    {item.status}
                  </span>
                  {item.submittedAt && (
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{item.submittedAt}</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>No recent activity.</p>
        )}
      </div>

      {/* Invite Manager — admin-role only */}
      {isAdmin && (
        <div className="glass-card" style={{ padding: '1.25rem' }}>
          <h3 style={{ fontFamily: "'Orbitron', sans-serif", fontSize: '0.9rem', marginBottom: '1.25rem', color: 'var(--text-primary)' }}>
            Invite Manager
          </h3>

          {/* Send invite form */}
          <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', alignItems: 'flex-start', marginBottom: '1rem' }}>
            <input
              type="email"
              placeholder="Email address"
              value={inviteEmail}
              onChange={(e: { target: { value: string } }) => setInviteEmail(e.target.value)}
              onKeyDown={(e: { key: string }) => e.key === 'Enter' && handleSendInvite()}
              style={{
                flex: 1,
                minWidth: '220px',
                padding: '10px 16px',
                height: '44px',
                borderRadius: '8px',
                border: '1px solid var(--border-glass)',
                background: 'rgba(255,255,255,0.05)',
                color: 'var(--text-primary)',
                fontFamily: "'Exo 2', sans-serif",
                fontSize: '0.9rem',
                outline: 'none',
                boxSizing: 'border-box',
              }}
            />
            <select
              value={inviteRole}
              onChange={(e) => setInviteRole(e.target.value as 'artist' | 'venue' | 'moderator')}
              style={{
                padding: '10px 12px',
                height: '44px',
                borderRadius: '8px',
                border: '1px solid var(--border-glass)',
                background: 'rgba(255,255,255,0.05)',
                color: 'var(--text-primary)',
                fontFamily: "'Exo 2', sans-serif",
                fontSize: '0.9rem',
                outline: 'none',
                cursor: 'pointer',
              }}
            >
              <option value="artist">Artist</option>
              <option value="venue">Venue</option>
              {isSuperAdmin && <option value="moderator">Moderator</option>}
            </select>
            <select
              value={inviteRegionId}
              onChange={(e) => setInviteRegionId(e.target.value)}
              style={{
                padding: '10px 12px',
                height: '44px',
                borderRadius: '8px',
                border: '1px solid var(--border-glass)',
                background: 'rgba(255,255,255,0.05)',
                color: 'var(--text-primary)',
                fontFamily: "'Exo 2', sans-serif",
                fontSize: '0.9rem',
                outline: 'none',
                cursor: 'pointer',
              }}
            >
              {regions.length === 0 && (
                <option value="">No regions</option>
              )}
              {regions.map((r) => (
                <option key={r.id} value={r.id}>{r.name}</option>
              ))}
            </select>
            <button
              onClick={handleSendInvite}
              disabled={inviteLoading}
              style={{
                padding: '0 1.5rem',
                height: '44px',
                borderRadius: '8px',
                border: 'none',
                background: inviteLoading ? 'rgba(117,7,135,0.3)' : 'rgba(117,7,135,0.5)',
                color: 'var(--text-primary)',
                fontFamily: "'Exo 2', sans-serif",
                fontSize: '0.85rem',
                fontWeight: 600,
                cursor: inviteLoading ? 'not-allowed' : 'pointer',
                opacity: inviteLoading ? 0.7 : 1,
                whiteSpace: 'nowrap',
              }}
            >
              {inviteLoading ? 'Sending…' : 'Send Invite'}
            </button>
          </div>

          {/* Error */}
          {inviteError && (
            <p style={{
              color: 'var(--pride-red)',
              fontFamily: "'Exo 2', sans-serif",
              fontSize: '0.85rem',
              marginBottom: '1rem',
            }}>
              {inviteError}
            </p>
          )}

          {/* Generated URL */}
          {inviteUrl && (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
              padding: '0.75rem 1rem',
              borderRadius: '8px',
              background: 'rgba(0,168,50,0.08)',
              border: '1px solid rgba(0,168,50,0.25)',
              marginBottom: '1.5rem',
              flexWrap: 'wrap',
            }}>
              <span style={{
                flex: 1,
                minWidth: 0,
                fontFamily: "'Exo 2', sans-serif",
                fontSize: '0.8rem',
                color: 'var(--text-secondary)',
                wordBreak: 'break-all',
              }}>
                {inviteUrl}
              </span>
              <button
                onClick={handleCopy}
                style={{
                  padding: '0.35rem 1rem',
                  borderRadius: '6px',
                  border: '1px solid rgba(0,168,50,0.4)',
                  background: copied ? 'rgba(0,168,50,0.25)' : 'rgba(0,168,50,0.1)',
                  color: 'var(--pride-green)',
                  fontFamily: "'Exo 2', sans-serif",
                  fontSize: '0.8rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  whiteSpace: 'nowrap',
                  transition: 'background 0.15s',
                }}
              >
                {copied ? 'Copied!' : 'Copy Link'}
              </button>
            </div>
          )}

          {/* Invite list */}
          {invites.length > 0 ? (
            <div>
              {/* List header */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: '1fr 100px 80px 100px',
                gap: '0.5rem',
                padding: '0.4rem 0',
                borderBottom: '1px solid var(--border-glass)',
                marginBottom: '0.25rem',
              }}>
                {['Email', 'Created', 'Status', 'Used'].map(h => (
                  <span key={h} style={{
                    fontFamily: "'Orbitron', sans-serif",
                    fontSize: '0.65rem',
                    letterSpacing: '0.1em',
                    color: 'var(--text-secondary)',
                    opacity: 0.7,
                    textTransform: 'uppercase',
                  }}>
                    {h}
                  </span>
                ))}
              </div>

              {invites.map((inv) => (
                <div key={inv.token} style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 100px 80px 100px',
                  gap: '0.5rem',
                  alignItems: 'center',
                  padding: '0.55rem 0',
                  borderBottom: '1px solid var(--border-glass)',
                }}>
                  <div style={{ minWidth: 0 }}>
                    <span style={{
                      fontFamily: "'Exo 2', sans-serif",
                      fontSize: '0.85rem',
                      color: 'var(--text-primary)',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                      display: 'block',
                    }}>
                      {inv.email}
                    </span>
                    <span style={{
                      fontFamily: "'Exo 2', sans-serif",
                      fontSize: '0.72rem',
                      color: 'var(--text-secondary)',
                      opacity: 0.75,
                    }}>
                      {inv.role} · {regions.find(r => r.id === inv.regionId)?.name ?? inv.regionId}
                    </span>
                  </div>
                  <span style={{
                    fontFamily: "'Exo 2', sans-serif",
                    fontSize: '0.75rem',
                    color: 'var(--text-secondary)',
                  }}>
                    {formatTs(inv.createdAt)}
                  </span>
                  <span style={{
                    fontSize: '0.72rem',
                    padding: '0.15rem 0.55rem',
                    borderRadius: '999px',
                    background: inv.used ? 'rgba(0,168,50,0.12)' : 'rgba(255,165,0,0.12)',
                    color: inv.used ? 'var(--pride-green)' : 'var(--pride-orange)',
                    fontFamily: "'Exo 2', sans-serif",
                    fontWeight: 600,
                    width: 'fit-content',
                  }}>
                    {inv.used ? 'Used' : 'Pending'}
                  </span>
                  <span style={{
                    fontFamily: "'Exo 2', sans-serif",
                    fontSize: '0.75rem',
                    color: 'var(--text-secondary)',
                  }}>
                    {formatTs(inv.usedAt)}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginTop: '0.5rem' }}>
              No invites sent yet.
            </p>
          )}
        </div>
      )}
    </div>
  )
}
