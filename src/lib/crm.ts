import type { AppNotification, Barber, Booking, Member, Tier } from '../data/types'
import { isExternallyBooked, slotsForDay } from './availability'
import { tierFor } from './loyalty'

export const COLOR_REFRESH_DAYS = 42 // 6 weeks
const DAY = 86_400_000

export const TEMPLATES = {
  colorRefresh: () =>
    'Таны сүүлд хийлгэсэн color treatment-ээс хойш 6 долоо хоног болжээ. Үсээ refresh хийх цаг болсон байна ✨',
  stylistAvailability: (stylist: string, slots: number) =>
    `Таны дуртай stylist ${stylist}-ийн энэ долоо хоногт ${slots} VIP slot нээгдлээ.`,
}

const COLOR_SERVICES = new Set(['color-blend', 'color-refresh'])

/** Fires when the last chemical service is ≥ 6 weeks old and no color visit is already booked. */
export function colorRefreshTrigger(member: Member, bookings: Booking[], now = new Date()): AppNotification | null {
  const last = member.hair.chemicalLogs.map((l) => new Date(l.date).getTime()).sort((a, b) => b - a)[0]
  if (last === undefined) return null
  const days = Math.floor((now.getTime() - last) / DAY)
  if (days < COLOR_REFRESH_DAYS) return null
  const colorBooked = bookings.some(
    (b) => b.status === 'confirmed' && new Date(b.start) > now && b.serviceIds.some((s) => COLOR_SERVICES.has(s)),
  )
  if (colorBooked) return null
  return {
    id: `color-refresh-${new Date(last).toISOString().slice(0, 10)}`,
    kind: 'color-refresh',
    title: 'Color refresh',
    body: TEMPLATES.colorRefresh(),
    createdAt: now.toISOString(),
    read: false,
  }
}

/**
 * VIP slots = open slots during the VIP windows (before 10:00 or from 18:00) in the next 7 days.
 * Fires when the member's preferred stylist has at least one.
 */
export function stylistAvailabilityTrigger(
  member: Member,
  barbers: Barber[],
  bookings: Booking[],
  now = new Date(),
): AppNotification | null {
  const barber = barbers.find((b) => b.id === member.preferredBarberId)
  if (!barber) return null
  let count = 0
  for (let d = 0; d < 7; d++) {
    const day = new Date(now)
    day.setDate(day.getDate() + d)
    day.setHours(0, 0, 0, 0)
    count += slotsForDay(barber, day, 60, bookings, now).filter(
      (s) => s.available && s.start.getMinutes() === 0 && (s.start.getHours() < 11 || s.start.getHours() >= 18),
    ).length
  }
  if (count === 0) return null
  const slots = Math.min(count, 2) // only a handful are ever released as "VIP" to preserve scarcity
  return {
    id: `stylist-${barber.id}-${now.toISOString().slice(0, 10)}`,
    kind: 'stylist-availability',
    title: `${barber.name} — VIP slots`,
    body: TEMPLATES.stylistAvailability(barber.name, slots),
    createdAt: now.toISOString(),
    read: false,
  }
}

export interface OccupancyWindow {
  day: number // 0=Sun
  label: string
  startHour: number
  endHour: number
  occupancy: number // 0–1
}

const WEEKDAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']

/** Aggregates occupancy per weekday × part-of-day over the next week across all barbers. */
export function occupancyWindows(barbers: Barber[], now = new Date()): OccupancyWindow[] {
  const parts = [
    { label: 'morning', startHour: 9, endHour: 12 },
    { label: 'afternoon', startHour: 12, endHour: 16 },
    { label: 'evening', startHour: 16, endHour: 20 },
  ]
  const out: OccupancyWindow[] = []
  for (let d = 1; d <= 7; d++) {
    const day = new Date(now)
    day.setDate(day.getDate() + d)
    day.setHours(0, 0, 0, 0)
    for (const p of parts) {
      let total = 0
      let busy = 0
      for (const b of barbers) {
        if (b.shift.daysOff.includes(day.getDay())) continue
        for (let h = Math.max(p.startHour, b.shift.start); h < Math.min(p.endHour, b.shift.end); h++) {
          for (const m of [0, 30]) {
            const t = new Date(day)
            t.setHours(h, m, 0, 0)
            total++
            if (isExternallyBooked(b.id, t)) busy++
          }
        }
      }
      if (total) out.push({ day: day.getDay(), label: `${WEEKDAYS[day.getDay()]} ${p.label}`, startHour: p.startHour, endHour: p.endHour, occupancy: busy / total })
    }
  }
  return out
}

export interface CampaignSend {
  memberId: string
  tier: Tier
  window: string
  sendAfterMinutes: number
}

/** Tier priority: Black gets first look, Platinum 2h later. Gold is not targeted by dead-zone pushes. */
export const TIER_HEAD_START: Partial<Record<Tier, number>> = { BLACK: 0, PLATINUM: 120 }

export function lowOccupancyCampaign(
  members: Pick<Member, 'id' | 'points'>[],
  windows: OccupancyWindow[],
  threshold = 0.3,
): CampaignSend[] {
  const dead = windows.filter((w) => w.occupancy < threshold)
  const sends: CampaignSend[] = []
  for (const w of dead) {
    for (const m of members) {
      const tier = tierFor(m.points).tier
      const delay = TIER_HEAD_START[tier]
      if (delay === undefined) continue
      sends.push({ memberId: m.id, tier, window: w.label, sendAfterMinutes: delay })
    }
  }
  return sends.sort((a, b) => a.sendAfterMinutes - b.sendAfterMinutes)
}

export function runMemberTriggers(member: Member, barbers: Barber[], bookings: Booking[], now = new Date()): AppNotification[] {
  return [colorRefreshTrigger(member, bookings, now), stylistAvailabilityTrigger(member, barbers, bookings, now)].filter(
    (n): n is AppNotification => n !== null,
  )
}
