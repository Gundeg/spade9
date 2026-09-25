import { describe, expect, it } from 'vitest'
import { BARBERS } from '../../data/mock'
import type { Booking } from '../../data/types'
import { nextAvailable, slotsForDay } from '../availability'

const sarah = BARBERS.find((b) => b.id === 'sarah')!
// Wednesday 2026-10-07; Sarah works Tue–Sat 10–19.
const day = new Date(2026, 9, 7)
const past = new Date(2026, 9, 1)

describe('availability', () => {
  it('returns nothing on a day off', () => {
    expect(slotsForDay(sarah, new Date(2026, 9, 4), 60, [], past)).toEqual([]) // Sunday
  })

  it('never lets a service run past the end of the shift', () => {
    const slots = slotsForDay(sarah, day, 90, [], past)
    const last = slots[slots.length - 1].start
    expect(last.getHours() * 60 + last.getMinutes() + 90).toBeLessThanOrEqual(19 * 60)
  })

  it('blocks slots overlapping an existing member booking', () => {
    const free = slotsForDay(sarah, day, 30, [], past).find((s) => s.available)!
    const booking: Booking = { id: 'x', barberId: 'sarah', serviceIds: [], start: free.start.toISOString(), durationMin: 30, status: 'confirmed' }
    const after = slotsForDay(sarah, day, 30, [booking], past).find((s) => +s.start === +free.start)!
    expect(after.available).toBe(false)
    // …unless that booking is the one being rescheduled
    const self = slotsForDay(sarah, day, 30, [booking], past, 'x').find((s) => +s.start === +free.start)!
    expect(self.available).toBe(true)
  })

  it('marks past slots unavailable', () => {
    const now = new Date(2026, 9, 7, 15, 0)
    expect(slotsForDay(sarah, day, 30, [], now).filter((s) => s.start < now).every((s) => !s.available)).toBe(true)
  })

  it('finds the next available slot', () => {
    const n = nextAvailable(sarah, 60, [], past)
    expect(n).not.toBeNull()
    expect(n!.getTime()).toBeGreaterThan(past.getTime())
  })
})
