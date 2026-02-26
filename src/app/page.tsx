'use client'

import { useEffect, useState, useMemo, useCallback } from 'react'
import { collection, query, where, getDocs } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { QUEvent, EVENT_CATEGORIES } from '@/lib/types'
import Link from 'next/link'

/* ───────────────── constants ───────────────── */

const PRIDE_COLORS = [
  'var(--pride-red)',
  'var(--pride-orange)',
  'var(--pride-yellow)',
  'var(--pride-green)',
  'var(--pride-blue)',
  'var(--pride-violet)',
]

const FILTER_CATEGORIES: { label: string; emoji: string }[] = [
  { label: 'Nightlife', emoji: '🌟' },
  { label: 'Drag', emoji: '🎭' },
  { label: 'Fashion', emoji: '👕' },
  { label: 'Fundraiser', emoji: '💰' },
  { label: 'Karaoke', emoji: '🎤' },
  { label: 'Leather', emoji: '🔗' },
  { label: 'Movies', emoji: '🎬' },
  { label: 'Community', emoji: '🤝' },
  { label: 'Travel', emoji: '✈️' },
  { label: 'Brunch', emoji: '🥂' },
  { label: 'Sports', emoji: '⚽' },
  { label: 'Live Show', emoji: '🎵' },
  { label: 'Sober', emoji: '⭐' },
  { label: 'Workshop', emoji: '🧰' },
  { label: 'Outdoors', emoji: '🏔️' },
  { label: 'Wellness', emoji: '🧘' },
  { label: 'DJ Sets', emoji: '🎧' },
  { label: 'Art/Photo', emoji: '📷' },
  { label: 'Multi-Day', emoji: '📅' },
  { label: 'Trivia', emoji: '💬' },
]

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
]

const MONTH_ABBRS = [
  'JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN',
  'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC',
]

const DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
const DAY_FULL_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']

/* ────────────── helper functions ────────────── */

function getDaysInMonth(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate()
}

function getFirstDayOfMonth(year: number, month: number) {
  return new Date(year, month, 1).getDay()
}

/** Stardate format: YYDDD.HH */
function toStardate(dateStr: string, timeStr?: string): string {
  const d = new Date(dateStr + 'T00:00:00')
  const yy = String(d.getFullYear()).slice(-2)
  const start = new Date(d.getFullYear(), 0, 0)
  const diff = d.getTime() - start.getTime()
  const dayOfYear = Math.floor(diff / (1000 * 60 * 60 * 24))
  let hour = 0
  if (timeStr) {
    const match = timeStr.match(/(\d{1,2}):(\d{2})\s*(AM|PM)?/i)
    if (match) {
      hour = parseInt(match[1], 10)
      const ampm = match[3]
      if (ampm) {
        if (ampm.toUpperCase() === 'PM' && hour !== 12) hour += 12
        if (ampm.toUpperCase() === 'AM' && hour === 12) hour = 0
      }
    }
  }
  return `${yy}${String(dayOfYear).padStart(3, '0')}.${String(hour).padStart(2, '0')}`
}

function formatTime12(timeStr?: string): string {
  if (!timeStr) return ''
  const match = timeStr.match(/(\d{1,2}):(\d{2})\s*(AM|PM)?/i)
  if (!match) return timeStr
  let h = parseInt(match[1], 10)
  const m = match[2]
  const ampm = match[3]
  if (ampm) return `${h}:${m} ${ampm.toUpperCase()}`
  const suffix = h >= 12 ? 'PM' : 'AM'
  if (h > 12) h -= 12
  if (h === 0) h = 12
  return `${h}:${m} ${suffix}`
}

function isWeekend(dateStr: string): boolean {
  const d = new Date(dateStr + 'T00:00:00')
  return d.getDay() === 0 || d.getDay() === 5 || d.getDay() === 6
}

