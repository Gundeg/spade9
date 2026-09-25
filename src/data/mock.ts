import type { Barber, Booking, Member, Service } from './types'

export const SERVICES: Service[] = [
  { id: 'signature-cut', name: 'The Signature Haircut', category: 'Hair', priceFrom: 65, durationMin: 60, description: 'Consultation, precision cut, hot towel finish and styling.' },
  { id: 'kids-cut', name: 'Heritage Cut (Under 12)', category: 'Hair', priceFrom: 40, durationMin: 40, description: 'A gentleman in the making. Classic cut with a calm hand.' },
  { id: 'beard-sculpt', name: 'Precision Beard Trim & Sculpt', category: 'Beard', priceFrom: 45, durationMin: 40, description: 'Line work, shaping and conditioning oil ritual.' },
  { id: 'hot-towel-shave', name: 'Executive Hot Towel Shave', category: 'Beard', priceFrom: 55, durationMin: 45, description: 'Straight-razor shave with pre-shave oil, three towels and balm.' },
  { id: 'color-blend', name: 'Advanced Color & Grey Blending', category: 'Color', priceFrom: 130, durationMin: 90, description: 'Natural grey blending or full color with a recorded formula.' },
  { id: 'color-refresh', name: 'Color Refresh Gloss', category: 'Color', priceFrom: 70, durationMin: 45, description: 'Tone refresh built on your archived formula.' },
]

/** The four services the PRD shows publicly on the landing page. */
export const PUBLIC_SERVICE_IDS = ['signature-cut', 'beard-sculpt', 'hot-towel-shave', 'color-blend']

const port = (prefix: string, items: [string, string[], number][]) =>
  items.map(([title, tags, hue], i) => ({ id: `${prefix}-${i}`, title, tags, hue }))

export const BARBERS: Barber[] = [
  {
    id: 'sarah',
    name: 'Sarah',
    title: 'Master Colorist',
    years: 11,
    specialties: ['Grey Blending', 'Classic Taper', 'Color'],
    bio: 'Trained in London and Milan. Sarah builds color that looks like it was never done.',
    shift: { start: 10, end: 19, daysOff: [0, 1] },
    portfolio: port('sarah', [
      ['Silver fox blend', ['Grey Blending'], 40],
      ['Executive taper', ['Classic Taper'], 30],
      ['Ash tone refresh', ['Grey Blending', 'Color'], 210],
      ['Side part, soft taper', ['Classic Taper'], 25],
      ['Espresso gloss', ['Color'], 20],
      ['Low taper, textured top', ['Classic Taper', 'Texture'], 35],
    ]),
  },
  {
    id: 'bat',
    name: 'Bat-Erdene',
    title: 'Master Barber',
    years: 14,
    specialties: ['Skin Fade', 'Hot Towel Shave', 'Beard Sculpt'],
    bio: 'Fourteen years behind the chair. The straight razor is his signature.',
    shift: { start: 9, end: 18, daysOff: [0] },
    portfolio: port('bat', [
      ['Mid skin fade', ['Skin Fade'], 45],
      ['Sculpted full beard', ['Beard Sculpt'], 15],
      ['High skin fade, crop', ['Skin Fade', 'Texture'], 50],
      ['Straight-razor finish', ['Beard Sculpt'], 10],
      ['Drop fade', ['Skin Fade'], 42],
    ]),
  },
  {
    id: 'marcus',
    name: 'Marcus',
    title: 'Senior Stylist',
    years: 8,
    specialties: ['Classic Taper', 'Pompadour', 'Texture'],
    bio: 'Mid-century shapes cut for a modern face. Every pompadour is architecture.',
    shift: { start: 11, end: 20, daysOff: [2] },
    portfolio: port('marcus', [
      ['Modern pompadour', ['Pompadour'], 28],
      ['Ivy league', ['Classic Taper'], 33],
      ['Textured quiff', ['Texture', 'Pompadour'], 38],
      ['Slick back, low taper', ['Classic Taper'], 22],
    ]),
  },
  {
    id: 'temuulen',
    name: 'Temuulen',
    title: 'Fade Specialist',
    years: 6,
    specialties: ['Skin Fade', 'Texture', 'Design'],
    bio: 'Clean gradients and sharp lines. Precise down to the millimetre.',
    shift: { start: 10, end: 20, daysOff: [3] },
    portfolio: port('temu', [
      ['Burst fade', ['Skin Fade'], 48],
      ['Textured fringe', ['Texture'], 36],
      ['Taper with line design', ['Skin Fade', 'Design'], 44],
      ['Buzz, skin fade', ['Skin Fade'], 52],
    ]),
  },
]

