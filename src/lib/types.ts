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
  identityTags?: string[]
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
  liveShow: {
    label: 'Live Show',
    emoji: '🎭',
    tags: [
      { tag: 'Drag', emoji: '🎭' },
      { tag: 'Burlesque', emoji: '💋' },
      { tag: 'Comedy', emoji: '😂' },
      { tag: 'Pageant', emoji: '👠' },
      { tag: 'Theater', emoji: '🎪' },
      { tag: 'Poetry', emoji: '📝' },
      { tag: 'Hosting', emoji: '🎤' },
      { tag: 'Brunch', emoji: '🍳' },
    ]
  },
  music: {
    label: 'Music',
    emoji: '🎵',
    tags: [
      { tag: 'Singer-Songwriter', emoji: '🎸' },
      { tag: 'Band', emoji: '🎶' },
      { tag: 'Jazz', emoji: '🎺' },
      { tag: 'Blues', emoji: '🎸' },
      { tag: 'Folk', emoji: '🪕' },
      { tag: 'Classical', emoji: '🎻' },
      { tag: 'Electronic', emoji: '🔊' },
      { tag: 'Hip-Hop', emoji: '🎧' },
      { tag: 'R&B', emoji: '🎙️' },
    ]
  },
  dancing: {
    label: 'Dancing',
    emoji: '💃',
    tags: [
      { tag: 'DJ', emoji: '🎛️' },
      { tag: 'House', emoji: '🏠' },
      { tag: 'Techno', emoji: '⚡' },
      { tag: 'Underground', emoji: '🔦' },
      { tag: 'Ballroom', emoji: '💫' },
      { tag: 'Late-Night', emoji: '🌃' },
    ]
  },
  community: {
    label: 'Community',
    emoji: '🤝',
    tags: [
      { tag: 'Pride', emoji: '🏳️‍🌈' },
      { tag: 'Workshop', emoji: '📚' },
      { tag: 'Support', emoji: '🤝' },
      { tag: 'Activism', emoji: '✊' },
      { tag: 'Fundraiser', emoji: '🩷' },
      { tag: 'Networking', emoji: '🌐' },
      { tag: 'Social', emoji: '☕' },
    ]
  },
  arts: {
    label: 'Arts',
    emoji: '🎨',
    tags: [
      { tag: 'Gallery', emoji: '🖼️' },
      { tag: 'Film', emoji: '🎬' },
      { tag: 'Fashion', emoji: '👗' },
      { tag: 'Market', emoji: '🛍️' },
      { tag: 'Gaming', emoji: '🎮' },
      { tag: 'Spoken-Word', emoji: '🗣️' },
    ]
  },
} as const

export const SPACE_TYPE_FILTERS = [
  { tag: 'Bar', emoji: '🍺' },
  { tag: 'Club', emoji: '🌟' },
  { tag: 'Restaurant', emoji: '🍽️' },
  { tag: 'Outdoor', emoji: '🌳' },
  { tag: 'Theater', emoji: '🎭' },
  { tag: 'Community-Center', emoji: '🏛️' },
  { tag: 'Pop-Up', emoji: '🎪' },
] as const

export const AGE_FILTERS = ['All Ages', '18+', '21+'] as const

export const IDENTITY_FILTERS = [
  { tag: 'Trans', emoji: '⚧️' },
  { tag: 'Global-Majority', emoji: '🌍' },
  { tag: 'Indigenous', emoji: '🌱' },
  { tag: 'Sober', emoji: '💧' },
  { tag: 'Bears', emoji: '🐻' },
  { tag: 'Femme', emoji: '👄' },
  { tag: 'Leather', emoji: '🔗' },
] as const

export type EventTag = string

// ─────────────────────────────────────────
// ARTISTS (PUBLIC / PRIVATE SPLIT)
// ─────────────────────────────────────────
export interface PublicArtist {
  id: string
  displayName: string
  businessName?: string
  useBusinessName: boolean
  bio?: string
  imageUrl?: string
  socialLinks?: Record<string, string>
  city?: string
  status?: 'invited' | 'pending' | 'approved' | 'rejected'
}

export interface PrivateArtistData {
  legalName?: string
  email?: string
  phone?: string
  paymentInfo?: string
  notes?: string
}

// ─────────────────────────────────────────
// ROSTER
// ─────────────────────────────────────────
export type RosterParticipantType = 'performer' | 'merchant' | 'presenter'

export interface RosterEntry {
  id: string
  participantId: string
  participantType: RosterParticipantType
  displayName: string
  imageUrl?: string
  order: number
  confirmedAt?: Timestamp
  addedBy?: string
}

export const ROSTER_SECTION_LABELS: Record<RosterParticipantType, string> = {
  performer: 'Live Performances',
  merchant: 'Artist Market',
  presenter: 'Featured Presenters',
}
