'use client'

import { useEffect, useState } from 'react'
import { collection, query, where, getDocs, doc, updateDoc } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { EVENT_CATEGORIES } from '@/lib/types'

type Tab = 'venues' | 'artists' | 'events'

interface ApprovedItem {
  id: string
  name: string
  type?: string
  category?: string
  date?: string
  imageUrl?: string
}

export default function ApprovedContentPage() {
  const [activeTab, setActiveTab] = useState<Tab>('venues')
  const [items, setItems] = useState<ApprovedItem[]>([])
  const [loading, setLoading] = useState(true)

  const fetchItems = async (tab: Tab) => {
    setLoading(true)
    try {
      const snap = await getDocs(
        query(collection(db, tab), where('status', '==', 'approved'))
      )
      const nameField = tab === 'events' ? 'title' : 'name'
      setItems(
        snap.docs.map((d) => {
          const data = d.data()
          return {
            id: d.id,
            name: data[nameField] || 'Untitled',
            type: data.type,
            category: data.category,
            date: data.date,
            imageUrl: data.imageUrl,
          }
        })
      )
    } catch (err) {
      console.error(`Error fetching approved ${tab}:`, err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchItems(activeTab)
  }, [activeTab])

  const handleUnpublish = async (id: string) => {
    setItems((prev) => prev.filter((i) => i.id !== id))
    try {
      await updateDoc(doc(db, activeTab, id), { status: 'archived' })
    } catch (err) {
      console.error('Error archiving item:', err)
      fetchItems(activeTab)
    }
  }

  const switchTab = (tab: Tab) => {
    setActiveTab(tab)
  }

  const tabs: { key: Tab; label: string }[] = [
    { key: 'venues', label: 'Venues' },
    { key: 'artists', label: 'Artists' },
    { key: 'events', label: 'Events' },
  ]

  return (
    <div>
      <h2 style={{
        fontFamily: "'Orbitron', sans-serif",
        fontSize: '1.3rem',
        marginBottom: '1.5rem',
      }} className="pride-gradient-text">
        Approved Content
      </h2>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem' }}>
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => switchTab(tab.key)}
            style={{
              padding: '0.5rem 1.25rem',
              borderRadius: '999px',
              border: '1px solid var(--border-glass)',
              background: activeTab === tab.key ? 'rgba(117, 7, 135, 0.3)' : 'transparent',
              color: activeTab === tab.key ? 'var(--text-primary)' : 'var(--text-secondary)',
              cursor: 'pointer',
              fontFamily: "'Exo 2', sans-serif",
              fontSize: '0.9rem',
              fontWeight: 600,
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-secondary)' }}>Loading...</div>
      ) : items.length === 0 ? (
        <div className="glass-card" style={{ padding: '2rem', textAlign: 'center' }}>
          <p style={{ color: 'var(--text-secondary)' }}>No approved {activeTab} found.</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {items.map((item) => {
            const emoji = item.category ? (EVENT_CATEGORIES[item.category] || '') : ''

            return (
              <div key={item.id} className="glass-card" style={{
                padding: '1rem 1.25rem',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flex: 1, minWidth: 0 }}>
                  {/* Thumbnail */}
                  <div style={{
                    width: '48px',
                    height: '48px',
                    borderRadius: '8px',
                    overflow: 'hidden',
                    flexShrink: 0,
                    background: item.imageUrl
                      ? `url(${item.imageUrl}) center/cover`
                      : 'linear-gradient(135deg, rgba(117,7,135,0.3), rgba(0,76,255,0.3))',
                  }} />
                  <div style={{ minWidth: 0 }}>
                    <p style={{
                      fontSize: '0.95rem',
                      color: 'var(--text-primary)',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                    }}>
                      {item.name}
                    </p>
                    <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                      {item.type && item.type}
                      {emoji && ` ${emoji} ${item.category}`}
                      {item.date && ` · ${new Date(item.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => handleUnpublish(item.id)}
                  style={{
                    padding: '0.4rem 0.9rem',
                    borderRadius: '8px',
                    border: '1px solid var(--border-glass)',
                    background: 'transparent',
                    color: 'var(--text-secondary)',
                    fontFamily: "'Exo 2', sans-serif",
                    fontSize: '0.75rem',
                    cursor: 'pointer',
                    whiteSpace: 'nowrap',
                  }}
                >
                  Unpublish
                </button>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
