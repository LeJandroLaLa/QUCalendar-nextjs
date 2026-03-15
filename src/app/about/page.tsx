'use client'

import Link from 'next/link'

const values = [
  {
    title: 'We build for the margins first.',
    body: 'If the platform works for the person who feels the most disconnected or overlooked, it works for everyone.',
  },
  {
    title: 'We turn moments into a legacy.',
    body: "Through the Heritage Vault, we ensure today's underground show or local gathering isn't just a fleeting post, but a permanent part of our shared history.",
  },
  {
    title: 'We choose real rooms over digital loops.',
    body: 'Our technology is a bridge, not a destination; we measure our success by how many people actually end up in the same space together.',
  },
  {
    title: 'We pass the mic.',
    body: 'Every city that comes after Cincinnati gets the same blueprint we built here, empowering every community to own their own pulse.',
  },
]

const glassCard: React.CSSProperties = {
  background: 'var(--bg-card)',
  border: '1px solid var(--border-glass)',
  backdropFilter: 'blur(10px)',
  borderRadius: '20px',
}

const maxWidth: React.CSSProperties = {
  maxWidth: '1200px',
  margin: '0 auto',
}

export default function AboutPage() {
  return (
    <div>
      {/* ── 1. Hero Section ── */}
      <section
        style={{
          position: 'relative',
          padding: '4rem 2rem',
          textAlign: 'center',
          background:
            'linear-gradient(135deg, rgba(228,3,3,0.08), rgba(115,41,130,0.12), rgba(0,128,38,0.08))',
          overflow: 'hidden',
        }}
      >
        <div style={maxWidth}>
          <p
            style={{
              fontFamily: "'Orbitron', sans-serif",
              fontSize: '0.75rem',
              color: 'var(--accent)',
              letterSpacing: '0.2em',
              textTransform: 'uppercase',
              marginBottom: '1rem',
            }}
          >
            Our Mission
          </p>

          <h1
            style={{
              fontFamily: "'Orbitron', sans-serif",
              fontSize: 'clamp(2rem, 5vw, 3.5rem)',
              fontWeight: 900,
              lineHeight: 1.1,
              marginBottom: '1.5rem',
              color: 'var(--text-primary)',
            }}
          >
            The Pulse of Queer Life.
          </h1>

          <p
            style={{
              fontFamily: "'Exo 2', sans-serif",
              fontSize: 'clamp(1rem, 2vw, 1.2rem)',
              color: 'var(--text-secondary)',
              lineHeight: 1.7,
              maxWidth: '680px',
              margin: '0 auto',
            }}
          >
            We are building a living home for our community to find itself —
            starting in the neighborhoods of Cincinnati and growing to wherever
            you are.
          </p>
        </div>

        {/* Pride stripe at bottom */}
        <div
          style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            height: '4px',
            background: 'var(--gradient-pride)',
          }}
        />
      </section>

      {/* ── 2. Values Section ── */}
      <section style={{ padding: '4rem 2rem' }}>
        <div style={maxWidth}>
          <h2
            style={{
              fontFamily: "'Orbitron', sans-serif",
              fontSize: 'clamp(1.4rem, 3vw, 2rem)',
              fontWeight: 700,
              textAlign: 'center',
              marginBottom: '2.5rem',
              color: 'var(--text-primary)',
            }}
          >
            How We Show Up
          </h2>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
              gap: '1.5rem',
            }}
          >
            {values.map((v) => (
              <div
                key={v.title}
                style={{
                  ...glassCard,
                  padding: '1.75rem',
                  borderLeft: '4px solid var(--accent)',
                }}
              >
                <h3
                  style={{
                    fontFamily: "'Orbitron', sans-serif",
                    fontWeight: 700,
                    fontSize: '1rem',
                    color: 'var(--accent)',
                    marginBottom: '0.75rem',
                    lineHeight: 1.3,
                  }}
                >
                  {v.title}
                </h3>
                <p
                  style={{
                    fontFamily: "'Exo 2', sans-serif",
                    fontSize: '0.95rem',
                    color: 'var(--text-secondary)',
                    lineHeight: 1.7,
                  }}
                >
                  {v.body}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 3. For Creators & Organizers ── */}
      <section style={{ padding: '0 2rem 4rem' }}>
        <div style={maxWidth}>
          <div style={{ ...glassCard, padding: '2.5rem' }}>
            <h2
              style={{
                fontFamily: "'Orbitron', sans-serif",
                fontSize: 'clamp(1.3rem, 2.5vw, 1.8rem)',
                fontWeight: 700,
                marginBottom: '0.75rem',
                color: 'var(--text-primary)',
              }}
            >
              For Creators &amp; Organizers
            </h2>

            <p
              style={{
                fontFamily: "'Exo 2', sans-serif",
                fontSize: '1.1rem',
                color: 'var(--accent)',
                marginBottom: '1.25rem',
                lineHeight: 1.5,
              }}
            >
              You build the culture. We just make sure people find it.
            </p>

            <p
              style={{
                fontFamily: "'Exo 2', sans-serif",
                fontSize: '0.98rem',
                color: 'var(--text-secondary)',
                lineHeight: 1.8,
                marginBottom: '2rem',
                maxWidth: '820px',
              }}
            >
              Whether you&rsquo;re a drag performer, a visual artist, or a dive bar
              owner, your work is a vital organ in the community&rsquo;s pulse. We
              created QU to be your digital megaphone and your permanent archive.
              By listing your space or event here, you aren&rsquo;t just filling a
              calendar — you&rsquo;re claiming your place in the city&rsquo;s story.
            </p>

            <div
              style={{
                display: 'flex',
                flexWrap: 'wrap',
                gap: '1rem',
              }}
            >
              <Link
                href="/submit/event"
                style={{
                  fontFamily: "'Exo 2', sans-serif",
                  fontWeight: 600,
                  fontSize: '0.95rem',
                  padding: '0.7rem 1.75rem',
                  borderRadius: '50px',
                  textDecoration: 'none',
                  color: '#ffffff',
                  background: 'var(--pride-violet)',
                  border: 'none',
                  display: 'inline-block',
                  transition: 'opacity 0.15s',
                }}
                onMouseEnter={(e) =>
                  ((e.currentTarget as HTMLElement).style.opacity = '0.85')
                }
                onMouseLeave={(e) =>
                  ((e.currentTarget as HTMLElement).style.opacity = '1')
                }
              >
                Submit Your Event
              </Link>

              <Link
                href="/submit/space"
                style={{
                  fontFamily: "'Exo 2', sans-serif",
                  fontWeight: 600,
                  fontSize: '0.95rem',
                  padding: '0.7rem 1.75rem',
                  borderRadius: '50px',
                  textDecoration: 'none',
                  color: '#ffffff',
                  background: 'var(--accent)',
                  border: 'none',
                  display: 'inline-block',
                  transition: 'opacity 0.15s',
                }}
                onMouseEnter={(e) =>
                  ((e.currentTarget as HTMLElement).style.opacity = '0.85')
                }
                onMouseLeave={(e) =>
                  ((e.currentTarget as HTMLElement).style.opacity = '1')
                }
              >
                List Your Space
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── 4. Founder's Note ── */}
      <section style={{ padding: '0 2rem 4rem' }}>
        <div style={maxWidth}>
          <div style={{ ...glassCard, padding: '2.5rem' }}>
            <p
              style={{
                fontFamily: "'Orbitron', sans-serif",
                fontSize: '0.7rem',
                color: 'var(--accent)',
                letterSpacing: '0.2em',
                textTransform: 'uppercase',
                marginBottom: '0.75rem',
              }}
            >
              Founder&rsquo;s Note
            </p>

            <h2
              style={{
                fontFamily: "'Orbitron', sans-serif",
                fontSize: 'clamp(1.3rem, 2.5vw, 1.8rem)',
                fontWeight: 700,
                marginBottom: '1.75rem',
                color: 'var(--text-primary)',
              }}
            >
              From the Lens
            </h2>

            <p
              style={{
                fontFamily: "'Exo 2', sans-serif",
                fontSize: '1rem',
                color: 'var(--text-secondary)',
                lineHeight: 1.8,
                marginBottom: '1.25rem',
              }}
            >
              I spent years as a photographer documenting the Queer heartbeat of
              Cincinnati. I&rsquo;ve seen the magic that happens in our basements, bars,
              and galleries, but I also saw how hard we had to work to find it. I
              was tired of hunting through expired Instagram stories and
              fragmented Discord servers just to find my people.
            </p>

            <p
              style={{
                fontFamily: "'Exo 2', sans-serif",
                fontSize: '1rem',
                color: 'var(--text-secondary)',
                lineHeight: 1.8,
                marginBottom: '1.25rem',
              }}
            >
              The moment it crystallized for me wasn&rsquo;t at a massive festival; it
              was a quiet Tuesday at a local show. Looking through my viewfinder,
              I realized that if I hadn&rsquo;t seen a specific, obscure post that
              morning, I would have missed a defining moment of community joy.
              Our culture is too important to be left to the mercy of an
              algorithm.
            </p>

            <p
              style={{
                fontFamily: "'Exo 2', sans-serif",
                fontSize: '1rem',
                color: 'var(--text-secondary)',
                lineHeight: 1.8,
                marginBottom: '2rem',
              }}
            >
              I built QU to be the living archive I wished I had — a place where
              our history is preserved and our future is easy to find. We&rsquo;re
              starting here in the Queen City because this is the soil that
              raised us, but we&rsquo;re building a blueprint that belongs to every
              Queer community, everywhere.
            </p>

            <p
              style={{
                fontFamily: "'Orbitron', sans-serif",
                fontSize: '1rem',
                color: 'var(--accent)',
                textAlign: 'right',
              }}
            >
              — Alejandro
            </p>
          </div>
        </div>
      </section>

      {/* ── 5. Final CTA Strip ── */}
      <section
        style={{
          position: 'relative',
          textAlign: 'center',
          padding: '3rem 2rem',
          borderTop: '4px solid transparent',
          backgroundImage:
            'var(--gradient-pride), linear-gradient(var(--bg-dark), var(--bg-dark))',
          backgroundOrigin: 'border-box',
          backgroundClip: 'padding-box, padding-box',
        }}
      >
        {/* Pride gradient top border */}
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: '4px',
            background: 'var(--gradient-pride)',
          }}
        />

        <div style={maxWidth}>
          <h2
            style={{
              fontFamily: "'Orbitron', sans-serif",
              fontSize: 'clamp(1.3rem, 3vw, 2rem)',
              fontWeight: 700,
              marginBottom: '1.75rem',
              color: 'var(--text-primary)',
            }}
          >
            Ready to find your people?
          </h2>

          <Link
            href="/"
            style={{
              fontFamily: "'Exo 2', sans-serif",
              fontWeight: 700,
              fontSize: '1rem',
              padding: '0.85rem 2.25rem',
              borderRadius: '50px',
              textDecoration: 'none',
              color: '#ffffff',
              background: 'var(--gradient-pride)',
              display: 'inline-block',
              transition: 'opacity 0.15s',
            }}
            onMouseEnter={(e) =>
              ((e.currentTarget as HTMLElement).style.opacity = '0.85')
            }
            onMouseLeave={(e) =>
              ((e.currentTarget as HTMLElement).style.opacity = '1')
            }
          >
            Explore the Calendar
          </Link>
        </div>
      </section>
    </div>
  )
}
