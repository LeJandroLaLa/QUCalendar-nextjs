'use client'

import { useEffect, useState } from 'react'
import { collection, query, where, getDocs, orderBy, limit } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import Link from 'next/link'

interface RecentItem {
  id: string
  type: 'venue' | 'artist' | 'event'
  name: string
  status: string
  submittedAt: string
}

export default function AdminDashboard() {
  const [counts, setCounts] = useState({ pendingVenues: 0, pendingArtists: 0, pendingEvents: 0 })
  const [recent, setRecent] = useState<RecentItem[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [pv, pa, pe] = await Promise.all([
          getDocs(query(collection(db, 'venues'), where('status', '==', 'pending'))),
          getDocs(query(collection(db, 'artists'), where('status', '==', 'pending'))),
          getDocs(query(collection(db, 'events'), where('status', '==', 'pending'))),
        ])
        setCounts({
          pendingVenues: pv.size,
          pendingArtists: pa.size,
          pendingEvents: pe.size,
        })

        // Fetch recent submissions across all collections
        const recentItems: RecentItem[] = []
        const collections = [
          { name: 'venues', type: 'venue' as const, field: 'name' },
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

  const summaryCards = [
    { label: 'Pending Venues', count: counts.pendingVenues, href: '/admin/venues', color: 'var(--pride-red)' },
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
      <div className="glass-card" style={{ padding: '1.25rem' }}>
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
    </div>
  )
}
