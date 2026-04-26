'use client'

import { useState } from 'react'
import { doc, updateDoc, serverTimestamp } from 'firebase/firestore'
import { db } from '@/lib/firebase'

interface Props {
  spaceId: string
}

type PolicyMode = 'url' | 'text'

const inputStyle: React.CSSProperties = {
  padding: '0.6rem 0.75rem',
  borderRadius: '8px',
  border: '1px solid var(--border-glass)',
  background: 'rgba(255,255,255,0.05)',
  color: 'var(--text-primary)',
  fontFamily: "'Exo 2', sans-serif",
  fontSize: '0.9rem',
  outline: 'none',
  width: '100%',
  boxSizing: 'border-box',
}

const labelStyle: React.CSSProperties = {
  display: 'block',
  fontFamily: "'Exo 2', sans-serif",
  fontSize: '0.8rem',
  color: 'var(--text-secondary)',
  marginBottom: '0.35rem',
  fontWeight: 600,
  textTransform: 'uppercase',
  letterSpacing: '0.05em',
}

const sectionStyle: React.CSSProperties = {
  background: 'var(--bg-card)',
  border: '1px solid var(--border-glass)',
  backdropFilter: 'blur(10px)',
  borderRadius: '16px',
  padding: '1.5rem',
}

const checkboxRowStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'flex-start',
  gap: '0.75rem',
  cursor: 'pointer',
  fontFamily: "'Exo 2', sans-serif",
  fontSize: '0.9rem',
  color: 'var(--text-primary)',
  lineHeight: 1.5,
}

const checkboxInputStyle: React.CSSProperties = {
  accentColor: 'var(--pride-violet)',
  width: '16px',
  height: '16px',
  marginTop: '2px',
  flexShrink: 0,
  cursor: 'pointer',
}

function PolicySection({
  title,
  mode,
  onModeChange,
  urlValue,
  onUrlChange,
  textValue,
  onTextChange,
  radioName,
}: {
  title: string
  mode: PolicyMode
  onModeChange: (m: PolicyMode) => void
  urlValue: string
  onUrlChange: (v: string) => void
  textValue: string
  onTextChange: (v: string) => void
  radioName: string
}) {
  return (
    <div style={sectionStyle}>
      <h3 style={{
        fontFamily: "'Orbitron', sans-serif",
        fontSize: '0.85rem',
        color: 'var(--text-primary)',
        marginBottom: '1rem',
        letterSpacing: '0.05em',
      }}>
        {title}
      </h3>
      <div style={{ display: 'flex', gap: '1.5rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
        {(['url', 'text'] as PolicyMode[]).map((m) => (
          <label key={m} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontFamily: "'Exo 2', sans-serif", fontSize: '0.9rem', color: 'var(--text-primary)' }}>
            <input
              type="radio"
              name={radioName}
              value={m}
              checked={mode === m}
              onChange={() => onModeChange(m)}
              style={{ accentColor: 'var(--pride-violet)' }}
            />
            {m === 'url' ? 'I have a public policy URL' : "I'll write it here"}
          </label>
        ))}
      </div>
      {mode === 'url' ? (
        <div>
          <label style={labelStyle}>Policy URL *</label>
          <input
            type="url"
            value={urlValue}
            onChange={e => onUrlChange(e.target.value)}
            placeholder="https://yourspace.com/policy"
            style={inputStyle}
          />
        </div>
      ) : (
        <div>
          <label style={labelStyle}>Policy Text *</label>
          <textarea
            value={textValue}
            onChange={e => onTextChange(e.target.value)}
            rows={5}
            style={{ ...inputStyle, resize: 'vertical' }}
          />
        </div>
      )}
    </div>
  )
}

