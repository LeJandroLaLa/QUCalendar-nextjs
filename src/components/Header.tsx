'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'
import { useAuth } from '@/context/AuthContext'

function getStardate(): string {
  const now = new Date()
  const year = now.getFullYear()
  const startOfYear = new Date(year, 0, 1)
  const dayOfYear = Math.floor((now.getTime() - startOfYear.getTime()) / 86400000) + 1
  const fractional = (dayOfYear / 365 * 100).toFixed(1)
  return `${year.toString().substring(1)}${fractional}`
}

export default function Header() {
  const pathname = usePathname()
  const { user } = useAuth()
  const [stardate, setStardate] = useState('')

  useEffect(() => {
    setStardate(getStardate())
    const interval = setInterval(() => setStardate(getStardate()), 3600000)
    return () => clearInterval(interval)
  }, [])

  const navLinks = [
    { label: 'Calendar', href: '/' },
    { label: 'Venues', href: '/venues' },
    { label: 'Artists', href: '/artists' },
    ...(user ? [{ label: 'My Profiles', href: '/my-profiles' }] : []),
    { label: 'About', href: '/about' },
  ]

  return (
    <header style={{
      borderBottom: '1px solid var(--border-glass)',
      background: 'rgba(10, 10, 15, 0.95)',
      backdropFilter: 'blur(10px)',
      position: 'sticky',
      top: 0,
      zIndex: 100,
    }}>
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '1rem 2rem 0.5rem',
        maxWidth: '1200px',
        margin: '0 auto',
      }}>
        <Link href="/" style={{ textDecoration: 'none' }}>
          <h1 className="pride-gradient-text" style={{
            fontSize: '1.8rem',
            letterSpacing: '0.15em',
            fontFamily: "'Orbitron', sans-serif",
            margin: 0,
          }}>
            QU Calendar
          </h1>
        </Link>
        <span style={{
          fontFamily: "'Orbitron', sans-serif",
          fontSize: '0.85rem',
          color: 'var(--text-secondary)',
        }}>
          Stardate {stardate}
        </span>
      </div>

      <nav style={{
        display: 'flex',
        gap: '2rem',
        padding: '0.5rem 2rem 1rem',
        maxWidth: '1200px',
        margin: '0 auto',
      }}>
        {navLinks.map(link => {
  const isActive = link.href === '/' ? pathname === '/' : pathname.startsWith(link.href)
  return (
    <Link
      key={link.href}
      href={link.href}
      style={{
        color: isActive ? 'var(--text-primary)' : 'var(--text-secondary)',
        textDecoration: 'none',
        fontFamily: "'Exo 2', sans-serif",
        fontSize: '0.95rem',
        fontWeight: 600,
        letterSpacing: '0.05em',
        paddingBottom: '0.15rem',
        position: 'relative',
        transition: 'color 0.2s',
      }}
      onMouseEnter={e => {
        const el = e.currentTarget.querySelector('.nav-underline') as HTMLElement
        if (el) el.style.width = '100%'
      }}
      onMouseLeave={e => {
        const el = e.currentTarget.querySelector('.nav-underline') as HTMLElement
        if (el && !isActive) el.style.width = '0'
      }}
    >
      {link.label}
      <span className="nav-underline" style={{
        position: 'absolute',
        bottom: '-4px',
        left: 0,
        width: isActive ? '100%' : '0',
        height: '2px',
        background: 'var(--gradient-pride)',
        transition: 'width 0.3s ease',
        display: 'block',
      }} />
    </Link>
  )
})}
      </nav>
    </header>
  )
}