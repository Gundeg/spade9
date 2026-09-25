import type { Tier } from '../data/types'

export interface TierInfo {
  tier: Tier
  minPoints: number
  discount: number
  benefits: string[]
}

/** Point thresholds are a product decision the PRD leaves open; adjust here only. */
export const TIERS: TierInfo[] = [
  { tier: 'GOLD', minPoints: 0, discount: 0.05, benefits: ['5% discount', 'Birthday gift', 'Priority booking access'] },
  { tier: 'PLATINUM', minPoints: 2000, discount: 0.1, benefits: ['10% discount', 'Free treatment (сард 1 удаа)', 'Priority appointments', 'VIP-only offers'] },
  { tier: 'BLACK', minPoints: 5000, discount: 0.15, benefits: ['15% discount', 'Private appointment options', 'Free premium treatments', 'Stylist priority', 'Special event invitations'] },
]

/** 1 point per $1 spent. */
export const POINTS_PER_DOLLAR = 1

export function tierFor(points: number): TierInfo {
  let current = TIERS[0]
  for (const t of TIERS) if (points >= t.minPoints) current = t
  return current
}

export function nextTier(points: number): TierInfo | null {
  return TIERS.find((t) => t.minPoints > points) ?? null
}

/** Progress (0–1) from the current tier's floor to the next tier's floor. */
export function tierProgress(points: number): { progress: number; remaining: number; next: TierInfo | null } {
  const cur = tierFor(points)
  const nxt = nextTier(points)
  if (!nxt) return { progress: 1, remaining: 0, next: null }
  const span = nxt.minPoints - cur.minPoints
  return { progress: (points - cur.minPoints) / span, remaining: nxt.minPoints - points, next: nxt }
}

export function priceFor(base: number, points: number): number {
  return Math.round(base * (1 - tierFor(points).discount) * 100) / 100
}
