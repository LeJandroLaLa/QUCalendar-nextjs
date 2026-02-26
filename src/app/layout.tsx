import type { Metadata } from "next";
import { AuthProvider } from "@/context/AuthContext";
import "./globals.css";

export const metadata: Metadata = {
  title: "QU Calendar",
  description: "LGBTQ+ community event platform for Cincinnati and Northern Kentucky",
};

function Stardate() {
  const now = new Date();
  const year = now.getFullYear();
  const start = new Date(year, 0, 0);
  const diff = now.getTime() - start.getTime();
  const oneDay = 1000 * 60 * 60 * 24;
  const dayOfYear = Math.floor(diff / oneDay);
  const stardate = `${year}.${String(dayOfYear).padStart(3, "0")}`;
  return <span style={{ fontFamily: "'Orbitron', sans-serif", fontSize: "0.85rem", color: "var(--text-secondary)" }}>Stardate {stardate}</span>;
}

const wordmark = [
  { letter: "Q", color: "var(--pride-red)" },
  { letter: "U", color: "var(--pride-orange)" },
  { letter: "\u00A0", color: "transparent" },
  { letter: "C", color: "var(--pride-green)" },
  { letter: "A", color: "var(--pride-blue)" },
  { letter: "L", color: "var(--pride-violet)" },
  { letter: "E", color: "var(--pride-red)" },
  { letter: "N", color: "var(--pride-orange)" },
  { letter: "D", color: "var(--pride-yellow)" },
  { letter: "A", color: "var(--pride-green)" },
  { letter: "R", color: "var(--pride-blue)" },
];

const navLinks = [
  { label: "Calendar", href: "/" },
  { label: "Venues", href: "/venues" },
  { label: "Artists", href: "/artists" },
  { label: "About", href: "/about" },
];

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <header style={{
          borderBottom: "1px solid var(--border-glass)",
          background: "rgba(10, 10, 15, 0.95)",
          backdropFilter: "blur(10px)",
          position: "sticky",
          top: 0,
          zIndex: 100,
        }}>
          {/* Top row: Wordmark + Stardate */}
          <div style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            padding: "1rem 2rem 0.5rem",
            maxWidth: "1200px",
            margin: "0 auto",
          }}>
            <h1 style={{ fontSize: "1.8rem", letterSpacing: "0.15em", fontFamily: "'Orbitron', sans-serif" }}>
              {wordmark.map((item, i) => (
                <span key={i} style={{ color: item.color }}>{item.letter}</span>
              ))}
            </h1>
            <Stardate />
          </div>

          {/* Bottom row: Navigation */}
          <nav style={{
            display: "flex",
            gap: "2rem",
            padding: "0.5rem 2rem 1rem",
            maxWidth: "1200px",
            margin: "0 auto",
          }}>
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                style={{
                  color: "var(--text-secondary)",
                  textDecoration: "none",
                  fontFamily: "'Exo 2', sans-serif",
                  fontSize: "0.95rem",
                  fontWeight: 600,
                  letterSpacing: "0.05em",
                  transition: "color 0.2s",
                }}
              >
                {link.label}
              </a>
            ))}
          </nav>
        </header>

        <main style={{ maxWidth: "1200px", margin: "0 auto", padding: "2rem" }}>
          <AuthProvider>
            {children}
          </AuthProvider>
        </main>
      </body>
    </html>
  );
}
