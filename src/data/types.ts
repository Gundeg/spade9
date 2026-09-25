export type Tier = 'GOLD' | 'PLATINUM' | 'BLACK'

export type ServiceCategory = 'Hair' | 'Beard' | 'Color'

export interface Service {
  id: string
  name: string
  category: ServiceCategory
  priceFrom: number
  durationMin: number
  description: string
}

export interface PortfolioItem {
  id: string
  title: string
  tags: string[]
  /** Real photography URL. When absent, a styled placeholder is rendered. */
  src?: string
  hue: number
}

export interface Barber {
  id: string
  name: string
  title: string
  years: number
  specialties: string[]
  bio: string
  portfolio: PortfolioItem[]
  /** Working hours, 24h clock. */
  shift: { start: number; end: number; daysOff: number[] }
}

export interface Booking {
  id: string
  barberId: string
  serviceIds: string[]
  start: string // ISO
  durationMin: number
  status: 'confirmed' | 'cancelled' | 'completed'
  privateSuite?: boolean
}

export interface ChemicalLog {
  date: string
  service: string
  formula: string
  hex: string
  barberId: string
}

export interface VisitPhoto {
  id: string
  date: string
  label: string
  hue: number
  src?: string
}

export interface StylistNote {
  date: string
  barberId: string
  note: string
  nextVisit: string
}

export interface HairProfile {
  hairType: string
  density: string
  growthPattern: string
  scalp: string
  favoriteStyles: string[]
  chemicalLogs: ChemicalLog[]
  photos: VisitPhoto[]
  notes: StylistNote[]
}

export interface Member {
  id: string
  firstName: string
  lastName: string
  email: string
  phone: string
  memberSince: number
  points: number
  lifetimeSpend: number
  preferredBarberId: string
  usualServiceIds: string[]
  birthday: string
  preferences: {
    pushNotifications: boolean
    emailNotifications: boolean
    haptics: boolean
    drink: string
  }
  hair: HairProfile
}

export interface AppNotification {
  id: string
  kind: 'color-refresh' | 'stylist-availability' | 'booking' | 'offer'
  title: string
  body: string
  createdAt: string
  read: boolean
}