const daysAgo = (n: number) => new Date(Date.now() - n * 86_400_000).toISOString().slice(0, 10)

export const DEMO_MEMBER: Member = {
  id: 'm-0001',
  firstName: 'Тэмүүжин',
  lastName: 'Бат',
  email: 'member@spade9.mn',
  phone: '+976 9911 2233',
  memberSince: 2026,
  points: 2450,
  lifetimeSpend: 2450,
  preferredBarberId: 'sarah',
  usualServiceIds: ['signature-cut', 'beard-sculpt'],
  birthday: '1988-11-14',
  preferences: { pushNotifications: true, emailNotifications: false, haptics: true, drink: '12-year single malt, neat' },
  hair: {
    hairType: 'Straight, medium-coarse',
    density: 'High at crown, medium at temples',
    growthPattern: 'Double crown (clockwise), forward-growing fringe',
    scalp: 'Normal, slight dryness in winter',
    favoriteStyles: ['Classic Taper', 'Side part', 'Short textured crop'],
    chemicalLogs: [
      { date: daysAgo(44), service: 'Grey Blending', formula: '6N + 7A (1:1), 10 vol, 8 min', hex: '#4B3A2F', barberId: 'sarah' },
      { date: daysAgo(120), service: 'Grey Blending', formula: '6N + 7A (2:1), 10 vol, 10 min', hex: '#4E3B2E', barberId: 'sarah' },
      { date: daysAgo(210), service: 'Espresso Gloss', formula: '5N clear gloss, 5 vol, 15 min', hex: '#3A2A22', barberId: 'sarah' },
    ],
    photos: [
      { id: 'p1', date: daysAgo(44), label: 'After — grey blend, classic taper', hue: 30 },
      { id: 'p2', date: daysAgo(44), label: 'Before — 6 weeks growth', hue: 200 },
      { id: 'p3', date: daysAgo(120), label: 'After — side part', hue: 26 },
      { id: 'p4', date: daysAgo(120), label: 'Before', hue: 210 },
    ],
    notes: [
      { date: daysAgo(44), barberId: 'sarah', note: 'Grey coverage ~40% at temples. Kept blend soft so regrowth line stays invisible.', nextVisit: 'Refresh at 6 weeks; consider 7A only at temples for a lighter blend.' },
      { date: daysAgo(120), barberId: 'sarah', note: 'Crown whorl needs length (≥ 4 cm) to lie flat.', nextVisit: 'Keep crown length. Try a lower taper next time.' },
    ],
  },
}

export function seedBookings(): Booking[] {
  const next = new Date()
  next.setDate(next.getDate() + 3)
  next.setHours(14, 0, 0, 0)
  const past = new Date(Date.now() - 44 * 86_400_000)
  past.setHours(11, 0, 0, 0)
  return [
    { id: 'b-seed-1', barberId: 'sarah', serviceIds: ['signature-cut', 'beard-sculpt'], start: next.toISOString(), durationMin: 100, status: 'confirmed' },
    { id: 'b-seed-0', barberId: 'sarah', serviceIds: ['color-blend', 'signature-cut'], start: past.toISOString(), durationMin: 150, status: 'completed' },
  ]
}

export const FAQ: { q: string; a: string }[] = [
  { q: 'Do I need to be a member to book?', a: 'Guests may book the four public services during standard hours. VIP sessions, the private suite and member pricing are reserved for members.' },
  { q: 'How does membership work?', a: 'Apply online. Our concierge reviews every application within 48 hours. Approved members begin at Gold and progress to Platinum and Black through points.' },
  { q: 'What is your cancellation policy?', a: 'Changes and cancellations are free up to 12 hours before your appointment. Black members may change any time.' },
  { q: 'Is the whiskey bar open to guests?', a: 'The bar is open to members and their accompanied guests during service.' },
  { q: 'Is parking available?', a: 'Valet parking is complimentary for Platinum and Black members.' },
]

export const HOURS = {
  standard: [
    { days: 'Mon – Fri', time: '10:00 – 20:00' },
    { days: 'Saturday', time: '10:00 – 18:00' },
    { days: 'Sunday', time: 'Closed' },
  ],
  vip: [
    { days: 'Mon – Fri', time: '08:00 – 10:00 · 20:00 – 22:00' },
    { days: 'Sunday', time: '12:00 – 17:00 (Black only)' },
  ],
}

export const LOCATION = {
  address: 'Seoul Street 21, Sukhbaatar District, Ulaanbaatar',
  lat: 47.9145,
  lng: 106.9155,
  phone: '+976 7700 9999',
  email: 'concierge@spade9.mn',
}
