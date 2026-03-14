'use client'

import { useEffect, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { collection, query, where, onSnapshot } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { useAuth } from '@/hooks/useAuth'
import Link from 'next/link'

const ADMIN_EMAIL = process.env.NEXT_PUBLIC_ADMIN_EMAIL

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth()
  const router = useRouter()
  const pathname = usePathname()
  const [counts, setCounts] = useState({ venues: 0, artists: 0, events: 0 })

  useEffect(() => {
    if (loading) return
    if (!user || user.email !== ADMIN_EMAIL) {
      router.push('/')
      return
    }

    // Live count listeners for pending items
    const unsubVenues = onSnapshot(
      query(collection(db, 'venues'), where('status', '==', 'pending')), // TODO: migrate Firestore collection from 'venues' to 'spaces'
      (snap) => setCounts((prev) => ({ ...prev, venues: snap.size }))
    )
    const unsubArtists = onSnapshot(
      query(collection(db, 'artists'), where('status', '==', 'pending')),
      (snap) => setCounts((prev) => ({ ...prev, artists: snap.size }))
    )
    const unsubEvents = onSnapshot(
      query(collection(db, 'events'), where('status', '==', 'pending')),
      (snap) => setCounts((prev) => ({ ...prev, events: snap.size }))
    )

    return () => {
      unsubVenues()
      unsubArtists()
      unsubEvents()
    }
  }, [user, loading, router])

  if (loading) {
    return <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-secondary)' }}>Loading...</div>
  }

  if (!user || user.email !== ADMIN_EMAIL) {
    return null
  }

  const navItems = [
    { href: '/admin', label: 'Dashboard', count: 0 },
    { href: '/admin/venues', label: 'Pending Venues', count: counts.venues },
    { href: '/admin/artists', label: 'Pending Artists', count: counts.artists },
    { href: '/admin/events', label: 'Pending Events', count: counts.events },
    { href: '/admin/approved', label: 'Approved Content', count: 0 },
  ]

  const isActive = (href: string) => {
    if (href === '/admin') return pathname === '/admin'
    return pathname.startsWith(href)
  }

  return (
    <div style={{ display: 'flex', gap: '1.5rem', minHeight: 'calc(100vh - 150px)' }}>
      {/* Sidebar */}
      <aside style={{
        width: '240px',
        flexShrink: 0,
        background: 'var(--bg-card)',
        border: '1px solid var(--border-glass)',
        backdropFilter: 'blur(10px)',
        borderRadius: '12px',
        padding: '1.25rem 0',
        alignSelf: 'flex-start',
        position: 'sticky',
        top: '120px',
      }}>
        <h3 style={{
          fontFamily: "'Orbitron', sans-serif",
          fontSize: '0.85rem',
          padding: '0 1.25rem',
          marginBottom: '1rem',
          color: 'var(--text-secondary)',
          letterSpacing: '0.1em',
        }}>
          ADMIN
        </h3>
        <nav style={{ display: 'flex', flexDirection: 'column' }}>
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '0.65rem 1.25rem',
                textDecoration: 'none',
                fontFamily: "'Exo 2', sans-serif",
                fontSize: '0.9rem',
                color: isActive(item.href) ? 'var(--text-primary)' : 'var(--text-secondary)',
                background: isActive(item.href) ? 'rgba(117, 7, 135, 0.2)' : 'transparent',
                borderLeft: isActive(item.href) ? '3px solid var(--pride-violet)' : '3px solid transparent',
                transition: 'all 0.15s',
              }}
            >
              <span>{item.label}</span>
              {item.count > 0 && (
                <span style={{
                  background: 'var(--pride-red)',
                  color: '#fff',
                  fontSize: '0.7rem',
                  fontWeight: 700,
                  padding: '0.15rem 0.5rem',
                  borderRadius: '999px',
                  minWidth: '20px',
                  textAlign: 'center',
                }}>
                  {item.count}
                </span>
              )}
            </Link>
          ))}
        </nav>
      </aside>

      {/* Content */}
      <div style={{ flex: 1, minWidth: 0 }}>
        {children}
      </div>
    </div>
  )
}
