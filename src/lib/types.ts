import { Timestamp } from 'firebase/firestore'

export interface QUEvent {
  id: string
  title: string
  date: string
  endDate?: string
  time?: string
  endTime?: string
  venue?: string
  venueId?: string
  artist?: string
  artistId?: string
  category: string
  description?: string
  imageUrl?: string
  ticketLink?: string
  status: string
  city?: string
}

export interface Space {
  id: string
  name: string
  type?: SpaceType
  address?: string
  description?: string
  imageUrl?: string
  website?: string
  phone?: string
  amenities?: string[]
  status?: 'unverified' | 'pending' | 'approved' | 'rejected'
  braveSpace: boolean
  ownerUid: string
  city?: string
}

export interface Artist {
  id: string
  name: string
  type?: string
  genre?: string
  bio?: string
  imageUrl?: string
  website?: string
  socialLinks?: Record<string, string>
  status?: 'invited' | 'pending' | 'approved' | 'rejected'
  invitedBy?: string
  approvedBy?: string
  inviteToken?: string
  joinedAt?: Timestamp
  city?: string
}

export type SpaceType =
  | 'Restaurant'
  | 'Theatre'
  | 'Events Space'
  | 'Bar'
  | 'Night Club'
  | 'Park / Public Space'
  | 'Community Center'
  | 'Gallery / Museum'
  | 'Private Venue'

export const SPACE_TYPES: Record<SpaceType, string> = {
  'Restaurant': '🍽️',
  'Theatre': '🎭',
  'Events Space': '🎪',
  'Bar': '🍺',
  'Night Club': '🌟',
  'Park / Public Space': '🌳',
  'Community Center': '🤝',
  'Gallery / Museum': '🎨',
  'Private Venue': '🏛️',
}

export interface VaultEntry {
  id: string
  title: string
  year: number
  primaryEra: '60s' | '70s' | '80s' | '90s' | '00s' | '10s' | '20s' | 'present'
  body: string
  mediaType: 'photo' | 'video' | 'mixed'
  mediaUrls: Array<{ url: string; metadata: { width: number; height: number } }>
  videoEmbeds: string[]
  photographerCredit: string
  photographerId?: string
  isArchival: boolean
  contributorUid: string
  visibility: 'public' | 'private'
  tags: string[]
  createdAt: Timestamp
  updatedAt: Timestamp
}

export const VAULT_ENTRIES_PATH = 'spaces/{spaceId}/vault_entries/{entryId}'

export const EVENT_CATEGORIES: Record<string, string> = {
  'Drag Show': '🎭',
  'Live Music': '🎵',
  'Party': '🎉',
  'Pride Event': '🏳️‍🌈',
  'Dance Night': '💃',
  'Art Show': '🎨',
  'Open Mic': '🎤',
  'Bar Night': '🍸',
  'Film Screening': '🎬',
  'Workshop': '📚',
  'Fitness': '🏋️',
  'Dining': '🍽️',
  'Social Meetup': '☕',
  'Gaming': '🎮',
  'Late Night': '🌙',
  'Performance': '🎪',
  'Burlesque': '💋',
  'Live DJ': '🥁',
  'Theater': '🎭',
  'Community Event': '🌈',
}
