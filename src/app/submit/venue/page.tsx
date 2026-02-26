'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { collection, addDoc, serverTimestamp } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { useAuth } from '@/hooks/useAuth'
import ImageUpload from '@/components/ImageUpload'

const VENUE_TYPES = [
  'Bar', 'Club', 'Restaurant', 'Theater', 'Gallery',
  'Community Center', 'Outdoor Space', 'Other',
]

const AMENITIES = [
  'Accessible Entrance', 'Gender Neutral Bathrooms', 'Outdoor Space',
  'Parking', '21+', 'All Ages',
]

export default function SubmitVenuePage() {
  const { user, loading: authLoading } = useAuth()
  const router = useRouter()
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [form, setForm] = useState({
    name: '',
    type: '',
    address: '',
    description: '',
    website: '',
    phone: '',
    amenities: [] as string[],
    imageUrl: '',
  })

  if (authLoading) {
    return <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-secondary)' }}>Loading...</div>
  }

  if (!user) {
    router.push('/signin')
    return null
  }

  const updateField = (field: string, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  const toggleAmenity = (amenity: string) => {
    setForm((prev) => ({
      ...prev,
      amenities: prev.amenities.includes(amenity)
        ? prev.amenities.filter((a) => a !== amenity)
        : [...prev.amenities, amenity],
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.name.trim() || !form.type) {
      setError('Name and type are required.')
      return
    }

    setError('')
    setSubmitting(true)
    try {
      await addDoc(collection(db, 'venues'), {
        name: form.name.trim(),
        type: form.type,
        address: form.address.trim(),
        description: form.description.trim(),
        website: form.website.trim(),
        phone: form.phone.trim(),
        amenities: form.amenities,
        imageUrl: form.imageUrl,
        status: 'pending',
        submittedBy: user.uid,
        submittedAt: serverTimestamp(),
      })
      router.push('/submit/confirmation')
    } catch (err) {
      console.error('Error submitting venue:', err)
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

  return (
    <div style={{ maxWidth: '640px', margin: '1rem auto', padding: '0 1rem' }}>
      <h2 style={{
        fontFamily: "'Orbitron', sans-serif",
        fontSize: '1.3rem',
        marginBottom: '1.5rem',
      }} className="pride-gradient-text">
        Submit a Venue
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
        {/* Name */}
        <div>
          <label style={labelStyle}>Name *</label>
          <input type="text" value={form.name} onChange={(e) => updateField('name', e.target.value)} required style={inputStyle} />
        </div>

        {/* Type */}
        <div>
          <label style={labelStyle}>Type *</label>
          <select value={form.type} onChange={(e) => updateField('type', e.target.value)} required style={{ ...inputStyle, cursor: 'pointer' }}>
            <option value="">Select type...</option>
            {VENUE_TYPES.map((t) => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>
        </div>

        {/* Address */}
        <div>
          <label style={labelStyle}>Address</label>
          <input type="text" value={form.address} onChange={(e) => updateField('address', e.target.value)} style={inputStyle} />
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

        {/* Website */}
        <div>
          <label style={labelStyle}>Website</label>
          <input type="url" value={form.website} onChange={(e) => updateField('website', e.target.value)} placeholder="https://" style={inputStyle} />
        </div>

        {/* Phone */}
        <div>
          <label style={labelStyle}>Phone</label>
          <input type="text" value={form.phone} onChange={(e) => updateField('phone', e.target.value)} style={inputStyle} />
        </div>

        {/* Amenities */}
        <div>
          <label style={labelStyle}>Amenities</label>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
            {AMENITIES.map((amenity) => (
              <label key={amenity} style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.35rem',
                padding: '0.35rem 0.75rem',
                borderRadius: '999px',
                border: '1px solid var(--border-glass)',
                background: form.amenities.includes(amenity) ? 'rgba(117, 7, 135, 0.3)' : 'transparent',
                cursor: 'pointer',
                fontSize: '0.8rem',
                color: 'var(--text-primary)',
              }}>
                <input
                  type="checkbox"
                  checked={form.amenities.includes(amenity)}
                  onChange={() => toggleAmenity(amenity)}
                  style={{ display: 'none' }}
                />
                {amenity}
              </label>
            ))}
          </div>
        </div>

        {/* Image */}
        <ImageUpload
          storagePath={`venues/${user.uid}`}
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
          {submitting ? 'Submitting...' : 'Submit Venue'}
        </button>
      </form>
    </div>
  )
}