export default function BraveSpaceIntakeForm({ spaceId }: Props) {
  const [accountabilityMode, setAccountabilityMode] = useState<PolicyMode>('url')
  const [accountabilityPolicyUrl, setAccountabilityPolicyUrl] = useState('')
  const [accountabilityPolicyText, setAccountabilityPolicyText] = useState('')

  const [wheelchairAccessible, setWheelchairAccessible] = useState(false)
  const [rampDetails, setRampDetails] = useState('')
  const [elevatorStatus, setElevatorStatus] = useState<'available' | 'unavailable' | 'not_applicable'>('not_applicable')
  const [strobeWarning, setStrobeWarning] = useState(false)
  const [volumeEnvironment, setVolumeEnvironment] = useState<'quiet' | 'moderate' | 'loud'>('moderate')
  const [parkingDetails, setParkingDetails] = useState('')
  const [accessibilityNotes, setAccessibilityNotes] = useState('')

  const [genderNeutralRestrooms, setGenderNeutralRestrooms] = useState(false)
  const [genderNeutralRestroomsNotes, setGenderNeutralRestroomsNotes] = useState('')

  const [deEscalationMode, setDeEscalationMode] = useState<PolicyMode>('url')
  const [deEscalationPolicyUrl, setDeEscalationPolicyUrl] = useState('')
  const [deEscalationPolicyText, setDeEscalationPolicyText] = useState('')
  const [prioritizesDeEscalationOverPolice, setPrioritizesDeEscalationOverPolice] = useState(false)

  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState('')

  const accountabilityFilled = accountabilityMode === 'url'
    ? accountabilityPolicyUrl.trim().length > 0
    : accountabilityPolicyText.trim().length > 0

  const deEscalationFilled = deEscalationMode === 'url'
    ? deEscalationPolicyUrl.trim().length > 0
    : deEscalationPolicyText.trim().length > 0

  const canSubmit = accountabilityFilled && deEscalationFilled && !submitting

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!canSubmit) return
    setSubmitting(true)
    setError('')
    try {
      await updateDoc(doc(db, 'spaces', spaceId), {
        braveSpace: {
          status: 'pending',
          certifiedAt: null,
          submittedAt: serverTimestamp(),
          reviewedBy: null,
          accountabilityPolicyUrl: accountabilityMode === 'url' ? accountabilityPolicyUrl.trim() : null,
          accountabilityPolicyText: accountabilityMode === 'text' ? accountabilityPolicyText.trim() : null,
          accessibility: {
            wheelchairAccessible,
            rampDetails: rampDetails.trim() || null,
            elevatorStatus,
            strobeWarning,
            volumeEnvironment,
            parkingDetails: parkingDetails.trim() || null,
            additionalNotes: accessibilityNotes.trim() || null,
          },
          genderNeutralRestrooms,
          genderNeutralRestroomsNotes: genderNeutralRestroomsNotes.trim() || null,
          deEscalationPolicyText: deEscalationMode === 'text' ? deEscalationPolicyText.trim() : null,
          deEscalationPolicyUrl: deEscalationMode === 'url' ? deEscalationPolicyUrl.trim() : null,
          prioritizesDeEscalationOverPolice,
        },
      })
      setSubmitted(true)
    } catch (err) {
      console.error('Error submitting Brave Space application:', err)
      setError('Submission failed. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  if (submitted) {
    return (
      <div style={{
        background: 'rgba(0,168,50,0.1)',
        border: '1px solid rgba(0,168,50,0.3)',
        borderRadius: '16px',
        padding: '2rem',
        textAlign: 'center',
      }}>
        <div style={{ fontSize: '2rem', marginBottom: '0.75rem' }}>🏳️‍🌈</div>
        <h3 style={{
          fontFamily: "'Orbitron', sans-serif",
          fontSize: '1rem',
          color: 'var(--pride-green)',
          marginBottom: '0.5rem',
          letterSpacing: '0.05em',
        }}>
          Application Submitted
        </h3>
        <p style={{
          fontFamily: "'Exo 2', sans-serif",
          color: 'var(--text-secondary)',
          fontSize: '0.9rem',
          lineHeight: 1.6,
        }}>
          Your Brave Space application is under review. We&apos;ll notify you when a decision has been made.
        </p>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      <h2 style={{
        fontFamily: "'Orbitron', sans-serif",
        fontSize: '1.1rem',
        marginBottom: '0.25rem',
        letterSpacing: '0.05em',
      }} className="pride-gradient-text">
        Apply for Brave Space Certification
      </h2>

      <PolicySection
        title="Accountability Policy"
        mode={accountabilityMode}
        onModeChange={setAccountabilityMode}
        urlValue={accountabilityPolicyUrl}
        onUrlChange={setAccountabilityPolicyUrl}
        textValue={accountabilityPolicyText}
        onTextChange={setAccountabilityPolicyText}
        radioName="accountabilityMode"
      />

      {/* Accessibility */}
      <div style={sectionStyle}>
        <h3 style={{
          fontFamily: "'Orbitron', sans-serif",
          fontSize: '0.85rem',
          color: 'var(--text-primary)',
          marginBottom: '1rem',
          letterSpacing: '0.05em',
        }}>
          Accessibility
        </h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <label style={checkboxRowStyle}>
            <input
              type="checkbox"
              checked={wheelchairAccessible}
              onChange={e => setWheelchairAccessible(e.target.checked)}
              style={checkboxInputStyle}
            />
            Wheelchair accessible
          </label>

          <div>
            <label style={labelStyle}>Ramp details</label>
            <input
              type="text"
              value={rampDetails}
              onChange={e => setRampDetails(e.target.value)}
              placeholder="e.g. Ramp at the side entrance on 5th Ave"
              style={inputStyle}
            />
          </div>

          <div>
            <label style={labelStyle}>Elevator status</label>
            <select
              value={elevatorStatus}
              onChange={e => setElevatorStatus(e.target.value as typeof elevatorStatus)}
              style={{ ...inputStyle, cursor: 'pointer' }}
            >
              <option value="available">Available</option>
              <option value="unavailable">Unavailable</option>
              <option value="not_applicable">Not applicable</option>
            </select>
          </div>

          <label style={checkboxRowStyle}>
            <input
              type="checkbox"
              checked={strobeWarning}
              onChange={e => setStrobeWarning(e.target.checked)}
              style={checkboxInputStyle}
            />
            Strobe lighting warning applies to this space
          </label>

          <div>
            <label style={labelStyle}>Volume environment</label>
            <select
              value={volumeEnvironment}
              onChange={e => setVolumeEnvironment(e.target.value as typeof volumeEnvironment)}
              style={{ ...inputStyle, cursor: 'pointer' }}
            >
              <option value="quiet">Quiet</option>
              <option value="moderate">Moderate</option>
              <option value="loud">Loud</option>
            </select>
          </div>

          <div>
            <label style={labelStyle}>Parking details</label>
            <input
              type="text"
              value={parkingDetails}
              onChange={e => setParkingDetails(e.target.value)}
              placeholder="e.g. Free street parking after 6pm"
              style={inputStyle}
            />
          </div>

          <div>
            <label style={labelStyle}>Additional accessibility notes</label>
            <textarea
              value={accessibilityNotes}
              onChange={e => setAccessibilityNotes(e.target.value)}
              rows={3}
              style={{ ...inputStyle, resize: 'vertical' }}
            />
          </div>
        </div>
      </div>

      {/* Gender-neutral restrooms */}
      <div style={sectionStyle}>
        <h3 style={{
          fontFamily: "'Orbitron', sans-serif",
          fontSize: '0.85rem',
          color: 'var(--text-primary)',
          marginBottom: '1rem',
          letterSpacing: '0.05em',
        }}>
          Gender-Neutral Restrooms
        </h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <label style={checkboxRowStyle}>
            <input
              type="checkbox"
              checked={genderNeutralRestrooms}
              onChange={e => setGenderNeutralRestrooms(e.target.checked)}
              style={checkboxInputStyle}
            />
            This space has gender-neutral restrooms
          </label>
          <div>
            <label style={labelStyle}>Notes</label>
            <input
              type="text"
              value={genderNeutralRestroomsNotes}
              onChange={e => setGenderNeutralRestroomsNotes(e.target.value)}
              placeholder="e.g. Single-occupancy restrooms on each floor"
              style={inputStyle}
            />
          </div>
        </div>
      </div>

      <PolicySection
        title="De-escalation Policy"
        mode={deEscalationMode}
        onModeChange={setDeEscalationMode}
        urlValue={deEscalationPolicyUrl}
        onUrlChange={setDeEscalationPolicyUrl}
        textValue={deEscalationPolicyText}
        onTextChange={setDeEscalationPolicyText}
        radioName="deEscalationMode"
      />

      <div style={{ ...sectionStyle, paddingTop: '1.25rem', paddingBottom: '1.25rem' }}>
        <label style={checkboxRowStyle}>
          <input
            type="checkbox"
            checked={prioritizesDeEscalationOverPolice}
            onChange={e => setPrioritizesDeEscalationOverPolice(e.target.checked)}
            style={checkboxInputStyle}
          />
          This space prioritizes de-escalation and community-based safety over calling the police
        </label>
      </div>

      {error && (
        <p style={{ color: 'var(--pride-red)', fontFamily: "'Exo 2', sans-serif", fontSize: '0.9rem' }}>
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={!canSubmit}
        style={{
          padding: '0.75rem 2rem',
          borderRadius: '10px',
          border: 'none',
          background: canSubmit ? 'var(--gradient-pride)' : 'rgba(255,255,255,0.1)',
          color: canSubmit ? '#fff' : 'var(--text-secondary)',
          fontFamily: "'Orbitron', sans-serif",
          fontSize: '0.85rem',
          fontWeight: 700,
          letterSpacing: '0.05em',
          cursor: canSubmit ? 'pointer' : 'not-allowed',
          opacity: submitting ? 0.7 : 1,
          alignSelf: 'flex-start',
          transition: 'opacity 0.15s',
        }}
      >
        {submitting ? 'Submitting…' : 'Submit Application'}
      </button>
    </form>
  )
}
