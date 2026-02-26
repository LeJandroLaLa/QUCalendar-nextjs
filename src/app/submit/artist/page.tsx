'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { collection, addDoc, serverTimestamp } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { useAuth } from '@/hooks/useAuth'
import ImageUpload from '@/components/ImageUpload'

const ARTIST_TYPES = [
  'Drag Queen', 'Drag King', 'Drag Performer', 'Singer', 'DJ',
  'Band', 'Comedian', 'Dancer', 'Visual Artist', 'Other',
]

export default function SubmitArtistPage() {
  const { user, loading: authLoading } = useAuth()
  const router = useRouter()
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [form, setForm] = useState({
    name: '',
    type: '',
    bio: '',
    website: '',
    instagram: '',
    facebook: '',
    tiktok: '',
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.name.trim() || !form.type) {
      setError('Name and type are required.')
      return
    }

    setError('')
    setSubmitting(true)
    try {
      const socialLinks: Record<string, string> = {}
      if (form.instagram.trim()) socialLinks.instagram = form.instagram.trim()
      if (form.facebook.trim()) socialLinks.facebook = form.facebook.trim()
      if (form.tiktok.trim()) socialLinks.tiktok = form.tiktok.trim()

      await addDoc(collection(db, 'artists'), {
        name: form.name.trim(),
        type: form.type,
        bio: form.bio.trim(),
        website: form.website.trim(),
        socialLinks,
        imageUrl: form.imageUrl,
        status: 'pending',
        submittedBy: user.uid,
        submittedAt: serverTimestamp(),
      })
      router.push('/submit/confirmation')
    } catch (err) {
      console.error('Error submitting artist:', err)
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
        Submit an Artist
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
            {ARTIST_TYPES.map((t) => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>
        </div>

        {/* Bio */}
        <div>
          <label style={labelStyle}>Bio</label>
          <textarea
            value={form.bio}
            onChange={(e) => updateField('bio', e.target.value)}
            rows={4}
            style={{ ...inputStyle, resize: 'vertical' }}
          />
        </div>

        {/* Website */}
        <div>
          <label style={labelStyle}>Website</label>
          <input type="url" value={form.website} onChange={(e) => updateField('website', e.target.value)} placeholder="https://" style={inputStyle} />
        </div>

        {/* Social Links */}
        <div>
          <label style={labelStyle}>Social Links</label>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', width: '80px' }}>Instagram</span>
              <input type="text" value={form.instagram} onChange={(e) => updateField('instagram', e.target.value)} placeholder="@handle or URL" style={inputStyle} />
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', width: '80px' }}>Facebook</span>
              <input type="text" value={form.facebook} onChange={(e) => updateField('facebook', e.target.value)} placeholder="Page URL" style={inputStyle} />
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', width: '80px' }}>TikTok</span>
              <input type="text" value={form.tiktok} onChange={(e) => updateField('tiktok', e.target.value)} placeholder="@handle or URL" style={inputStyle} />
            </div>
          </div>
        </div>

        {/* Image */}
        <ImageUpload
          storagePath={`artists/${user.uid}`}
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
          {submitting ? 'Submitting...' : 'Submit Artist'}
        </button>
      </form>
    </div>
  )
}
