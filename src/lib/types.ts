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
}

export interface Venue {
  id: string
  name: string
  type?: VenueType
  address?: string
  description?: string
  imageUrl?: string
  website?: string
  phone?: string
  amenities?: string[]
  status?: string
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
  status?: string
}

export type VenueType =
  | 'Restaurant'
  | 'Theatre'
  | 'Events Space'
  | 'Bar'
  | 'Night Club'
  | 'Park / Public Space'
  | 'Community Center'
  | 'Gallery / Museum'
  | 'Private Venue'

export const VENUE_TYPES: Record<VenueType, string> = {
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
