import Link from 'next/link'

export default function ConfirmationPage() {
  return (
    <div style={{ maxWidth: '600px', margin: '3rem auto', textAlign: 'center', padding: '0 1rem' }}>
      <div className="glass-card" style={{ padding: '3rem 2rem' }}>
        <p style={{ fontSize: '3rem', marginBottom: '1rem' }}>🎉</p>

        <h1 style={{
          fontFamily: "'Orbitron', sans-serif",
          fontSize: '1.5rem',
          marginBottom: '1rem',
        }} className="pride-gradient-text">
          Thank You!
        </h1>

        <p style={{
          color: 'var(--text-secondary)',
          fontSize: '1rem',
          lineHeight: 1.7,
          marginBottom: '0.5rem',
        }}>
          Your submission has been received and is pending review.
        </p>

        <p style={{
          color: 'var(--text-secondary)',
          fontSize: '0.9rem',
          lineHeight: 1.7,
          marginBottom: '2rem',
        }}>
          Our team reviews all submissions within <strong style={{ color: 'var(--text-primary)' }}>48 hours</strong>.
          Once approved, your listing will appear on QU Calendar for the community to discover.
        </p>

        <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', flexWrap: 'wrap' }}>
          <Link href="/" style={{
            padding: '0.6rem 1.5rem',
            borderRadius: '8px',
            background: 'var(--pride-violet)',
            color: '#fff',
            textDecoration: 'none',
            fontFamily: "'Exo 2', sans-serif",
            fontWeight: 600,
            fontSize: '0.9rem',
          }}>
            Calendar
          </Link>
          <Link href="/venues" style={{
            padding: '0.6rem 1.5rem',
            borderRadius: '8px',
            border: '1px solid var(--border-glass)',
            color: 'var(--text-primary)',
            textDecoration: 'none',
            fontFamily: "'Exo 2', sans-serif",
            fontWeight: 600,
            fontSize: '0.9rem',
          }}>
            Venues
          </Link>
          <Link href="/artists" style={{
            padding: '0.6rem 1.5rem',
            borderRadius: '8px',
            border: '1px solid var(--border-glass)',
            color: 'var(--text-primary)',
            textDecoration: 'none',
            fontFamily: "'Exo 2', sans-serif",
            fontWeight: 600,
            fontSize: '0.9rem',
          }}>
            Artists
          </Link>
        </div>
      </div>
    </div>
  )
}
