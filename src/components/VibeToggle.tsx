'use client'

import { useEffect, useState } from 'react'
import { Moon, Sun } from 'lucide-react'

type Vibe = 'night' | 'day'

export default function VibeToggle() {
  const [vibe, setVibe] = useState<Vibe>('night')

  useEffect(() => {
    try {
      const stored = localStorage.getItem('qu-vibe') as Vibe | null
      if (stored === 'day' || stored === 'night') {
        setVibe(stored)
      }
    } catch {}
  }, [])

  const toggle = () => {
    const next: Vibe = vibe === 'night' ? 'day' : 'night'
    setVibe(next)
    try {
      localStorage.setItem('qu-vibe', next)
    } catch {}
    document.documentElement.setAttribute('data-vibe', next)
  }

  const isDay = vibe === 'day'

  return (
    <button
      onClick={toggle}
      aria-label={`Switch to ${isDay ? 'night' : 'day'} mode`}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '6px',
        background: isDay ? 'rgba(180,100,40,0.12)' : 'rgba(255,255,255,0.1)',
        border: `1px solid ${isDay ? 'rgba(180,100,40,0.3)' : 'rgba(255,255,255,0.2)'}`,
        borderRadius: '999px',
        padding: '4px 12px',
        cursor: 'pointer',
        color: isDay ? '#B5541F' : 'rgba(255,255,255,0.85)',
        fontSize: '0.8rem',
        fontFamily: "'Exo 2', sans-serif",
        fontWeight: 600,
        transition: 'all 0.2s ease',
        whiteSpace: 'nowrap',
        flexShrink: 0,
      }}
    >
      {isDay ? <Sun size={14} /> : <Moon size={14} />}
      {isDay ? 'Day' : 'Night'}
    </button>
  )
}
