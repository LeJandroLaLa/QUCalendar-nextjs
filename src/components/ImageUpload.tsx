'use client'

import { useState, useRef } from 'react'
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage'
import { storage } from '@/lib/firebase'

interface ImageUploadProps {
  storagePath: string
  onImageUrl: (url: string) => void
}

export default function ImageUpload({ storagePath, onImageUrl }: ImageUploadProps) {
  const [mode, setMode] = useState<'upload' | 'url'>('upload')
  const [urlInput, setUrlInput] = useState('')
  const [preview, setPreview] = useState('')
  const [uploading, setUploading] = useState(false)
  const [progress, setProgress] = useState(0)
  const [error, setError] = useState('')
  const fileRef = useRef<HTMLInputElement>(null)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setError('')
    setUploading(true)
    setProgress(0)

    const storageRef = ref(storage, `${storagePath}/${Date.now()}_${file.name}`)
    const uploadTask = uploadBytesResumable(storageRef, file)

    uploadTask.on(
      'state_changed',
      (snapshot) => {
        const pct = Math.round((snapshot.bytesTransferred / snapshot.totalBytes) * 100)
        setProgress(pct)
      },
      (err) => {
        console.error('Upload error:', err)
        setError('Upload failed. Please try again.')
        setUploading(false)
      },
      async () => {
        const downloadURL = await getDownloadURL(uploadTask.snapshot.ref)
        setPreview(downloadURL)
        onImageUrl(downloadURL)
        setUploading(false)
      }
    )
  }

  const handleUrlSubmit = () => {
    if (!urlInput.trim()) return
    setPreview(urlInput.trim())
    onImageUrl(urlInput.trim())
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
    <div>
      <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>
        Image
      </label>

      {/* Mode toggle */}
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.75rem' }}>
        <button type="button" onClick={() => setMode('upload')} style={toggleBtnStyle(mode === 'upload')}>
          File Upload
        </button>
        <button type="button" onClick={() => setMode('url')} style={toggleBtnStyle(mode === 'url')}>
          Image URL
        </button>
      </div>

      {mode === 'upload' ? (
        <div>
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            style={{ display: 'none' }}
          />
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            disabled={uploading}
            style={{
              ...inputStyle,
              cursor: uploading ? 'not-allowed' : 'pointer',
              textAlign: 'center',
              opacity: uploading ? 0.6 : 1,
            }}
          >
            {uploading ? 'Uploading...' : 'Choose Image File'}
          </button>

          {/* Progress bar */}
          {uploading && (
            <div style={{
              marginTop: '0.5rem',
              height: '4px',
              borderRadius: '2px',
              background: 'rgba(255, 255, 255, 0.1)',
              overflow: 'hidden',
            }}>
              <div style={{
                width: `${progress}%`,
                height: '100%',
                background: 'var(--pride-violet)',
                transition: 'width 0.3s',
              }} />
            </div>
          )}
        </div>
      ) : (
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <input
            type="url"
            value={urlInput}
            onChange={(e) => setUrlInput(e.target.value)}
            placeholder="https://example.com/image.jpg"
            style={{ ...inputStyle, flex: 1 }}
          />
          <button
            type="button"
            onClick={handleUrlSubmit}
            style={{
              padding: '0.6rem 1rem',
              borderRadius: '8px',
              border: 'none',
              background: 'var(--pride-violet)',
              color: '#fff',
              cursor: 'pointer',
              fontFamily: "'Exo 2', sans-serif",
              fontSize: '0.85rem',
              whiteSpace: 'nowrap',
            }}
          >
            Set
          </button>
        </div>
      )}

      {error && (
        <p style={{ color: 'var(--pride-red)', fontSize: '0.8rem', marginTop: '0.5rem' }}>{error}</p>
      )}

      {/* Preview */}
      {preview && (
        <div style={{
          marginTop: '0.75rem',
          width: '100%',
          maxWidth: '300px',
          aspectRatio: '16/9',
          borderRadius: '8px',
          overflow: 'hidden',
          border: '1px solid var(--border-glass)',
        }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={preview}
            alt="Preview"
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          />
        </div>
      )}
    </div>
  )
}
