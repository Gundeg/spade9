import type { Barber, Booking } from '../data/types'

export const SLOT_MINUTES = 30

export interface Slot {
  start: Date
  available: boolean
}

const overlaps = (aStart: number, aEnd: number, bStart: number, bEnd: number) => aStart < bEnd && bStart < aEnd

/**
 * Deterministic pseudo-occupancy so the demo grid looks like a real shop.
 * Replace with the booking API's availability endpoint in production.
 */
export function isExternallyBooked(barberId: string, t: Date): boolean {
  const seed = `${barberId}-${t.getFullYear()}-${t.getMonth()}-${t.getDate()}-${t.getHours()}-${t.getMinutes()}`
  let h = 0
  for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) | 0
  const busyness = t.getDay() === 2 && t.getHours() < 12 ? 0.1 : 0.45 // Tuesday mornings are a dead zone
  return (Math.abs(h) % 100) / 100 < busyness
}

export function slotsForDay(
  barber: Barber,
  day: Date,
  durationMin: number,
  bookings: Booking[],
  now: Date = new Date(),
  excludeBookingId?: string,
): Slot[] {
  if (barber.shift.daysOff.includes(day.getDay())) return []
  const own = bookings.filter((b) => b.barberId === barber.id && b.status === 'confirmed' && b.id !== excludeBookingId)
  const slots: Slot[] = []
  const endOfShift = new Date(day)
  endOfShift.setHours(barber.shift.end, 0, 0, 0)
  for (let m = barber.shift.start * 60; m + durationMin <= barber.shift.end * 60; m += SLOT_MINUTES) {
    const start = new Date(day)
    start.setHours(Math.floor(m / 60), m % 60, 0, 0)
    const end = start.getTime() + durationMin * 60_000
    let available = start > now
    // Every 30-min block the service spans must be free.
    for (let t = start.getTime(); available && t < end; t += SLOT_MINUTES * 60_000) {
      if (isExternallyBooked(barber.id, new Date(t))) available = false
    }
    if (available && own.some((b) => {
      const bs = new Date(b.start).getTime()
      return overlaps(start.getTime(), end, bs, bs + b.durationMin * 60_000)
    })) available = false
    slots.push({ start, available })
  }
  return slots
}

export function nextAvailable(barber: Barber, durationMin: number, bookings: Booking[], now = new Date(), horizonDays = 21): Date | null {
  for (let d = 0; d < horizonDays; d++) {
    const day = new Date(now)
    day.setDate(day.getDate() + d)
    day.setHours(0, 0, 0, 0)
    const slot = slotsForDay(barber, day, durationMin, bookings, now).find((s) => s.available)
    if (slot) return slot.start
  }
  return null
}