function todayStr(): string {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

function nextSundayStr(): string {
  const d = new Date()
  const day = d.getDay()
  const daysToSunday = day === 0 ? 7 : 7 - day
  d.setDate(d.getDate() + daysToSunday)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

function comingFridayStr(): string {
  const d = new Date()
  const day = d.getDay()
  const diff = day <= 5 ? 5 - day : 5 + 7 - day
  d.setDate(d.getDate() + diff)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

/* ───────────────── component ───────────────── */

export default function CalendarPage() {
  /* ── existing state ── */
  const [events, setEvents] = useState<QUEvent[]>([])
  const [loading, setLoading] = useState(true)
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth())
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear())
  const [selectedCategory, setSelectedCategory] = useState('')
  const [keyword, setKeyword] = useState('')
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')

  /* ── new state ── */
  const [location, setLocation] = useState('')
  const [selectedTiles, setSelectedTiles] = useState<Set<string>>(new Set())
  const [filterOpen, setFilterOpen] = useState(false)
  const [viewMode, setViewMode] = useState<'calendar' | 'list'>('calendar')
  const [datePicker, setDatePicker] = useState('')

  /* ── existing fetch logic (unchanged) ── */
  useEffect(() => {
    const fetchEvents = async () => {
      setLoading(true)
      try {
        const q = query(
          collection(db, 'events'),
          where('status', '==', 'approved')
        )
        const snapshot = await getDocs(q)
        const fetched: QUEvent[] = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as QUEvent[]
        setEvents(fetched)
      } catch (err) {
        console.error('Error fetching events:', err)
      } finally {
        setLoading(false)
      }
    }
    fetchEvents()
  }, [])

  /* ── existing filter logic (extended) ── */
  const filteredEvents = useMemo(() => {
    return events.filter((event) => {
      if (selectedCategory && event.category !== selectedCategory) return false
      if (keyword) {
        const kw = keyword.toLowerCase()
        const match =
          event.title?.toLowerCase().includes(kw) ||
          event.venue?.toLowerCase().includes(kw) ||
          event.description?.toLowerCase().includes(kw)
        if (!match) return false
      }
      if (location) {
        const loc = location.toLowerCase()
        if (!event.venue?.toLowerCase().includes(loc)) return false
      }
      if (dateFrom && event.date < dateFrom) return false
      if (dateTo && event.date > dateTo) return false
      if (selectedTiles.size > 0) {
        const tileMatch = Array.from(selectedTiles).some((tile) =>
          event.category?.toLowerCase().includes(tile.toLowerCase())
        )
        if (!tileMatch) return false
      }
      return true
    })
  }, [events, selectedCategory, keyword, location, dateFrom, dateTo, selectedTiles])

  /* ── group events by date ── */
  const eventsByDate = useMemo(() => {
    const map: Record<string, QUEvent[]> = {}
    for (const event of filteredEvents) {
      const dateKey = event.date?.slice(0, 10)
      if (dateKey) {
        if (!map[dateKey]) map[dateKey] = []
        map[dateKey].push(event)
      }
    }
    return map
  }, [filteredEvents])

  /* ── sorted date keys for list view ── */
  const sortedDateKeys = useMemo(() => {
    return Object.keys(eventsByDate).sort()
  }, [eventsByDate])

  /* ── calendar helpers ── */
  const daysInMonth = getDaysInMonth(currentYear, currentMonth)
  const firstDay = getFirstDayOfMonth(currentYear, currentMonth)

  const prevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11)
      setCurrentYear(currentYear - 1)
    } else {
      setCurrentMonth(currentMonth - 1)
    }
  }

  const nextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0)
      setCurrentYear(currentYear + 1)
    } else {
      setCurrentMonth(currentMonth + 1)
    }
  }

  /* ── tile toggle ── */
  const toggleTile = useCallback((label: string) => {
    setSelectedTiles((prev) => {
      const next = new Set(prev)
      if (next.has(label)) next.delete(label)
      else next.add(label)
      return next
    })
  }, [])

  /* ── quick date presets ── */
  const setToday = () => {
    const t = todayStr()
    setDateFrom(t)
    setDateTo(t)
  }

  const setWeekend = () => {
    setDateFrom(comingFridayStr())
    setDateTo(nextSundayStr())
  }

  const clearFilters = () => {
    setKeyword('')
    setLocation('')
    setDateFrom('')
    setDateTo('')
    setDatePicker('')
    setSelectedCategory('')
    setSelectedTiles(new Set())
  }

  const handleDatePicker = (val: string) => {
    setDatePicker(val)
    if (val) {
      setDateFrom(val)
      setDateTo(val)
    }
  }

  /* ── styles ── */
  const inputStyle: React.CSSProperties = {
    padding: '0.6rem 0.75rem',
    borderRadius: '8px',
    border: '1px solid var(--border-glass)',
    background: 'rgba(255, 255, 255, 0.05)',
    color: 'var(--text-primary)',
    fontFamily: "'Exo 2', sans-serif",
    fontSize: '0.85rem',
    outline: 'none',
    flex: 1,
    minWidth: '140px',
  }

  const outlineBtnStyle: React.CSSProperties = {
    padding: '0.5rem 1rem',
    borderRadius: '8px',
    border: '1px solid var(--border-glass)',
    background: 'transparent',
    color: 'var(--text-primary)',
    fontFamily: "'Exo 2', sans-serif",
    fontSize: '0.8rem',
    cursor: 'pointer',
    whiteSpace: 'nowrap',
  }

  /* ────────────────── RENDER ────────────────── */
  return (
    <div>
      {/* ══════════ SECTION 1 — HERO BANNER ══════════ */}
      <div className="glass-card" style={{
        padding: '2.5rem 2rem',
        marginBottom: '1.5rem',
        textAlign: 'center',
      }}>
        <h1 style={{
          fontFamily: "'Orbitron', sans-serif",
          fontSize: 'clamp(1.1rem, 3vw, 1.6rem)',
          fontWeight: 700,
          marginBottom: '0.75rem',
          lineHeight: 1.4,
          color: 'var(--text-primary)',
        }}>
          QU Calendar —{' '}
          Your Non-Profit{' '}
          <span>
            <span style={{ color: 'var(--pride-red)' }}>L</span>
            <span style={{ color: 'var(--pride-orange)' }}>G</span>
            <span style={{ color: 'var(--pride-yellow)' }}>B</span>
            <span style={{ color: 'var(--pride-green)' }}>T</span>
            <span style={{ color: 'var(--pride-blue)' }}>Q</span>
            <span style={{ color: 'var(--pride-violet)' }}>+</span>
          </span>
          {' '}Event Hub
        </h1>
        <p style={{
          fontFamily: "'Exo 2', sans-serif",
          fontSize: 'clamp(0.85rem, 2vw, 1rem)',
          color: 'var(--text-secondary)',
          maxWidth: '640px',
          margin: '0 auto',
          lineHeight: 1.6,
        }}>
          A unified hub for discovering the plethora of gatherings put on by and
          for any of our communities across Cincinnati, Northern Kentucky... and beyond.
        </p>
      </div>

      {/* ══════════ SECTION 2 — FILTER BAR ══════════ */}
      <div className="glass-card" style={{
        padding: '1rem 1.25rem',
        marginBottom: '1.5rem',
      }}>
        {/* Row 1 — Inputs */}
        <div style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: '0.6rem',
          alignItems: 'center',
        }}>
          {/* Search */}
          <div style={{ position: 'relative', flex: 1, minWidth: '160px', display: 'flex', alignItems: 'center' }}>
            <span style={{
              position: 'absolute',
              left: '10px',
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              background: 'var(--pride-blue)',
            }} />
            <input
              type="text"
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              placeholder="Search events..."
              style={{ ...inputStyle, paddingLeft: '1.75rem' }}
            />
          </div>

          {/* Location */}
          <div style={{ position: 'relative', flex: 1, minWidth: '140px', display: 'flex', alignItems: 'center' }}>
            <span style={{
              position: 'absolute',
              left: '10px',
              fontSize: '0.85rem',
            }}>📍</span>
            <input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="Location"
              style={{ ...inputStyle, paddingLeft: '1.75rem' }}
            />
          </div>

          {/* Date picker */}
          <div style={{ position: 'relative', flex: 1, minWidth: '140px', display: 'flex', alignItems: 'center' }}>
            <input
              type="date"
              value={datePicker}
              onChange={(e) => handleDatePicker(e.target.value)}
              style={inputStyle}
            />
          </div>

          {/* Button group */}
          <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
            <button onClick={setToday} style={outlineBtnStyle}>Today</button>
            <button onClick={setWeekend} style={outlineBtnStyle}>Weekend</button>
            <button onClick={clearFilters} style={outlineBtnStyle}>Clear</button>
            <button
              onClick={() => setFilterOpen(!filterOpen)}
              style={{
                ...outlineBtnStyle,
                background: 'var(--pride-yellow)',
                color: '#0a0a0f',
                fontWeight: 700,
                border: '1px solid var(--pride-yellow)',
              }}
            >
              Filter
            </button>
          </div>
        </div>

        {/* Row 2 — Collapsible category tiles */}
        <div>
          <button
            onClick={() => setFilterOpen(!filterOpen)}
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--text-secondary)',
              fontFamily: "'Exo 2', sans-serif",
              fontSize: '0.8rem',
              cursor: 'pointer',
              marginTop: '0.75rem',
              padding: '0.25rem 0',
            }}
          >
            {filterOpen ? '▲' : '▼'} Filter by Event Type
          </button>

          {filterOpen && (
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(80px, 1fr))',
              gap: '0.5rem',
              marginTop: '0.75rem',
            }}>
              {FILTER_CATEGORIES.map((cat) => {
                const isSelected = selectedTiles.has(cat.label)
                return (
                  <button
                    key={cat.label}
                    onClick={() => toggleTile(cat.label)}
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '0.25rem',
                      padding: '0.6rem 0.25rem',
                      borderRadius: '10px',
                      border: isSelected
                        ? '2px solid var(--pride-violet)'
                        : '1px solid var(--border-glass)',
                      background: isSelected
                        ? 'rgba(117, 7, 135, 0.2)'
                        : 'rgba(255, 255, 255, 0.04)',
                      cursor: 'pointer',
                      transition: 'border-color 0.15s, background 0.15s',
                      minHeight: '80px',
                    }}
                  >
                    <span style={{ fontSize: '1.5rem' }}>{cat.emoji}</span>
                    <span style={{
                      fontSize: '0.65rem',
                      color: 'var(--text-secondary)',
                      fontFamily: "'Exo 2', sans-serif",
                      textAlign: 'center',
                      lineHeight: 1.2,
                    }}>
                      {cat.label}
                    </span>
                  </button>
                )
              })}
            </div>
          )}
        </div>
      </div>

      {/* ══════════ SECTION 3 — VIEW TOGGLE ══════════ */}
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        gap: '0',
        marginBottom: '1.5rem',
      }}>
        <button
          onClick={() => setViewMode('calendar')}
          style={{
            padding: '0.55rem 1.5rem',
            borderRadius: '999px 0 0 999px',
            border: '1px solid var(--pride-violet)',
            background: viewMode === 'calendar' ? 'var(--pride-violet)' : 'transparent',
            color: 'var(--text-primary)',
            fontFamily: "'Exo 2', sans-serif",
            fontSize: '0.85rem',
            fontWeight: viewMode === 'calendar' ? 600 : 400,
            cursor: 'pointer',
            transition: 'background 0.15s',
          }}
        >
          Calendar View
        </button>
        <button
          onClick={() => setViewMode('list')}
          style={{
            padding: '0.55rem 1.5rem',
            borderRadius: '0 999px 999px 0',
            border: '1px solid var(--pride-violet)',
            borderLeft: 'none',
            background: viewMode === 'list' ? 'var(--pride-violet)' : 'transparent',
            color: 'var(--text-primary)',
            fontFamily: "'Exo 2', sans-serif",
            fontSize: '0.85rem',
            fontWeight: viewMode === 'list' ? 600 : 400,
            cursor: 'pointer',
            transition: 'background 0.15s',
          }}
        >
          List View
        </button>
      </div>

      {/* ══════════ CONTENT ══════════ */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-secondary)' }}>
          Loading events...
        </div>
      ) : (
        <>
          {/* ══════════ SECTION 4A — CALENDAR VIEW ══════════ */}
          {viewMode === 'calendar' && (
            <>
              {/* Month navigation */}
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '1rem',
              }}>
                <button onClick={prevMonth} style={{
                  background: 'none',
                  border: '1px solid var(--border-glass)',
                  color: 'var(--text-primary)',
                  padding: '0.4rem 1rem',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontFamily: "'Exo 2', sans-serif",
                }}>
                  ← Prev
                </button>
                <h3 style={{
                  fontFamily: "'Orbitron', sans-serif",
                  fontSize: '1.1rem',
                  color: 'var(--text-primary)',
                }}>
                  {MONTH_NAMES[currentMonth]} {currentYear}
                </h3>
                <button onClick={nextMonth} style={{
                  background: 'none',
                  border: '1px solid var(--border-glass)',
                  color: 'var(--text-primary)',
                  padding: '0.4rem 1rem',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontFamily: "'Exo 2', sans-serif",
                }}>
                  Next →
                </button>
              </div>

              {/* Calendar grid */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(7, 1fr)',
                gap: '1px',
                background: 'var(--border-glass)',
                borderRadius: '12px',
                overflow: 'hidden',
              }}>
                {/* Day headers */}
                {DAY_NAMES.map((day) => (
                  <div key={day} style={{
                    padding: '0.5rem',
                    textAlign: 'center',
                    fontFamily: "'Orbitron', sans-serif",
                    fontSize: '0.7rem',
                    color: 'var(--text-secondary)',
                    background: 'var(--bg-dark)',
                  }}>
                    {day}
                  </div>
                ))}

                {/* Empty cells before first day */}
                {Array.from({ length: firstDay }).map((_, i) => (
                  <div key={`empty-${i}`} style={{
                    minHeight: '100px',
                    background: 'var(--bg-dark)',
                    padding: '0.25rem',
                  }} />
                ))}

                {/* Day cells */}
                {Array.from({ length: daysInMonth }).map((_, i) => {
                  const day = i + 1
                  const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
                  const dayEvents = eventsByDate[dateStr] || []
                  const isToday =
                    day === new Date().getDate() &&
                    currentMonth === new Date().getMonth() &&
                    currentYear === new Date().getFullYear()

                  return (
                    <div key={day} style={{
                      minHeight: '100px',
                      background: isToday ? 'rgba(255, 255, 255, 0.08)' : 'var(--bg-dark)',
                      padding: '0.25rem',
                      position: 'relative',
                    }}>
                      <span style={{
                        fontSize: '0.75rem',
                        color: isToday ? 'var(--pride-yellow)' : 'var(--text-secondary)',
                        fontWeight: isToday ? 700 : 400,
                        padding: '0.15rem 0.3rem',
                      }}>
                        {day}
                      </span>
                      <div style={{ marginTop: '0.15rem' }}>
                        {dayEvents.slice(0, 3).map((event) => (
                          <a
                            key={event.id}
                            href={`/events/${event.id}`}
                            style={{
                              display: 'block',
                              fontSize: '0.6rem',
                              padding: '0.1rem 0.25rem',
                              marginBottom: '0.1rem',
                              borderRadius: '3px',
                              background: 'rgba(117, 7, 135, 0.3)',
                              color: 'var(--text-primary)',
                              textDecoration: 'none',
                              overflow: 'hidden',
                              whiteSpace: 'nowrap',
                              textOverflow: 'ellipsis',
                            }}
                          >
                            {EVENT_CATEGORIES[event.category] || '📅'} {event.title}
                          </a>
                        ))}
                        {dayEvents.length > 3 && (
                          <span style={{ fontSize: '0.55rem', color: 'var(--text-secondary)', padding: '0 0.25rem' }}>
                            +{dayEvents.length - 3} more
                          </span>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>

              {/* Event cards list below calendar */}
              {filteredEvents.length > 0 ? (
                <>
                  <h3 style={{
                    fontFamily: "'Orbitron', sans-serif",
                    fontSize: '1rem',
                    color: 'var(--text-primary)',
                    margin: '2rem 0 1rem',
                  }}>
                    {selectedCategory || 'All'} Events — {MONTH_NAMES[currentMonth]} {currentYear}
                  </h3>
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
                    gap: '1rem',
                  }}>
                    {filteredEvents
                      .filter((e) => {
                        const d = e.date?.slice(0, 7)
                        return d === `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}`
                      })
                      .sort((a, b) => a.date.localeCompare(b.date))
                      .map((event) => (
                        <ListEventCard key={event.id} event={event} index={0} />
                      ))}
                  </div>
                </>
              ) : (
                <div style={{
                  textAlign: 'center',
                  padding: '3rem 1rem',
                  color: 'var(--text-secondary)',
                }}>
                  <p style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>📅</p>
                  <p>No events found. Check back soon!</p>
                </div>
              )}
            </>
          )}

          {/* ══════════ SECTION 4B — LIST VIEW ══════════ */}
          {viewMode === 'list' && (
            <div>
              {sortedDateKeys.length === 0 ? (
                <div style={{
                  textAlign: 'center',
                  padding: '3rem 1rem',
                  color: 'var(--text-secondary)',
                }}>
                  <p style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>📅</p>
                  <p>No events found. Check back soon!</p>
                </div>
              ) : (
                sortedDateKeys.map((dateKey) => {
                  const dateEvents = eventsByDate[dateKey]
                  const d = new Date(dateKey + 'T00:00:00')
                  const dayNum = d.getDate()
                  const monthAbbr = MONTH_ABBRS[d.getMonth()]
                  const dayName = DAY_FULL_NAMES[d.getDay()]
                  const fullDate = `${MONTH_NAMES[d.getMonth()]} ${dayNum}, ${d.getFullYear()}`

                  return (
                    <div key={dateKey} style={{ marginBottom: '2rem' }}>
                      {/* Date header row */}
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '1rem',
                        marginBottom: '1rem',
                        flexWrap: 'wrap',
                      }}>
                        {/* Day box */}
                        <div style={{
                          background: 'rgba(255, 255, 255, 0.06)',
                          borderRadius: '10px',
                          width: '60px',
                          height: '60px',
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center',
                          justifyContent: 'center',
                          flexShrink: 0,
                        }}>
                          <span style={{
                            fontFamily: "'Orbitron', sans-serif",
                            fontSize: '1.4rem',
                            fontWeight: 700,
                            color: 'var(--text-primary)',
                            lineHeight: 1,
                          }}>
                            {dayNum}
                          </span>
                          <span style={{
                            fontFamily: "'Orbitron', sans-serif",
                            fontSize: '0.6rem',
                            color: 'var(--text-secondary)',
                            marginTop: '2px',
                          }}>
                            {monthAbbr}
                          </span>
                        </div>

                        {/* Day name & full date */}
                        <div style={{ flex: 1, minWidth: '120px' }}>
                          <div style={{
                            fontFamily: "'Orbitron', sans-serif",
                            fontSize: '1.1rem',
                            fontWeight: 700,
                            color: 'var(--text-primary)',
                          }}>
                            {dayName}
                          </div>
                          <div style={{
                            fontSize: '0.8rem',
                            color: 'var(--text-secondary)',
                            fontFamily: "'Exo 2', sans-serif",
                          }}>
                            {fullDate}
                          </div>
                        </div>

                        {/* Event count pill */}
                        <span style={{
                          padding: '0.3rem 0.8rem',
                          borderRadius: '999px',
                          background: 'var(--pride-violet)',
                          color: 'var(--text-primary)',
                          fontSize: '0.75rem',
                          fontFamily: "'Exo 2', sans-serif",
                          fontWeight: 600,
                          flexShrink: 0,
                        }}>
                          {dateEvents.length} event{dateEvents.length !== 1 ? 's' : ''}
                        </span>
                      </div>

                      {/* Event cards row */}
                      <div style={{
                        display: 'flex',
                        flexWrap: 'wrap',
                        gap: '1rem',
                      }}>
                        {dateEvents.map((event, idx) => (
                          <ListEventCard key={event.id} event={event} index={idx} />
                        ))}
                      </div>
                    </div>
                  )
                })
              )}
            </div>
          )}
        </>
      )}
    </div>
  )
}

