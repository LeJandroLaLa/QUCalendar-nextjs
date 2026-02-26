'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { collection, addDoc, getDocs, query, where, serverTimestamp } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { useAuth } from '@/hooks/useAuth'
import { EVENT_CATEGORIES, Venue, Artist } from '@/lib/types'
import ImageUpload from '@/components/ImageUpload'

const categoryNames = Object.keys(EVENT_CATEGORIES)

export default function SubmitEventPage() {
  const { user, loading: authLoading } = useAuth()
  const router = useRouter()
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [venues, setVenues] = useState<Venue[]>([])
  const [artists, setArtists] = useState<Artist[]>([])
  const [venueMode, setVenueMode] = useState<'select' | 'manual'>('select')
  const [form, setForm] = useState({
    title: '',
    description: '',
    category: '',
    startDate: '',
    startTime: '',
    endDate: '',
    endTime: '',
    isMultiDay: false,
    venueId: '',
    venueManual: '',
    artistId: '',
    ticketLink: '',
    imageUrl: '',
  })

  // Fetch approved venues and artists for dropdowns
  useEffect(() => {
    const fetchOptions = async () => {
      try {
        const [venueSnap, artistSnap] = await Promise.all([
          getDocs(query(collection(db, 'venues'), where('status', '==', 'approved'))),
          getDocs(query(collection(db, 'artists'), where('status', '==', 'approved'))),
        ])
        setVenues(venueSnap.docs.map((d) => ({ id: d.id, ...d.data() }) as Venue))
        setArtists(artistSnap.docs.map((d) => ({ id: d.id, ...d.data() }) as Artist))
      } catch (err) {
        console.error('Error fetching options:', err)
      }
    }
    fetchOptions()
  }, [])

  if (authLoading) {
    return <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-secondary)' }}>Loading...</div>
  }

  if (!user) {
    router.push('/signin')
    return null
  }

  const updateField = (field: string, value: string | boolean) => {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.title.trim() || !form.category || !form.startDate) {
      setError('Title, category, and start date are required.')
      return
    }

    setError('')
    setSubmitting(true)
    try {
      const selectedVenue = venues.find((v) => v.id === form.venueId)
      const selectedArtist = artists.find((a) => a.id === form.artistId)

      await addDoc(collection(db, 'events'), {
        title: form.title.trim(),
        description: form.description.trim(),
        category: form.category,
        date: form.startDate,
        time: form.startTime,
        endDate: form.isMultiDay ? form.endDate : form.startDate,
        endTime: form.endTime,
        isMultiDay: form.isMultiDay,
        venueId: venueMode === 'select' ? form.venueId : '',
        venue: venueMode === 'select' ? (selectedVenue?.name || '') : form.venueManual.trim(),
        artistId: form.artistId,
        artist: selectedArtist?.name || '',
        ticketLink: form.ticketLink.trim(),
        imageUrl: form.imageUrl,
        status: 'pending',
        submittedBy: user.uid,
        submittedAt: serverTimestamp(),
      })
      router.push('/submit/confirmation')
    } catch (err) {
      console.error('Error submitting event:', err)
      setError('Failed to submit. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  const inputStyle: React.CSSProperties = {
    padding: '0.6rem 0.75rem',
    borderRadius: '8px',
    border: '1px solid var(--border-glass)',
    background: 'rgba(255, 255, 255, 0.05)',
    color: 'var(--text-primary)',
    fontFamily: "'Exo 2', sans-serif",
    fontSize: '0.9rem',
    outline: 'none',
    width: '100%',
  }

  const labelStyle: React.CSSProperties = {
    display: 'block',
    fontSize: '0.85rem',
    color: 'var(--text-secondary)',
    marginBottom: '0.35rem',
  }

  const toggleBtnStyle = (active: boolean): React.CSSProperties => ({
    padding: '0.4rem 1rem',
    borderRadius: '999px',
    border: '1px solid var(--border-glass)',
    background: active ? 'rgba(117, 7, 135, 0.3)' : 'transparent',
    color: 'var(--text-primary)',
    cursor: 'pointer',
    fontFamily: "'Exo 2', sans-serif",
    fontSize: '0.8rem',
  })

  return (
    <div style={{ maxWidth: '640px', margin: '1rem auto', padding: '0 1rem' }}>
      <h2 style={{
        fontFamily: "'Orbitron', sans-serif",
        fontSize: '1.3rem',
        marginBottom: '1.5rem',
      }} className="pride-gradient-text">
        Submit an Event
      </h2>

      {error && (
        <div style={{
          background: 'rgba(255, 0, 24, 0.1)',
          border: '1px solid var(--pride-red)',
          borderRadius: '8px',
          padding: '0.75rem 1rem',
          marginBottom: '1rem',
          color: 'var(--pride-red)',
          fontSize: '0.9rem',
        }}>
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="glass-card" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        {/* Title */}
        <div>
          <label style={labelStyle}>Title *</label>
          <input type="text" value={form.title} onChange={(e) => updateField('title', e.target.value)} required style={inputStyle} />
        </div>

        {/* Description */}
        <div>
          <label style={labelStyle}>Description</label>
          <textarea
            value={form.description}
            onChange={(e) => updateField('description', e.target.value)}
            rows={4}
            style={{ ...inputStyle, resize: 'vertical' }}
          />
        </div>

        {/* Category */}
        <div>
          <label style={labelStyle}>Category *</label>
          <select value={form.category} onChange={(e) => updateField('category', e.target.value)} required style={{ ...inputStyle, cursor: 'pointer' }}>
            <option value="">Select category...</option>
            {categoryNames.map((cat) => (
              <option key={cat} value={cat}>{EVENT_CATEGORIES[cat]} {cat}</option>
            ))}
          </select>
        </div>

        {/* Start Date/Time */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
          <div>
            <label style={labelStyle}>Start Date *</label>
            <input type="date" value={form.startDate} onChange={(e) => updateField('startDate', e.target.value)} required style={inputStyle} />
          </div>
          <div>
            <label style={labelStyle}>Start Time</label>
            <input type="time" value={form.startTime} onChange={(e) => updateField('startTime', e.target.value)} style={inputStyle} />
          </div>
        </div>

        {/* Multi-day toggle */}
        <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
          <input
            type="checkbox"
            checked={form.isMultiDay}
            onChange={(e) => updateField('isMultiDay', e.target.checked)}
            style={{ accentColor: 'var(--pride-violet)' }}
          />
          <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Multi-day event</span>
        </label>

        {/* End Date/Time */}
        {form.isMultiDay && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
            <div>
              <label style={labelStyle}>End Date</label>
              <input type="date" value={form.endDate} onChange={(e) => updateField('endDate', e.target.value)} style={inputStyle} />
            </div>
            <div>
              <label style={labelStyle}>End Time</label>
              <input type="time" value={form.endTime} onChange={(e) => updateField('endTime', e.target.value)} style={inputStyle} />
            </div>
          </div>
        )}

        {!form.isMultiDay && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '0.75rem' }}>
            <div>
              <label style={labelStyle}>End Time</label>
              <input type="time" value={form.endTime} onChange={(e) => updateField('endTime', e.target.value)} style={inputStyle} />
            </div>
          </div>
        )}

        {/* Venue */}
        <div>
          <label style={labelStyle}>Venue</label>
          <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.5rem' }}>
            <button type="button" onClick={() => setVenueMode('select')} style={toggleBtnStyle(venueMode === 'select')}>
              Select Existing
            </button>
            <button type="button" onClick={() => setVenueMode('manual')} style={toggleBtnStyle(venueMode === 'manual')}>
              Enter Manually
            </button>
          </div>
          {venueMode === 'select' ? (
            <select value={form.venueId} onChange={(e) => updateField('venueId', e.target.value)} style={{ ...inputStyle, cursor: 'pointer' }}>
              <option value="">Select venue...</option>
              {venues.map((v) => (
                <option key={v.id} value={v.id}>{v.name}</option>
              ))}
            </select>
          ) : (
            <input type="text" value={form.venueManual} onChange={(e) => updateField('venueManual', e.target.value)} placeholder="Venue name" style={inputStyle} />
          )}
        </div>

        {/* Artist */}
        <div>
          <label style={labelStyle}>Associated Artist (optional)</label>
          <select value={form.artistId} onChange={(e) => updateField('artistId', e.target.value)} style={{ ...inputStyle, cursor: 'pointer' }}>
            <option value="">None</option>
            {artists.map((a) => (
              <option key={a.id} value={a.id}>{a.name}</option>
            ))}
          </select>
        </div>

        {/* Ticket Link */}
        <div>
          <label style={labelStyle}>Ticket Link (optional)</label>
          <input type="url" value={form.ticketLink} onChange={(e) => updateField('ticketLink', e.target.value)} placeholder="https://" style={inputStyle} />
        </div>

        {/* Image */}
        <ImageUpload
          storagePath={`events/${user.uid}`}
          onImageUrl={(url) => setForm((prev) => ({ ...prev, imageUrl: url }))}
        />

        {/* Submit */}
        <button
          type="submit"
          disabled={submitting}
          style={{
            padding: '0.75rem 2rem',
            borderRadius: '8px',
            border: 'none',
            background: 'var(--pride-violet)',
            color: '#fff',
            fontFamily: "'Exo 2', sans-serif",
            fontWeight: 600,
            fontSize: '1rem',
            cursor: submitting ? 'not-allowed' : 'pointer',
            opacity: submitting ? 0.6 : 1,
          }}
        >
          {submitting ? 'Submitting...' : 'Submit Event'}
        </button>
      </form>
    </div>
  )
}
