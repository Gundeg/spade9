import { describe, expect, it } from 'vitest'
import { priceFor, tierFor, tierProgress } from '../loyalty'

describe('loyalty', () => {
  it('assigns tiers by points', () => {
    expect(tierFor(0).tier).toBe('GOLD')
    expect(tierFor(1999).tier).toBe('GOLD')
    expect(tierFor(2000).tier).toBe('PLATINUM')
    expect(tierFor(2450).tier).toBe('PLATINUM')
    expect(tierFor(5000).tier).toBe('BLACK')
  })

  it('computes progress to the next tier', () => {
    const p = tierProgress(2450)
    expect(p.next?.tier).toBe('BLACK')
    expect(p.remaining).toBe(2550)
    expect(p.progress).toBeCloseTo(450 / 3000)
    expect(tierProgress(9000)).toEqual({ progress: 1, remaining: 0, next: null })
  })

  it('applies tier discount', () => {
    expect(priceFor(100, 0)).toBe(95)
    expect(priceFor(100, 2000)).toBe(90)
    expect(priceFor(110, 6000)).toBe(93.5)
  })
})
