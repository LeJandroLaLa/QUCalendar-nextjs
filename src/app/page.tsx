'use client'

import { useEffect, useState, useMemo, useRef, useCallback } from 'react'
import { collection, query, where, getDocs } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { QUEvent, EVENT_TAGS, SPACE_TYPE_FILTERS, AGE_FILTERS, IDENTITY_FILTERS, buildTagFilter, IdentityTag } from '@/lib/types'
import Link from 'next/link'
import ZipGate, { LocationData } from '@/components/ZipGate'

const MONTH_NAMES = ['January','February','March','April','May','June',
  'July','August','September','October','November','December']
const MONTH_SHORT = ['JAN','FEB','MAR','APR','MAY','JUN',
  'JUL','AUG','SEP','OCT','NOV','DEC']
const DAY_NAMES = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday']

interface DayGroup {
  dateStr: string
  dayNumber: number
  month: string
  dayOfWeek: string
  fullDate: string
  events: QUEvent[]
}

function parseDateLocal(dateStr: string): Date {
  return new Date(dateStr + 'T00:00:00')
}

function groupByDay(events: QUEvent[]): DayGroup[] {
  const map = new Map<string, QUEvent[]>()
  for (const event of events) {
    const key = event.date?.slice(0, 10)
    if (!key) continue
    if (!map.has(key)) map.set(key, [])
    map.get(key)!.push(event)
  }
  return Array.from(map.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([dateStr, evts]) => {
      const d = parseDateLocal(dateStr)
      return {
        dateStr,
        dayNumber: d.getDate(),
        month: MONTH_SHORT[d.getMonth()],
        dayOfWeek: DAY_NAMES[d.getDay()],
        fullDate: `${MONTH_NAMES[d.getMonth()]} ${d.getDate()}, ${d.getFullYear()}`,
        events: evts,
      }
    })
}

