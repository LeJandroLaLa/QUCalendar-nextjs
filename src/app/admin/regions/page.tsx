'use client'

import { useEffect, useState, type CSSProperties } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { getAllRegions, createRegion, getRegionModerators } from '@/lib/regions'
import { seedCincinnatiRegion } from '@/lib/seedRegions'
import type { QURegion } from '@/lib/types'

interface RegionWithCount extends QURegion {
  moderatorCount: number
}

export default function RegionsAdminPage() {
  const { quUser } = useAuth()
  const [regions, setRegions] = useState<RegionWithCount[]>([])
  const [loading, setLoading] = useState(true)
  const [seedLoading, setSeedLoading] = useState(false)
  const [seedMessage, setSeedMessage] = useState('')
  const [addLoading, setAddLoading] = useState(false)
  const [addError, setAddError] = useState('')
  const [addSuccess, setAddSuccess] = useState('')

  const [formName, setFormName] = useState('')
  const [formState, setFormState] = useState('')
  const [formCountry, setFormCountry] = useState('US')
  const [formTimezone, setFormTimezone] = useState('')
  const [formStatus, setFormStatus] = useState<'active' | 'pending'>('pending')

  const isSuperAdmin = quUser?.roles.includes('superadmin') ?? false

  const loadRegions = async () => {
    setLoading(true)
    try {
      const all = await getAllRegions()
      const withCounts = await Promise.all(
        all.map(async (region) => {
          const mods = await getRegionModerators(region.id)
          return { ...region, moderatorCount: mods.length }
        })
      )
      setRegions(withCounts)
    } catch (err) {
      console.error('Error loading regions:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadRegions()
  }, [])

  const handleSeed = async () => {
    setSeedLoading(true)
    setSeedMessage('')
    try {
      const result = await seedCincinnatiRegion()
      setSeedMessage(result.message)
      if (result.created) await loadRegions()
    } catch {
      setSeedMessage('Failed to run seed.')
    } finally {
      setSeedLoading(false)
    }
  }

  const handleAddRegion = async () => {
    setAddError('')
    setAddSuccess('')
    if (!formName.trim() || !formState.trim() || !formCountry.trim() || !formTimezone.trim()) {
      setAddError('All fields are required.')
      return
    }
    const id = `${formName.trim().toLowerCase().replace(/\s+/g, '-')}-${formState.trim().toLowerCase()}-${formCountry.trim().toLowerCase()}`
    setAddLoading(true)
    try {
      await createRegion({
        id,
        name: formName.trim(),
        state: formState.trim().toUpperCase(),
        country: formCountry.trim().toUpperCase(),
        timezone: formTimezone.trim(),
        status: formStatus,
      })
      setAddSuccess(`Region "${formName.trim()}" created successfully.`)
      setFormName('')
      setFormState('')
      setFormCountry('US')
      setFormTimezone('')
      setFormStatus('pending')
      await loadRegions()
    } catch {
      setAddError('Failed to create region. It may already exist.')
    } finally {
      setAddLoading(false)
    }
  }

  if (!isSuperAdmin) {
    return (
      <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-secondary)' }}>
        Access denied. Superadmin role required.
      </div>
    )
  }

  const statusColor = (status: string) =>
    status === 'active' ? 'var(--pride-green)' : 'var(--pride-orange)'

  const inputStyle: CSSProperties = {
    padding: '10px 16px',
    height: '44px',
    borderRadius: '8px',
    border: '1px solid var(--border-glass)',
    background: 'rgba(255,255,255,0.05)',
    color: 'var(--text-primary)',
    fontFamily: "'Exo 2', sans-serif",
    fontSize: '0.9rem',
    outline: 'none',
    boxSizing: 'border-box',
  }

  return (
    <div>
      <h2 style={{
        fontFamily: "'Orbitron', sans-serif",
        fontSize: '1.3rem',
        marginBottom: '1.5rem',
      }} className="pride-gradient-text">
        Region Management
      </h2>

      {/* Seed Tool */}
      <div className="glass-card" style={{ padding: '1.25rem', marginBottom: '2rem' }}>
        <h3 style={{ fontFamily: "'Orbitron', sans-serif", fontSize: '0.9rem', marginBottom: '1rem', color: 'var(--text-primary)' }}>
          Seed Tool
        </h3>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
          <button
            onClick={handleSeed}
            disabled={seedLoading}
            style={{
              padding: '0 1.5rem',
              height: '44px',
              borderRadius: '8px',
              border: 'none',
              background: seedLoading ? 'rgba(117,7,135,0.3)' : 'rgba(117,7,135,0.5)',
              color: 'var(--text-primary)',
              fontFamily: "'Exo 2', sans-serif",
              fontSize: '0.85rem',
              fontWeight: 600,
              cursor: seedLoading ? 'not-allowed' : 'pointer',
              opacity: seedLoading ? 0.7 : 1,
              whiteSpace: 'nowrap',
            }}
          >
            {seedLoading ? 'Running…' : 'Run Seed'}
          </button>
          {seedMessage && (
            <span style={{
              fontFamily: "'Exo 2', sans-serif",
              fontSize: '0.85rem',
              color: seedMessage.includes('already') ? 'var(--pride-orange)' : 'var(--pride-green)',
            }}>
              {seedMessage}
            </span>
          )}
        </div>
      </div>

      {/* Regions List */}
      <div className="glass-card" style={{ padding: '1.25rem', marginBottom: '2rem' }}>
        <h3 style={{ fontFamily: "'Orbitron', sans-serif", fontSize: '0.9rem', marginBottom: '1rem', color: 'var(--text-primary)' }}>
          Regions
        </h3>

        {loading ? (
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Loading regions…</p>
        ) : regions.length === 0 ? (
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>No regions found. Run the seed to add the first one.</p>
        ) : (
          <div>
            <div style={{
              display: 'grid',
              gridTemplateColumns: '1fr 60px 80px 100px 60px',
              gap: '0.5rem',
              padding: '0.4rem 0',
              borderBottom: '1px solid var(--border-glass)',
              marginBottom: '0.25rem',
            }}>
              {['Name', 'State', 'Country', 'Status', 'Mods'].map(h => (
                <span key={h} style={{
                  fontFamily: "'Orbitron', sans-serif",
                  fontSize: '0.65rem',
                  letterSpacing: '0.1em',
                  color: 'var(--text-secondary)',
                  opacity: 0.7,
                  textTransform: 'uppercase',
                }}>
                  {h}
                </span>
              ))}
            </div>

            {regions.map((region) => (
              <div key={region.id} style={{
                display: 'grid',
                gridTemplateColumns: '1fr 60px 80px 100px 60px',
                gap: '0.5rem',
                alignItems: 'center',
                padding: '0.55rem 0',
                borderBottom: '1px solid var(--border-glass)',
              }}>
                <span style={{
                  fontFamily: "'Exo 2', sans-serif",
                  fontSize: '0.9rem',
                  color: 'var(--text-primary)',
                }}>
                  {region.name}
                </span>
                <span style={{
                  fontFamily: "'Exo 2', sans-serif",
                  fontSize: '0.85rem',
                  color: 'var(--text-secondary)',
                }}>
                  {region.state}
                </span>
                <span style={{
                  fontFamily: "'Exo 2', sans-serif",
                  fontSize: '0.85rem',
                  color: 'var(--text-secondary)',
                }}>
                  {region.country}
                </span>
                <span style={{
                  fontSize: '0.72rem',
                  padding: '0.15rem 0.55rem',
                  borderRadius: '999px',
                  background: `${statusColor(region.status)}22`,
                  color: statusColor(region.status),
                  fontFamily: "'Exo 2', sans-serif",
                  fontWeight: 600,
                  width: 'fit-content',
                }}>
                  {region.status}
                </span>
                <span style={{
                  fontFamily: "'Exo 2', sans-serif",
                  fontSize: '0.85rem',
                  color: 'var(--text-secondary)',
                }}>
                  {region.moderatorCount}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add Region Form */}
      <div className="glass-card" style={{ padding: '1.25rem' }}>
        <h3 style={{ fontFamily: "'Orbitron', sans-serif", fontSize: '0.9rem', marginBottom: '1.25rem', color: 'var(--text-primary)' }}>
          Add Region
        </h3>

        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', alignItems: 'flex-start', marginBottom: '1rem' }}>
          <input
            type="text"
            placeholder="Name (e.g. Cincinnati)"
            value={formName}
            onChange={(e) => setFormName(e.target.value)}
            style={{ ...inputStyle, flex: 1, minWidth: '180px' }}
          />
          <input
            type="text"
            placeholder="State"
            value={formState}
            onChange={(e) => setFormState(e.target.value)}
            style={{ ...inputStyle, width: '90px' }}
          />
          <input
            type="text"
            placeholder="Country"
            value={formCountry}
            onChange={(e) => setFormCountry(e.target.value)}
            style={{ ...inputStyle, width: '90px' }}
          />
          <input
            type="text"
            placeholder="Timezone (e.g. America/New_York)"
            value={formTimezone}
            onChange={(e) => setFormTimezone(e.target.value)}
            style={{ ...inputStyle, flex: 1, minWidth: '220px' }}
          />
          <button
            onClick={() => setFormStatus(s => s === 'active' ? 'pending' : 'active')}
            style={{
              padding: '0 1rem',
              height: '44px',
              borderRadius: '8px',
              border: `1px solid ${statusColor(formStatus)}`,
              background: `${statusColor(formStatus)}22`,
              color: statusColor(formStatus),
              fontFamily: "'Exo 2', sans-serif",
              fontSize: '0.8rem',
              fontWeight: 600,
              cursor: 'pointer',
              whiteSpace: 'nowrap',
            }}
          >
            {formStatus}
          </button>
          <button
            onClick={handleAddRegion}
            disabled={addLoading}
            style={{
              padding: '0 1.5rem',
              height: '44px',
              borderRadius: '8px',
              border: 'none',
              background: addLoading ? 'rgba(117,7,135,0.3)' : 'rgba(117,7,135,0.5)',
              color: 'var(--text-primary)',
              fontFamily: "'Exo 2', sans-serif",
              fontSize: '0.85rem',
              fontWeight: 600,
              cursor: addLoading ? 'not-allowed' : 'pointer',
              opacity: addLoading ? 0.7 : 1,
              whiteSpace: 'nowrap',
            }}
          >
            {addLoading ? 'Adding…' : 'Add Region'}
          </button>
        </div>

        {addError && (
          <p style={{
            color: 'var(--pride-red)',
            fontFamily: "'Exo 2', sans-serif",
            fontSize: '0.85rem',
            marginBottom: '0.5rem',
          }}>
            {addError}
          </p>
        )}
        {addSuccess && (
          <p style={{
            color: 'var(--pride-green)',
            fontFamily: "'Exo 2', sans-serif",
            fontSize: '0.85rem',
          }}>
            {addSuccess}
          </p>
        )}
      </div>
    </div>
  )
}