/* ────────────── List Event Card ────────────── */

function ListEventCard({ event, index }: { event: QUEvent; index: number }) {
  const borderColor = PRIDE_COLORS[index % PRIDE_COLORS.length]
  const emoji = EVENT_CATEGORIES[event.category] || '📅'
  const timeDisplay = formatTime12(event.time)
  const stardate = toStardate(event.date, event.time)

  return (
    <Link href={`/events/${event.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
      <div className="glass-card" style={{
        borderLeft: `4px solid ${borderColor}`,
        padding: '1rem 1.25rem',
        minWidth: '260px',
        maxWidth: '360px',
        cursor: 'pointer',
        transition: 'transform 0.15s, border-color 0.15s',
      }}>
        {/* Time */}
        {timeDisplay && (
          <div style={{
            fontFamily: "'Orbitron', sans-serif",
            fontSize: '1rem',
            fontWeight: 700,
            color: 'var(--pride-orange)',
            marginBottom: '0.1rem',
          }}>
            {timeDisplay}
          </div>
        )}
        {/* Stardate */}
        <div style={{
          fontSize: '0.7rem',
          color: 'var(--text-secondary)',
          fontFamily: "'Exo 2', sans-serif",
          marginBottom: '0.5rem',
        }}>
          Stardate {stardate}
        </div>
        {/* Title */}
        <div style={{
          fontSize: '1.05rem',
          fontWeight: 600,
          color: 'var(--text-primary)',
          fontFamily: "'Exo 2', sans-serif",
          marginBottom: '0.35rem',
        }}>
          {event.title}
        </div>
        {/* Venue */}
        {event.venue && (
          <div style={{
            fontSize: '0.8rem',
            color: 'var(--text-secondary)',
            marginBottom: '0.35rem',
          }}>
            📍 {event.venue}
          </div>
        )}
        {/* Category emoji row */}
        <div style={{ fontSize: '1.1rem', marginBottom: '0.35rem' }}>
          {emoji}
        </div>
        {/* Category pill */}
        <span style={{
          display: 'inline-block',
          padding: '0.15rem 0.6rem',
          borderRadius: '999px',
          background: 'rgba(117, 7, 135, 0.3)',
          fontSize: '0.7rem',
          color: 'var(--text-secondary)',
          fontFamily: "'Exo 2', sans-serif",
        }}>
          {event.category}
        </span>
      </div>
    </Link>
  )
}
