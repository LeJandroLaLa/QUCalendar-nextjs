import { Timestamp } from 'firebase/firestore'

// ─────────────────────────────────────────
// USERS
// ─────────────────────────────────────────
export interface QUUser {
  userId: string
  displayName: string
  email: string
  roles: ('admin' | 'organizer' | 'artist' | 'space-manager' | 'user')[]
  bio?: string
  preferredPronouns?: string
  profileImageUrl?: string
  linkedArtistId?: string
  linkedSpaceIds?: string[]
  communityAffiliations?: string[]
  isProfilePublic: boolean
  notes?: string
  city?: string
  createdAt: Timestamp
  lastLoginAt?: Timestamp
  deletedAt?: Timestamp | null
}

// ─────────────────────────────────────────
// SPACES (formerly Venues)
// ─────────────────────────────────────────
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

export interface Space {
  id: string
  name: string
  type?: SpaceType
  description?: string
  address?: string
  addressLine1?: string
  city?: string
  state?: string
  zipCode?: string
  country?: string
  latitude?: number
  longitude?: number
  imageUrl?: string
  logoUrl?: string
  website?: string
  phone?: string
  contactEmail?: string
  capacity?: number
  amenities?: string[]
  accessibilityInfo?: string
  parkingInfo?: string
  transitInfo?: string
  hours?: Record<string, string>
  socialLinks?: Record<string, string>
  ownerUid: string
  spaceManagerIds?: string[]
  braveSpace: boolean
  status?: 'unverified' | 'pending' | 'approved' | 'rejected'
  inMemoriam?: boolean
  closedDate?: string
  memoriamNote?: string
  createdAt?: Timestamp
  updatedAt?: Timestamp
  deletedAt?: Timestamp | null
}

// ─────────────────────────────────────────
// ARTISTS
// ─────────────────────────────────────────
export interface Artist {
  id: string
  name: string
  type?: string
  genre?: string
  bio?: string
  profileImageUrl?: string
  coverPhotoUrl?: string
  imageUrl?: string
  website?: string
  socialLinks?: Record<string, string>
  contactEmail?: string
  city?: string
  status?: 'invited' | 'pending' | 'approved' | 'rejected'
  invitedBy?: string
  approvedBy?: string
  inviteToken?: string
  joinedAt?: Timestamp
  managedByUserId?: string
  inMemoriam?: boolean
  memoriamNote?: string
  createdAt?: Timestamp
  updatedAt?: Timestamp
  deletedAt?: Timestamp | null
}

// ─────────────────────────────────────────
// EVENTS
// ─────────────────────────────────────────
export interface UnregisteredPerformer {
  name: string
  website?: string
  role?: string
}

export interface Vendor {
  name: string
  type?: string
  link?: string
}

export interface QUEvent {
  id: string
  title: string
  description?: string
  date: string
  endDate?: string
  time?: string
  endTime?: string
  venue?: string
  venueId?: string
  city?: string
  state?: string
  artist?: string
  artistId?: string
  artistIds?: string[]
  unregisteredPerformers?: UnregisteredPerformer[]
  vendors?: Vendor[]
  category?: string
  tags?: string[]
  imageUrl?: string
  ticketLink?: string
  rsvpRequired?: boolean
  capacity?: number
  coverCharge?: number
  coverType?: 'free' | 'suggested' | 'fixed'
  paymentTypes?: string[]
  parkingInfo?: string
  transitInfo?: string
  ageRestriction?: 'All Ages' | '18+' | '21+'
  accessibilityFeatures?: string[]
  isPrivate?: boolean
  lastMinuteStatus?: 'sold-out' | 'canceled' | 'moved' | null
  lastMinuteNote?: string
  status: string
  organizerId?: string
  createdBy?: string
  createdAt?: Timestamp
  updatedAt?: Timestamp
  deletedAt?: Timestamp | null
}

