'use client'

import { useEffect, useState, useMemo } from 'react'
import { collection, query, where, getDocs } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { QUEvent, EVENT_CATEGORIES } from '@/lib/types'
import EventCard from '@/components/EventCard'

const categoryNames = Object.keys(EVENT_CATEGORIES)

function getDaysInMonth(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate()
}

function getFirstDayOfMonth(year: number, month: number) {
  return new Date(year, month, 1).getDay()
}

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
]

const DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

export default function CalendarPage() {
  const [events, setEvents] = useState<QUEvent[]>([])
  const [loading, setLoading] = useState(true)
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth())
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear())
  const [selectedCategory, setSelectedCategory] = useState('')
  const [keyword, setKeyword] = useState('')
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')

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
      if (dateFrom && event.date < dateFrom) return false
      if (dateTo && event.date > dateTo) return false
      return true
    })
  }, [events, selectedCategory, keyword, dateFrom, dateTo])

  // Group events by date string (YYYY-MM-DD)
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

  const inputStyle: React.CSSProperties = {
    padding: '0.5rem 0.75rem',
    borderRadius: '8px',
    border: '1px solid var(--border-glass)',
    background: 'rgba(255, 255, 255, 0.05)',
    color: 'var(--text-primary)',
    fontFamily: "'Exo 2', sans-serif",
    fontSize: '0.85rem',
    outline: 'none',
  }

  return (
    <div>
      <h2 style={{
        fontFamily: "'Orbitron', sans-serif",
        fontSize: '1.3rem',
        marginBottom: '1.5rem',
      }} className="pride-gradient-text">
        Event Calendar
      </h2>

      {/* Filter bar */}
      <div className="glass-card" style={{
        padding: '1rem',
        marginBottom: '1.5rem',
        display: 'flex',
        flexWrap: 'wrap',
        gap: '0.75rem',
        alignItems: 'center',
      }}>
        <input
          type="date"
          value={dateFrom}
          onChange={(e) => setDateFrom(e.target.value)}
          style={inputStyle}
          placeholder="From"
        />
        <span style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>to</span>
        <input
          type="date"
          value={dateTo}
          onChange={(e) => setDateTo(e.target.value)}
          style={inputStyle}
          placeholder="To"
        />
        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          style={{ ...inputStyle, cursor: 'pointer' }}
        >
          <option value="">All Categories</option>
          {categoryNames.map((cat) => (
            <option key={cat} value={cat}>
              {EVENT_CATEGORIES[cat]} {cat}
            </option>
          ))}
        </select>
        <input
          type="text"
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
          placeholder="Search events..."
          style={{ ...inputStyle, flex: 1, minWidth: '150px' }}
        />
      </div>

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

      {loading ? (
        <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-secondary)' }}>
          Loading events...
        </div>
      ) : (
        <>
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
                    <EventCard key={event.id} event={event} />
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
    </div>
  )
}
