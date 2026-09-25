import { describe, expect, it } from 'vitest'
import { BARBERS, DEMO_MEMBER } from '../../data/mock'
import type { Booking, Member } from '../../data/types'
import { colorRefreshTrigger, lowOccupancyCampaign, occupancyWindows, stylistAvailabilityTrigger, TEMPLATES } from '../crm'

const now = new Date(2026, 9, 1, 9, 0)
const withLastColor = (daysAgo: number): Member => ({
  ...DEMO_MEMBER,
  hair: { ...DEMO_MEMBER.hair, chemicalLogs: [{ ...DEMO_MEMBER.hair.chemicalLogs[0], date: new Date(now.getTime() - daysAgo * 86_400_000).toISOString() }] },
})

describe('color refresh trigger', () => {
  it('does not fire before 6 weeks', () => {
    expect(colorRefreshTrigger(withLastColor(41), [], now)).toBeNull()
  })

  it('fires at 6 weeks with the Mongolian template', () => {
    const n = colorRefreshTrigger(withLastColor(42), [], now)
    expect(n?.body).toBe('Таны сүүлд хийлгэсэн color treatment-ээс хойш 6 долоо хоног болжээ. Үсээ refresh хийх цаг болсон байна ✨')
  })

  it('is suppressed when a color visit is already booked', () => {
    const b: Booking = { id: 'b', barberId: 'sarah', serviceIds: ['color-blend'], start: new Date(now.getTime() + 86_400_000).toISOString(), durationMin: 90, status: 'confirmed' }
    expect(colorRefreshTrigger(withLastColor(50), [b], now)).toBeNull()
  })
})

describe('stylist availability trigger', () => {
  it('uses the preferred stylist and the template', () => {
    const n = stylistAvailabilityTrigger(DEMO_MEMBER, BARBERS, [], now)
    expect(n).not.toBeNull()
    expect(n!.body).toMatch(/^Таны дуртай stylist Sarah-ийн энэ долоо хоногт [12] VIP slot нээгдлээ\.$/)
    expect(TEMPLATES.stylistAvailability('Sarah', 2)).toBe('Таны дуртай stylist Sarah-ийн энэ долоо хоногт 2 VIP slot нээгдлээ.')
  })
})

describe('low-occupancy campaign', () => {
  it('flags Tuesday morning as a dead zone', () => {
    const tue = occupancyWindows(BARBERS, now).find((w) => w.label === 'Tuesday morning')!
    expect(tue.occupancy).toBeLessThan(0.3)
  })

  it('targets Black first, then Platinum, and skips Gold', () => {
    const sends = lowOccupancyCampaign(
      [{ id: 'g', points: 100 }, { id: 'p', points: 2500 }, { id: 'b', points: 6000 }],
      [{ day: 2, label: 'Tuesday morning', startHour: 9, endHour: 12, occupancy: 0.1 }],
    )
    expect(sends.map((s) => s.memberId)).toEqual(['b', 'p'])
    expect(sends[0].sendAfterMinutes).toBeLessThan(sends[1].sendAfterMinutes)
  })
})