// ─────────────────────────────────────────
// HERITAGE VAULT
// ─────────────────────────────────────────
export interface VaultEntry {
  id: string
  title: string
  year: number
  primaryEra: '60s' | '70s' | '80s' | '90s' | '00s' | '10s' | '20s' | 'present'
  body: string
  mediaType: 'photo' | 'video' | 'mixed'
  mediaUrls: Array<{
    url: string
    metadata: { width: number; height: number }
    masterFileRef?: string
  }>
  videoEmbeds?: string[]
  photographerCredit: string
  photographerId?: string
  photographerUrl?: string
  documentedBy?: string
  documentedByUid?: string
  documentedByUrl?: string
  originalFileUrl?: string
  isArchival: boolean
  contributorUid: string
  visibility: 'public' | 'private'
  tags?: string[]
  neighborhoodTag?: string
  createdAt: Timestamp
  updatedAt: Timestamp
  deletedAt?: Timestamp | null
}

export const VAULT_ENTRIES_PATH = 'spaces/{spaceId}/vault_entries/{entryId}'

// ─────────────────────────────────────────
// EVENT CATEGORIES (kept for backward compatibility with admin pages)
// ─────────────────────────────────────────
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
  'Trans Community': '⚧️',
  'Indigenous': '🪶',
  'Global Majority': '🌍',
  'Giving Back': '🩷',
}

// ─────────────────────────────────────────
// EVENT TAGS
// ─────────────────────────────────────────
export const EVENT_TAGS = {
  performance: {
    label: 'Performance',
    tags: [
      { tag: 'Drag', emoji: '🎭' },
      { tag: 'Burlesque', emoji: '💋' },
      { tag: 'Live Music', emoji: '🎵' },
      { tag: 'Live DJ', emoji: '🎛️' },
      { tag: 'Open Mic', emoji: '🎤' },
      { tag: 'Theater', emoji: '🎪' },
      { tag: 'Comedy', emoji: '😂' },
      { tag: 'Poetry', emoji: '📝' },
      { tag: 'Dance', emoji: '💃' },
    ]
  },
  vibe: {
    label: 'Vibe',
    tags: [
      { tag: 'Nightlife', emoji: '🌙' },
      { tag: 'Late Night', emoji: '🌃' },
      { tag: 'All Ages', emoji: '🌈' },
      { tag: 'Sober Friendly', emoji: '💧' },
      { tag: 'Chill', emoji: '✨' },
      { tag: 'Underground', emoji: '⚡' },
    ]
  },
  spaceType: {
    label: 'Space Type',
    tags: [
      { tag: 'Bar', emoji: '🍺' },
      { tag: 'Club', emoji: '🌟' },
      { tag: 'Restaurant', emoji: '🍽️' },
      { tag: 'Brunch', emoji: '🥞' },
      { tag: 'Outdoor', emoji: '🌳' },
      { tag: 'Pop-Up', emoji: '🎪' },
    ]
  },
  community: {
    label: 'Community',
    tags: [
      { tag: 'Pride', emoji: '🏳️‍🌈' },
      { tag: 'Fundraiser', emoji: '🩷' },
      { tag: 'Workshop', emoji: '📚' },
      { tag: 'Support Group', emoji: '🤝' },
      { tag: 'Social', emoji: '☕' },
      { tag: 'Giving Back', emoji: '💝' },
      { tag: 'Activism', emoji: '✊' },
    ]
  },
  identity: {
    label: 'Identity & Community',
    tags: [
      { tag: 'Trans Community', emoji: '⚧️' },
      { tag: 'Global Majority', emoji: '🌍' },
      { tag: 'Indigenous', emoji: '🌱' },
      { tag: 'Leather & Kink', emoji: '🔗' },
      { tag: 'Bears', emoji: '🐻' },
      { tag: 'Femme', emoji: '👄' },
    ]
  },
  artCulture: {
    label: 'Art & Culture',
    tags: [
      { tag: 'Art Show', emoji: '🎨' },
      { tag: 'Film', emoji: '🎬' },
      { tag: 'Gaming', emoji: '🎮' },
      { tag: 'Fashion', emoji: '👗' },
      { tag: 'Market', emoji: '🛍️' },
    ]
  },
  age: {
    label: 'Age',
    tags: [
      { tag: 'All Ages', emoji: '🌈' },
      { tag: '18+', emoji: '🔞' },
      { tag: '21+', emoji: '🍺' },
    ]
  },
} as const

export type EventTag = string