function formatDateMDY(d: Date): string {
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${d.getFullYear()}-${m}-${day}`
}

function calculateStardate(dateStr: string, time?: string): string {
  const d = parseDateLocal(dateStr)
  const year = d.getFullYear()
  const start = new Date(year, 0, 0)
  const dayOfYear = Math.floor((d.getTime() - start.getTime()) / (1000 * 60 * 60 * 24))
  let hourFraction = 0
  if (time) {
    const match = time.match(/(\d+):(\d+)\s*(AM|PM)/i)
    if (match) {
      let h = parseInt(match[1])
      const min = parseInt(match[2])
      const period = match[3].toUpperCase()
      if (period === 'PM' && h !== 12) h += 12
      if (period === 'AM' && h === 12) h = 0
      hourFraction = ((h * 60 + min) / (24 * 60)) * 0.1
    }
  }
  return (year * 10 + (dayOfYear / 365) * 10 + hourFraction).toFixed(2)
}

const inputStyle: React.CSSProperties = {
  padding: '10px 16px',
  height: '44px',
  borderRadius: '8px',
  border: '1px solid var(--border-glass)',
  background: 'rgba(255,255,255,0.05)',
  color: 'var(--text-primary)',
  fontFamily: "'Exo 2', sans-serif",
  fontSize: '14px',
  outline: 'none',
  boxSizing: 'border-box',
}

const pillStyle: React.CSSProperties = {
  padding: '8px 16px',
  borderRadius: '20px',
  cursor: 'pointer',
  fontFamily: "'Exo 2', sans-serif",
  fontSize: '14px',
  border: '1px solid var(--border-glass)',
  background: 'rgba(255,255,255,0.05)',
  color: 'var(--text-primary)',
  transition: 'all 0.15s',
  whiteSpace: 'nowrap' as const,
}


export default function HomePage() {
  const [location, setLocation] = useState<LocationData | null>(null)
  const [locationEntered, setLocationEntered] = useState<boolean>(false)
  const [events, setEvents] = useState<QUEvent[]>([])
  const [loading, setLoading] = useState(true)
  const [viewMode, setViewMode] = useState<'calendar' | 'list'>('calendar')
  const [locationQuery, setLocationQuery] = useState('')
  const [keyword, setKeyword] = useState('')
  const [dateFilter, setDateFilter] = useState('')
  const [activeTags, setActiveTags] = useState<Set<string>>(new Set())
  const [openDropdown, setOpenDropdown] = useState<string | null>(null)

  const filterBarRef = useRef<HTMLDivElement>(null)

  const fetchAll = useCallback(async () => {
    setLoading(true)
    try {
      const baseQuery = [where('status', '==', 'approved')]
      const tagArray = buildTagFilter(Array.from(activeTags) as IdentityTag[])
      const firestoreQuery = tagArray.length > 0
        ? query(collection(db, 'events'), ...baseQuery, where('identityTags', 'array-contains-any', tagArray))
        : query(collection(db, 'events'), ...baseQuery)
      const eventsSnap = await getDocs(firestoreQuery)
      const fetched: QUEvent[] = eventsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })) as QUEvent[]
      const today = formatDateMDY(new Date())
      setEvents(fetched.filter(e => e.date >= today).sort((a, b) => a.date.localeCompare(b.date)))
    } catch (err) {
      console.error('Error fetching data:', err)
    } finally {
      setLoading(false)
    }
  }, [activeTags])

  useEffect(() => {
    fetchAll()
  }, [fetchAll])

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (filterBarRef.current && !filterBarRef.current.contains(e.target as Node)) {
        setOpenDropdown(null)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const setToday = () => setDateFilter(formatDateMDY(new Date()))
  const setWeekend = () => setDateFilter('weekend')

  const clearFilters = useCallback(() => {
    setLocationQuery('')
    setKeyword('')
    setDateFilter('')
    setActiveTags(new Set())
    setOpenDropdown(null)
  }, [])

  const toggleTag = useCallback((tag: string) => {
    setActiveTags(prev => {
      const next = new Set(prev)
      if (next.has(tag)) next.delete(tag)
      else next.add(tag)
      return next
    })
  }, [])

  const removeTagWithSubtags = useCallback((tagToRemove: string) => {
    setActiveTags(prev => {
      const next = new Set(prev)
      next.delete(tagToRemove)
      // If this is a group label tag, also remove all sub-tags
      for (const group of Object.values(EVENT_TAGS)) {
        if (group.label === tagToRemove) {
          for (const sub of group.tags) next.delete(sub.tag)
        }
      }
      return next
    })
  }, [])

  const toggleDropdown = useCallback((key: string) => {
    setOpenDropdown(prev => prev === key ? null : key)
  }, [])

  const filteredEvents = useMemo(() => {
    let evts = [...events]

    if (locationQuery.trim()) {
      const q = locationQuery.toLowerCase()
      evts = evts.filter(e => e.venue?.toLowerCase().includes(q))
    }

    if (keyword.trim()) {
      const q = keyword.toLowerCase()
      evts = evts.filter(e =>
        e.title?.toLowerCase().includes(q) ||
        e.venue?.toLowerCase().includes(q) ||
        e.description?.toLowerCase().includes(q) ||
        e.category?.toLowerCase().includes(q)
      )
    }

    if (dateFilter === 'weekend') {
      evts = evts.filter(e => {
        const day = parseDateLocal(e.date).getDay()
        return day === 0 || day === 6
      })
    } else if (dateFilter) {
      evts = evts.filter(e => e.date === dateFilter)
    }

    if (activeTags.size > 0) {
      evts = evts.filter(e => {
        const eventIdentitySet = new Set<string>(e.identityTags ?? [])
        for (const tag of activeTags) {
          if (!eventIdentitySet.has(tag)) return false
        }
        return true
      })
    }

    return evts
  }, [events, keyword, locationQuery, dateFilter, activeTags])

  const dayGroups = useMemo(() => groupByDay(filteredEvents), [filteredEvents])

  const dateDisplayValue = dateFilter === 'weekend'
    ? 'Weekend'
    : dateFilter
      ? (() => { const d = parseDateLocal(dateFilter); return `${d.getMonth()+1}/${d.getDate()}/${d.getFullYear()}` })()
      : ''

  if (!locationEntered) {
    return <ZipGate onLocationSubmit={(loc) => { setLocation(loc); setLocationEntered(true); setLocationQuery(loc.displayName) }} />
  }

  return (
    <div>
      {/* Hero */}
      <div style={{ marginBottom: '1.5rem' }}>
        <h2 style={{ fontFamily: "'Orbitron', sans-serif", fontSize: '1.6rem', marginBottom: '0.5rem' }}>
          <span style={{
            background: 'linear-gradient(90deg, #FF3B3B, #9B3DB8)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
          }}>QU</span> — Your Queer Community, Synchronized
        </h2>
        <p style={{ color: 'var(--text-secondary)', fontSize: '15px', lineHeight: 1.5 }}>
          Discover the events, spaces, and artists that make your Queer community alive — starting in Cincinnati, built for everywhere.
        </p>
      </div>

      {/* Filter bar */}
      <div className="glass-card" style={{ padding: '1rem', marginBottom: '1rem' }} ref={filterBarRef}>
        {/* Search row */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem', alignItems: 'center', marginBottom: '0.75rem' }}>
          <input type="text" placeholder="Search all events..." value={keyword}
            onChange={e => setKeyword(e.target.value)}
            style={{ ...inputStyle, flex: 2, minWidth: '150px' }} />
          <div style={{ position: 'relative', flex: 1, minWidth: '150px' }}>
            <span style={{ position: 'absolute', left: '0.6rem', top: '50%', transform: 'translateY(-50%)' }}>📍</span>
            <input type="text" placeholder="Location" value={locationQuery}
              onChange={e => setLocationQuery(e.target.value)}
              style={{ ...inputStyle, width: '100%', paddingLeft: '2rem' }} />
          </div>
          <div style={{ position: 'relative', minWidth: '160px' }}>
            <input type="text" placeholder="mm / dd / yyyy" value={dateDisplayValue}
              readOnly
              style={{ ...inputStyle, paddingRight: '2rem' }} />
            <span style={{ position: 'absolute', right: '0.6rem', top: '50%', transform: 'translateY(-50%)' }}>📅</span>
          </div>
          <button onClick={setToday} style={{
            ...inputStyle, cursor: 'pointer',
            background: dateFilter && dateFilter !== 'weekend' ? 'rgba(117,7,135,0.4)' : 'rgba(255,255,255,0.05)',
            border: '1px solid var(--border-glass)',
          }}>Today</button>
          <button onClick={setWeekend} style={{
            ...inputStyle, cursor: 'pointer',
            background: dateFilter === 'weekend' ? 'rgba(117,7,135,0.4)' : 'rgba(255,255,255,0.05)',
            border: '1px solid var(--border-glass)',
          }}>Weekend</button>
          <button onClick={clearFilters} style={{
            ...inputStyle, cursor: 'pointer', background: 'rgba(255,255,255,0.05)',
            border: '1px solid var(--border-glass)',
          }}>Clear</button>
        </div>

        {/* Row 1 — Event Type dropdowns + Giving Back */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', alignItems: 'center', marginBottom: '0.5rem' }}>
          {(Object.entries(EVENT_TAGS) as [keyof typeof EVENT_TAGS, typeof EVENT_TAGS[keyof typeof EVENT_TAGS]][]).map(([key, group]) => {
            const isOpen = openDropdown === key
            const activeInGroup = group.tags.filter(t => activeTags.has(t.tag)).length
            const groupActive = activeInGroup > 0

            return (
              <div key={key} style={{ position: 'relative' }}>
                <button
                  onClick={() => toggleDropdown(key)}
                  style={{
                    ...pillStyle,
                    background: groupActive ? 'rgba(155,61,184,0.35)' : 'rgba(255,255,255,0.05)',
                    border: groupActive ? '1px solid var(--pride-violet)' : '1px solid var(--border-glass)',
                    display: 'flex', alignItems: 'center', gap: '0.3rem',
                  }}
                >
                  {group.emoji} {group.label}
                  {activeInGroup > 0 && (
                    <span style={{
                      background: 'rgba(155,61,184,0.5)',
                      borderRadius: '10px',
                      padding: '0 0.4rem',
                      fontSize: '0.68rem',
                    }}>{activeInGroup}</span>
                  )}
                  <span style={{ fontSize: '0.6rem', opacity: 0.7 }}>▼</span>
                </button>

                {isOpen && (
                  <div style={{
                    position: 'absolute',
                    top: 'calc(100% + 8px)',
                    left: 0,
                    background: '#2a2a2a',
                    border: '1px solid var(--border-glass)',
                    borderRadius: '12px',
                    padding: '0.75rem',
                    display: 'flex',
                    flexWrap: 'wrap',
                    gap: '0.4rem',
                    zIndex: 200,
                    boxShadow: '0 8px 32px rgba(0,0,0,0.6)',
                    minWidth: '320px',
                  }}>
                    {group.tags.map(({ tag, emoji }) => {
                      const isActive = activeTags.has(tag)
                      return (
                        <button
                          key={tag}
                          onClick={() => toggleTag(tag)}
                          style={{
                            padding: '8px 16px',
                            minHeight: '44px',
                            borderRadius: '20px',
                            cursor: 'pointer',
                            fontFamily: "'Exo 2', sans-serif",
                            fontSize: '14px',
                            background: isActive ? 'rgba(77,121,255,0.28)' : 'rgba(255,255,255,0.07)',
                            border: isActive ? '1px solid var(--pride-blue)' : '1px solid var(--border-glass)',
                            color: 'var(--text-primary)',
                            transition: 'all 0.15s',
                            whiteSpace: 'nowrap' as const,
                          }}
                        >
                          {emoji} {tag}
                        </button>
                      )
                    })}
                  </div>
                )}
              </div>
            )
          })}

          {/* Divider */}
          <div style={{ width: '1px', height: '24px', background: 'var(--border-glass)', flexShrink: 0 }} />

          {/* Giving Back simple pill */}
          {(() => {
            const isActive = activeTags.has('Giving-Back')
            return (
              <button
                onClick={() => toggleTag('Giving-Back')}
                style={{
                  ...pillStyle,
                  background: isActive ? 'rgba(155,61,184,0.35)' : 'rgba(255,255,255,0.05)',
                  border: isActive ? '1px solid var(--pride-violet)' : '1px solid var(--border-glass)',
                }}
              >
                🩷 Giving Back
              </button>
            )
          })()}
        </div>

        {/* Row 2 — Space Type */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', alignItems: 'center', marginBottom: '0.5rem', borderTop: '1px solid var(--border-glass)', paddingTop: '0.5rem' }}>
          <span style={{
            fontFamily: "'Orbitron', sans-serif",
            fontSize: '12px',
            letterSpacing: '2px',
            opacity: 0.55,
            fontVariant: 'small-caps',
            whiteSpace: 'nowrap',
          }}>SPACE</span>

          {SPACE_TYPE_FILTERS.map(({ tag, emoji }) => {
            const isActive = activeTags.has(tag)
            return (
              <button
                key={tag}
                onClick={() => toggleTag(tag)}
                style={{
                  ...pillStyle,
                  background: isActive ? 'rgba(0,168,50,0.2)' : 'rgba(255,255,255,0.05)',
                  border: isActive ? '1px solid var(--pride-green)' : '1px solid var(--border-glass)',
                }}
              >
                {emoji} {tag}
              </button>
            )
          })}
        </div>

        {/* Row 3 — Age & Identity */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', alignItems: 'center', borderTop: '1px solid var(--border-glass)', paddingTop: '0.5rem' }}>
          <span style={{
            fontFamily: "'Orbitron', sans-serif",
            fontSize: '12px',
            letterSpacing: '2px',
            opacity: 0.55,
            fontVariant: 'small-caps',
            whiteSpace: 'nowrap',
          }}>AGE</span>

          {AGE_FILTERS.map(age => {
            const isActive = activeTags.has(age)
            return (
              <button
                key={age}
                onClick={() => toggleTag(age)}
                style={{
                  ...pillStyle,
                  background: isActive ? 'rgba(255,59,59,0.25)' : 'rgba(255,255,255,0.05)',
                  border: isActive ? '1px solid var(--pride-red)' : '1px solid var(--border-glass)',
                }}
              >
                {age}
              </button>
            )
          })}

          {/* Divider */}
          <div style={{ width: '1px', height: '24px', background: 'var(--border-glass)', flexShrink: 0 }} />

          <span style={{
            fontFamily: "'Orbitron', sans-serif",
            fontSize: '12px',
            letterSpacing: '2px',
            opacity: 0.55,
            fontVariant: 'small-caps',
            whiteSpace: 'nowrap',
          }}>IDENTITY</span>

          {IDENTITY_FILTERS.map(({ tag, emoji }) => {
            const isActive = activeTags.has(tag)
            return (
              <button
                key={tag}
                onClick={() => toggleTag(tag)}
                style={{
                  ...pillStyle,
                  background: isActive ? 'rgba(0,168,50,0.2)' : 'rgba(255,255,255,0.05)',
                  border: isActive ? '1px solid var(--pride-green)' : '1px solid var(--border-glass)',
                }}
              >
                {emoji} {tag}
              </button>
            )
          })}
        </div>

        {/* Row 4 — Active chips */}
        {activeTags.size > 0 && (
          <div style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: '0.5rem',
            alignItems: 'center',
            marginTop: '0.5rem',
            borderTop: '1px solid var(--border-glass)',
            paddingTop: '0.75rem',
          }}>
            <span style={{
              fontFamily: "'Orbitron', sans-serif",
              fontSize: '0.6rem',
              letterSpacing: '2px',
              opacity: 0.55,
              fontVariant: 'small-caps',
              whiteSpace: 'nowrap',
            }}>FILTERING:</span>

            {Array.from(activeTags).map(tag => (
              <span
                key={tag}
                onClick={() => removeTagWithSubtags(tag)}
                style={{
                  padding: '0.25rem 0.75rem',
                  borderRadius: '20px',
                  cursor: 'pointer',
                  fontFamily: "'Exo 2', sans-serif",
                  fontSize: '0.8rem',
                  background: 'rgba(155,61,184,0.35)',
                  border: '1px solid var(--pride-violet)',
                  color: 'var(--text-primary)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.35rem',
                  userSelect: 'none',
                }}
              >
                {tag} <span style={{ opacity: 0.7 }}>✕</span>
              </span>
            ))}
          </div>
        )}
      </div>

      {/* View toggle */}
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem' }}>
        {(['calendar', 'list'] as const).map(mode => (
          <button key={mode} onClick={() => setViewMode(mode)} style={{
            padding: '12px 24px', borderRadius: '20px', cursor: 'pointer',
            fontFamily: "'Exo 2', sans-serif", fontSize: '14px',
            background: viewMode === mode ? 'rgba(117,7,135,0.5)' : 'rgba(255,255,255,0.05)',
            border: `1px solid ${viewMode === mode ? 'rgba(117,7,135,0.9)' : 'var(--border-glass)'}`,
            color: 'var(--text-primary)',
          }}>
            {mode === 'calendar' ? 'Calendar View' : 'List View'}
          </button>
        ))}
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-secondary)' }}>
          Loading events...
        </div>
      ) : (
        <>
          {/* CALENDAR VIEW — day-grouped */}
          {viewMode === 'calendar' && (
            <div>
              {dayGroups.map(day => (
                <div key={day.dateStr} className="glass-card" style={{ marginBottom: '1.25rem', overflow: 'hidden' }}>
                  {/* Day header */}
                  <div style={{
                    display: 'flex', alignItems: 'center', gap: '1rem',
                    padding: '0.75rem 1rem',
                    borderBottom: '1px solid var(--border-glass)',
                  }}>
                    <div style={{
                      display: 'flex', flexDirection: 'column', alignItems: 'center',
                      background: 'rgba(117,7,135,0.3)', borderRadius: '8px',
                      padding: '0.4rem 0.75rem', minWidth: '52px',
                    }}>
                      <span style={{ fontFamily: "'Orbitron', sans-serif", fontSize: '1.4rem', lineHeight: 1, color: 'var(--text-primary)' }}>
                        {day.dayNumber}
                      </span>
                      <span style={{ fontFamily: "'Orbitron', sans-serif", fontSize: '0.6rem', color: 'var(--text-secondary)' }}>
                        {day.month}
                      </span>
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontFamily: "'Orbitron', sans-serif", fontSize: '1rem', color: 'var(--text-primary)' }}>
                        {day.dayOfWeek}
                      </div>
                      <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                        {day.fullDate}
                      </div>
                    </div>
                    <div style={{
                      background: 'rgba(117,7,135,0.4)', borderRadius: '20px',
                      padding: '0.2rem 0.75rem', fontSize: '0.75rem',
                      color: 'var(--text-primary)', fontFamily: "'Exo 2', sans-serif",
                    }}>
                      {day.events.length} {day.events.length === 1 ? 'event' : 'events'}
                    </div>
                  </div>

                  {/* Events for this day */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1px', background: 'var(--border-glass)' }}>
                    {day.events.map(event => (
                      <Link key={event.id} href={`/events/${event.id}`} style={{
                        display: 'flex', alignItems: 'flex-start', gap: '1rem',
                        padding: '0.85rem 1rem', textDecoration: 'none',
                        background: 'var(--bg-dark)',
                        transition: 'background 0.15s',
                      }}
                      onMouseEnter={e => (e.currentTarget.style.background = 'rgba(117,7,135,0.15)')}
                      onMouseLeave={e => (e.currentTarget.style.background = 'var(--bg-dark)')}>
                        {/* Time block */}
                        <div style={{ minWidth: '80px' }}>
                          <div style={{ color: 'var(--pride-yellow)', fontFamily: "'Orbitron', sans-serif", fontSize: '0.8rem' }}>
                            {event.time || '—'}
                          </div>
                          <div style={{ color: 'var(--text-secondary)', fontSize: '0.6rem', fontFamily: "'Exo 2', sans-serif" }}>
                            {calculateStardate(event.date, event.time)}
                          </div>
                        </div>

                        {/* Event details */}
                        <div style={{ flex: 1 }}>
                          <div style={{ color: 'var(--text-primary)', fontFamily: "'Exo 2', sans-serif", fontWeight: 600, fontSize: '0.95rem' }}>
                            {event.title}
                          </div>
                          {event.venue && (
                            <div style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', marginTop: '0.2rem' }}>
                              📍 {event.venue}
                            </div>
                          )}
                          {event.identityTags && event.identityTags.length > 0 && (
                            <div style={{ marginTop: '0.35rem', display: 'flex', flexWrap: 'wrap', gap: '0.35rem' }}>
                              {event.identityTags.map(tag => {
                                const isActive = activeTags.has(tag)
                                return (
                                  <span key={tag} style={{
                                    fontSize: '0.65rem', padding: '0.1rem 0.5rem', borderRadius: '10px',
                                    background: isActive ? 'rgba(155,61,184,0.2)' : 'rgba(117,7,135,0.3)',
                                    border: `1px solid ${isActive ? 'rgba(155,61,184,0.5)' : 'transparent'}`,
                                    color: 'var(--text-secondary)',
                                    fontFamily: "'Exo 2', sans-serif",
                                  }}>
                                    {tag}
                                  </span>
                                )
                              })}
                            </div>
                          )}
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* LIST VIEW — flat */}
          {viewMode === 'list' && (
            <div className="glass-card" style={{ overflow: 'hidden' }}>
              {filteredEvents.length === 0 ? null : filteredEvents.map((event, i) => {
                const d = parseDateLocal(event.date)
                return (
                  <Link key={event.id} href={`/events/${event.id}`} style={{
                    display: 'flex', alignItems: 'center', gap: '1rem',
                    padding: '0.75rem 1rem', textDecoration: 'none',
                    borderBottom: i < filteredEvents.length - 1 ? '1px solid var(--border-glass)' : 'none',
                    background: 'transparent', transition: 'background 0.15s',
                  }}
                  onMouseEnter={e => (e.currentTarget.style.background = 'rgba(117,7,135,0.15)')}
                  onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}>
                    <div style={{ textAlign: 'center', minWidth: '44px' }}>
                      <div style={{ fontFamily: "'Orbitron', sans-serif", fontSize: '1.1rem', color: 'var(--text-primary)', lineHeight: 1 }}>
                        {d.getDate()}
                      </div>
                      <div style={{ fontFamily: "'Orbitron', sans-serif", fontSize: '0.55rem', color: 'var(--text-secondary)' }}>
                        {MONTH_SHORT[d.getMonth()]}
                      </div>
                    </div>
                    <div style={{ minWidth: '70px' }}>
                      <div style={{ color: 'var(--pride-yellow)', fontSize: '0.8rem', fontFamily: "'Orbitron', sans-serif" }}>
                        {event.time || '—'}
                      </div>
                      <div style={{ color: 'var(--text-secondary)', fontSize: '0.7rem' }}>
                        {DAY_NAMES[d.getDay()].slice(0, 3)}
                      </div>
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ color: 'var(--text-primary)', fontWeight: 600, fontFamily: "'Exo 2', sans-serif", fontSize: '0.9rem' }}>
                        {event.title}
                      </div>
                      {event.venue && (
                        <div style={{ color: 'var(--text-secondary)', fontSize: '0.75rem' }}>📍 {event.venue}</div>
                      )}
                      {event.identityTags && event.identityTags.length > 0 && (
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.3rem', marginTop: '0.25rem' }}>
                          {event.identityTags.map(tag => {
                            const isActive = activeTags.has(tag)
                            return (
                              <span key={tag} style={{
                                fontSize: '0.62rem', padding: '0.1rem 0.4rem', borderRadius: '8px',
                                background: isActive ? 'rgba(155,61,184,0.2)' : 'rgba(117,7,135,0.3)',
                                border: `1px solid ${isActive ? 'rgba(155,61,184,0.5)' : 'transparent'}`,
                                color: 'var(--text-secondary)',
                                fontFamily: "'Exo 2', sans-serif",
                              }}>
                                {tag}
                              </span>
                            )
                          })}
                        </div>
                      )}
                    </div>
                  </Link>
                )
              })}
            </div>
          )}

          {/* No results */}
          {filteredEvents.length === 0 && (
            <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-secondary)' }}>
              <p style={{ fontSize: '2rem' }}>📅</p>
              <p>No events match your filters.</p>
              <p style={{ fontSize: '0.8rem', marginTop: '0.5rem' }}>Try adjusting your search, date, or tag filters.</p>
            </div>
          )}
        </>
      )}
    </div>
  )
}
