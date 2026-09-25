import { useId } from 'react'

const PATHS = {
  home: 'M3 10.5 12 3l9 7.5V20a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z',
  book: 'M7 3v3M17 3v3M4 8h16M5 5h14a1 1 0 0 1 1 1v13a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1zM12 12v4M10 14h4',
  hair: 'M6 4c3 0 4 3 4 6s-2 5-2 8M12 4c3 0 4 3 4 6s-2 5-2 8M18 4c1 2 2 4 1 7',
  rewards: 'M3 7h18v12a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1zM3 11h18M7 15h4',
  profile: 'M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM4 21c0-4 4-6 8-6s8 2 8 6',
  bell: 'M6 16V11a6 6 0 1 1 12 0v5l2 2H4zM10 20a2 2 0 0 0 4 0',
  close: 'M6 6l12 12M18 6 6 18',
  left: 'M15 5l-7 7 7 7',
  right: 'M9 5l7 7-7 7',
  check: 'M5 12l5 5 9-10',
  glass: 'M7 3h10l-1 8a4 4 0 0 1-8 0zM12 15v6M8 21h8',
  sofa: 'M4 11V8a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v3M3 11h18v6H3zM5 17v3M19 17v3',
  card: 'M3 6h18v12H3zM3 10h18',
  spark: 'M12 3v4M12 17v4M3 12h4M17 12h4M6 6l2.5 2.5M15.5 15.5 18 18M6 18l2.5-2.5M15.5 8.5 18 6',
  archive: 'M4 4h16v4H4zM5 8h14v11a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1zM10 12h4',
  clock: 'M12 7v5l3 2M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18z',
  repeat: 'M4 12a8 8 0 0 1 14-5l2 2M20 12a8 8 0 0 1-14 5l-2-2M20 4v5h-5M4 20v-5h5',
  logout: 'M15 4h4a1 1 0 0 1 1 1v14a1 1 0 0 1-1 1h-4M10 16l-4-4 4-4M6 12h10',
} as const

export type IconName = keyof typeof PATHS

export function Icon({ name, size = 20 }: { name: IconName; size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d={PATHS[name]} />
    </svg>
  )
}

export function Spade({ size = 22 }: { size?: number }) {
  // Unique per instance: a gradient defined inside a display:none subtree won't paint elsewhere.
  const id = useId()
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" aria-hidden="true">
      <defs>
        <linearGradient id={id} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#F1D77A" />
          <stop offset=".5" stopColor="#D4AF37" />
          <stop offset="1" stopColor="#9C7C1F" />
        </linearGradient>
      </defs>
      <path d="M32 6c-8 11-20 17-20 28a10 10 0 0 0 17 7.2L26.5 58h11L35 41.2A10 10 0 0 0 52 34C52 23 40 17 32 6z" fill={`url(#${id})`} />
    </svg>
  )
}
