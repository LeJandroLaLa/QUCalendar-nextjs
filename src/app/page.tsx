'use client'

import { useEffect, useState, useMemo } from 'react'
import { collection, query, where, getDocs } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { QUEvent, EVENT_CATEGORIES } from '@/lib/types'
import Link from 'next/link'

const categoryNames = Object.keys(EVENT_CATEGORIES)

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
  padding: '0.5rem 0.75rem',
  borderRadius: '8px',
  border: '1px solid var(--border-glass)',
  background: 'rgba(255,255,255,0.05)',
  color: 'var(--text-primary)',
  fontFamily: "'Exo 2', sans-serif",
  fontSize: '0.85rem',
  outline: 'none',
}

export default function HomePage() {
  const [events, setEvents] = useState<QUEvent[]>([])
  const [loading, setLoading] = useState(true)
  const [viewMode, setViewMode] = useState<'calendar' | 'list'>('calendar')
  const [locationQuery, setLocationQuery] = useState('')
  const [keyword, setKeyword] = useState('')
  const [dateFilter, setDateFilter] = useState('')
  const [selectedCategories, setSelectedCategories] = useState<string[]>([])
  const [showCategoryGrid, setShowCategoryGrid] = useState(true)

  useEffect(() => {
    const fetchEvents = async () => {
      setLoading(true)
      try {
        const q = query(collection(db, 'events'), where('status', '==', 'approved'))
        const snapshot = await getDocs(q)
        const fetched: QUEvent[] = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as QUEvent[]
        // Only future + today
        const today = formatDateMDY(new Date())
        setEvents(fetched.filter(e => e.date >= today).sort((a, b) => a.date.localeCompare(b.date)))
      } catch (err) {
        console.error('Error fetching events:', err)
      } finally {
        setLoading(false)
      }
    }
    fetchEvents()
  }, [])

  const setToday = () => setDateFilter(formatDateMDY(new Date()))

  const setWeekend = () => setDateFilter('weekend')

  const clearFilters = () => {
    setLocationQuery('')
    setKeyword('')
    setDateFilter('')
    setSelectedCategories([])
  }

  const toggleCategory = (cat: string) => {
    setSelectedCategories(prev =>
      prev.includes(cat) ? prev.filter(c => c !== cat) : [...prev, cat]
    )
  }

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

    if (selectedCategories.length > 0) {
      evts = evts.filter(e => selectedCategories.includes(e.category))
    }

    return evts
  }, [events, locationQuery, keyword, dateFilter, selectedCategories])

  const dayGroups = useMemo(() => groupByDay(filteredEvents), [filteredEvents])

  const dateDisplayValue = dateFilter === 'weekend'
    ? 'Weekend'
    : dateFilter
      ? (() => { const d = parseDateLocal(dateFilter); return `${d.getMonth()+1}/${d.getDate()}/${d.getFullYear()}` })()
      : ''

  return (
    <div>
      {/* Hero */}
      <div style={{ marginBottom: '1.5rem' }}>
        <h2 style={{ fontFamily: "'Orbitron', sans-serif", fontSize: '1.3rem', marginBottom: '0.5rem' }}
            className="pride-gradient-text">
          QU Calendar — Your Non-Profit LGBTQ+ Event Hub
        </h2>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: 1.5 }}>
          A unified hub for discovering gatherings put on by and for our communities across Cincinnati, Northern Kentucky... and beyond.
        </p>
      </div>

      {/* Filter bar */}
      <div className="glass-card" style={{ padding: '1rem', marginBottom: '1rem' }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem', alignItems: 'center', marginBottom: '0.75rem' }}>
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
          <input type="text" placeholder="Search events..." value={keyword}
            onChange={e => setKeyword(e.target.value)}
            style={{ ...inputStyle, flex: 2, minWidth: '150px' }} />
        </div>

        {/* Category toggle */}
        <button onClick={() => setShowCategoryGrid(v => !v)} style={{
          background: 'none', border: 'none', color: 'var(--text-secondary)',
          cursor: 'pointer', fontFamily: "'Exo 2', sans-serif", fontSize: '0.85rem',
          padding: '0.25rem 0', display: 'flex', alignItems: 'center', gap: '0.5rem',
        }}>
          {showCategoryGrid ? '▼' : '▶'} Filter by Event Type
          {selectedCategories.length > 0 && (
            <span style={{ color: 'var(--pride-yellow)', fontSize: '0.75rem' }}>
              ({selectedCategories.length} active)
            </span>
          )}
        </button>

        {showCategoryGrid && (
          <div style={{
            display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(90px, 1fr))',
            gap: '0.5rem', marginTop: '0.75rem',
          }}>
            {categoryNames.map(cat => (
              <div key={cat} onClick={() => toggleCategory(cat)} style={{
                display: 'flex', flexDirection: 'column', alignItems: 'center',
                padding: '0.5rem 0.25rem', borderRadius: '8px', cursor: 'pointer',
                background: selectedCategories.includes(cat)
                  ? 'rgba(117,7,135,0.4)' : 'rgba(255,255,255,0.04)',
                border: `1px solid ${selectedCategories.includes(cat) ? 'rgba(117,7,135,0.8)' : 'var(--border-glass)'}`,
                transition: 'all 0.15s',
                userSelect: 'none',
              }}>
                <span style={{ fontSize: '1.3rem' }}>{EVENT_CATEGORIES[cat]}</span>
                <span style={{ fontSize: '0.65rem', color: 'var(--text-secondary)', textAlign: 'center', marginTop: '0.2rem', lineHeight: 1.2 }}>{cat}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* View toggle */}
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem' }}>
        {(['calendar', 'list'] as const).map(mode => (
          <button key={mode} onClick={() => setViewMode(mode)} style={{
            padding: '0.4rem 1.25rem', borderRadius: '20px', cursor: 'pointer',
            fontFamily: "'Exo 2', sans-serif", fontSize: '0.85rem',
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
                          <div style={{ marginTop: '0.35rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <span style={{ fontSize: '1rem' }}>{EVENT_CATEGORIES[event.category] || '📅'}</span>
                            <span style={{
                              fontSize: '0.65rem', padding: '0.1rem 0.5rem', borderRadius: '10px',
                              background: 'rgba(117,7,135,0.3)', color: 'var(--text-secondary)',
                              fontFamily: "'Exo 2', sans-serif",
                            }}>
                              {event.category}
                            </span>
                          </div>
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
                    </div>
                    <div style={{ fontSize: '1.2rem' }}>{EVENT_CATEGORIES[event.category] || '📅'}</div>
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
              <p style={{ fontSize: '0.8rem', marginTop: '0.5rem' }}>Try adjusting your location, date, or category filters.</p>
            </div>
          )}
        </>
      )}
    </div>
  )
}