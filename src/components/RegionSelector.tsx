'use client'

import { useEffect, useState } from 'react'
import { getActiveRegions } from '@/lib/regions'
import { useAuth } from '@/context/AuthContext'
import { QURegion } from '@/lib/types'

export default function RegionSelector() {
  const { quUser, updateUserRegion } = useAuth()
  const [regions, setRegions] = useState<QURegion[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    getActiveRegions()
      .then(setRegions)
      .finally(() => setLoading(false))
  }, [])

  const handleChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const regionId = e.target.value
    if (!regionId) return
    setSaving(true)
    try {
      await updateUserRegion(regionId)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div>
      {loading ? (
        <p style={{
          fontFamily: "'Exo 2', sans-serif",
          color: 'var(--text-secondary)',
          fontSize: '0.9rem',
          margin: 0,
        }}>
          Loading regions…
        </p>
      ) : (
        <select
          value={quUser?.regionId ?? ''}
          onChange={handleChange}
          disabled={saving}
          style={{
            width: '100%',
            padding: '0.65rem 1rem',
            borderRadius: 10,
            border: '1px solid var(--border-glass)',
            background: 'rgba(255,255,255,0.05)',
            color: quUser?.regionId ? 'var(--text-primary)' : 'var(--text-secondary)',
            fontFamily: "'Exo 2', sans-serif",
            fontSize: '0.9rem',
            outline: 'none',
            cursor: saving ? 'wait' : 'pointer',
            appearance: 'none',
            WebkitAppearance: 'none',
          }}
        >
          <option value="" disabled style={{ background: '#1a1a2e', color: 'var(--text-secondary)' }}>
            Select your region…
          </option>
          {regions.map(region => (
            <option
              key={region.id}
              value={region.id}
              style={{ background: '#1a1a2e', color: 'var(--text-primary)' }}
            >
              {region.name} — {region.state}, {region.country}
            </option>
          ))}
        </select>
      )}
    </div>
  )
}
